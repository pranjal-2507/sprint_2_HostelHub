use axum::{extract::State, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::{RequireAuth, RequireAdmin};
use crate::db::AppState;
use crate::models::{DashboardStats, HostelerDashboardData, UserResponse, Room, Fee, Complaint, Notice};

pub async fn get_admin_dashboard_stats(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<DashboardStats>, (StatusCode, String)> {
    let total_students: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM users WHERE role = 'hosteler'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let total_rooms: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM rooms"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let occupied_rooms: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM rooms WHERE occupied > 0"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let pending_payments: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM fees WHERE status = 'pending'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let active_complaints: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM complaints WHERE status != 'resolved'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let stats = DashboardStats {
        total_students: total_students.0,
        total_rooms: total_rooms.0,
        occupied_rooms: occupied_rooms.0,
        vacant_rooms: total_rooms.0 - occupied_rooms.0,
        pending_payments: pending_payments.0,
        active_complaints: active_complaints.0,
    };

    Ok(Json(stats))
}

pub async fn get_hosteler_dashboard(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
) -> Result<Json<HostelerDashboardData>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

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
            "SELECT id, room_number, floor, capacity, occupied, room_type, rent, status, created_at FROM rooms WHERE room_number = $1"
        )
        .bind(room_num)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?
    } else {
        None
    };

    // Get fee status
    let fee_status: Vec<Fee> = sqlx::query_as(
        "SELECT id, student_id, amount, fee_type, due_date, status, paid_at, created_at FROM fees WHERE student_id = $1 ORDER BY created_at DESC LIMIT 5"
    )
    .bind(uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    // Get recent complaints
    let recent_complaints: Vec<Complaint> = sqlx::query_as(
        "SELECT id, student_id, title, description, status, priority, resolved_at, created_at FROM complaints WHERE student_id = $1 ORDER BY created_at DESC LIMIT 5"
    )
    .bind(uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    // Get recent notices
    let recent_notices: Vec<Notice> = sqlx::query_as(
        "SELECT id, title, content, priority, created_by, created_at FROM notices ORDER BY created_at DESC LIMIT 5"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

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
            "SELECT id, room_number, floor, capacity, occupied, room_type, rent, status, created_at FROM rooms WHERE room_number = $1"
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