use axum::{extract::State, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::{RequireAuth, RequireAdmin};
use crate::db::AppState;
use crate::models::{DashboardStats, HostelerDashboardData, UserResponse, Room, Fee, Complaint, Notice};
use deadpool_redis::redis::AsyncCommands;
use serde_json;

pub async fn get_admin_dashboard_stats(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DashboardStats>, (StatusCode, String)> {
    let cache_key = "admin_dashboard_stats";
    
    // 1. Try to get from Redis (Optional)
    let mut redis_conn = match state.redis.get().await {
        Ok(conn) => Some(conn),
        Err(e) => {
            eprintln!("Redis connection error (stats): {:?}", e);
            None
        }
    };

    if let Some(ref mut conn) = redis_conn {
        if let Ok(cached_data) = conn.get::<_, String>(cache_key).await {
            if let Ok(stats) = serde_json::from_str::<DashboardStats>(&cached_data) {
                println!("✓ Admin stats cache hit!");
                return Ok(Json(stats));
            }
        }
    }

    println!("Cache miss or Redis down. Fetching admin dashboard stats from DB...");
    
    let total_students: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM users WHERE role = 'hosteler'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error counting students: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    let total_rooms: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM rooms"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error counting rooms: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    let occupied_rooms: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM rooms WHERE occupancy > 0"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error counting occupied rooms: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    let pending_payments: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM fees WHERE status = 'pending'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error counting pending payments: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    let active_complaints: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM complaints WHERE status != 'resolved'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error counting active complaints: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    let overdue_payments: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM fees WHERE status = 'overdue'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error counting overdue payments: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    // Use fetch_optional to avoid 500 if maintenance_requests table is empty or missing data
    let pending_maintenance: (i64,) = match sqlx::query_as("SELECT COUNT(*) FROM maintenance_requests WHERE status = 'pending'")
        .fetch_one(&state.db).await {
            Ok(v) => v,
            Err(_) => (0,)
        };

    let visitors_checked_in: (i64,) = match sqlx::query_as("SELECT COUNT(*) FROM visitors WHERE exit_time IS NULL")
        .fetch_one(&state.db).await {
            Ok(v) => v,
            Err(_) => (0,)
        };

    println!("Dashboard stats fetched successfully: Students={}, Rooms={}, Occupied={}", total_students.0, total_rooms.0, occupied_rooms.0);

    let stats = DashboardStats {
        total_students: total_students.0,
        total_rooms: total_rooms.0,
        occupied_rooms: occupied_rooms.0,
        vacant_rooms: total_rooms.0 - occupied_rooms.0,
        pending_payments: pending_payments.0,
        active_complaints: active_complaints.0,
        overdue_payments: overdue_payments.0,
        pending_maintenance: pending_maintenance.0,
        visitors_checked_in: visitors_checked_in.0,
    };

    // 2. Save to Redis if available
    if let Some(mut conn) = redis_conn {
        if let Ok(json) = serde_json::to_string(&stats) {
            let _: Result<(), _> = conn.set_ex(cache_key, json, 60).await;
        }
    }

    Ok(Json(stats))
}

pub async fn get_hosteler_dashboard(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
) -> Result<Json<HostelerDashboardData>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

    let cache_key = format!("hosteler_dashboard:{}", user_id);
    
    // 1. Try to get from Redis (Optional)
    let mut redis_conn = match state.redis.get().await {
        Ok(conn) => Some(conn),
        Err(e) => {
            eprintln!("Redis connection error (hosteler_stats): {:?}", e);
            None
        }
    };

    if let Some(ref mut conn) = redis_conn {
        if let Ok(cached_data) = conn.get::<_, String>(&cache_key).await {
            if let Ok(data) = serde_json::from_str::<HostelerDashboardData>(&cached_data) {
                println!("✓ Hosteler dashboard cache hit for user {}", user_id);
                return Ok(Json(data));
            }
        }
    }

    println!("Cache miss or Redis down. Fetching hosteler dashboard from DB for user {}...", user_id);

    // Get user info
    let user: crate::models::User = sqlx::query_as(
        "SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE id = $1"
    )
    .bind(uuid)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "User not found".to_string()))?;

    // Get room info if assigned
    let room_info: Option<Room> = if let Some(room_num) = &user.room_number {
        sqlx::query_as(
            "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at FROM rooms WHERE room_number = $1"
        )
        .bind(room_num)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| {
            eprintln!("Error fetching room info: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
        })?
    } else {
        None
    };

    // Get fee status
    let fee_status: Vec<Fee> = sqlx::query_as(
        "SELECT id, student_id, amount::FLOAT8 AS amount, fee_type, due_date, status, payment_date, created_at FROM fees WHERE student_id = $1 ORDER BY created_at DESC LIMIT 5"
    )
    .bind(uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error fetching fee status: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    // Get recent complaints
    let recent_complaints: Vec<Complaint> = sqlx::query_as(
        r#"
        SELECT 
            c.id, c.student_id, u.name as student_name, u.room_number,
            c.title, c.description, c.status, c.priority, c.resolved_at, c.created_at 
        FROM complaints c
        JOIN users u ON c.student_id = u.id
        WHERE c.student_id = $1 
        ORDER BY c.created_at DESC 
        LIMIT 5
        "#
    )
    .bind(uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error fetching complaints: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    // Get recent notices
    let recent_notices: Vec<Notice> = match sqlx::query_as(
        "SELECT id, title, content, category, priority, created_by, created_at FROM notices ORDER BY created_at DESC LIMIT 5"
    )
    .fetch_all(&state.db)
    .await {
        Ok(notices) => notices,
        Err(e) => {
            eprintln!("Error fetching notices (dashboard): {}", e);
            Vec::new() // Fallback to empty
        }
    };

    let dashboard_data = HostelerDashboardData {
        user: UserResponse {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            course: user.course,
            year: user.year,
            room_number: user.room_number,
        },
        room_info,
        fee_status,
        recent_complaints,
        recent_notices,
    };

    // 2. Save to Redis if available
    if let Some(mut conn) = redis_conn {
        if let Ok(json) = serde_json::to_string(&dashboard_data) {
            let _: Result<(), _> = conn.set_ex(&cache_key, json, 60).await;
        }
    }

    Ok(Json(dashboard_data))
}

pub async fn get_hosteler_room_info(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Room>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

    let user: crate::models::User = sqlx::query_as(
        "SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE id = $1"
    )
    .bind(uuid)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "User not found".to_string()))?;

    if let Some(room_num) = &user.room_number {
        let room: Room = sqlx::query_as(
            "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at FROM rooms WHERE room_number = $1"
        )
        .bind(room_num)
        .fetch_one(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Room record not found for assigned room number".to_string()))?;
        
        Ok(Json(room))
    } else {
        Err((StatusCode::NOT_FOUND, "No room assigned to this user".to_string()))
    }
}