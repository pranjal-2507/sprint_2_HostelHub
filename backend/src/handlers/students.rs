use axum::{extract::{State, Path}, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::RequireAdmin;
use crate::db::AppState;
use crate::models::{User, UserResponse};

pub async fn get_all_students(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<UserResponse>>, (StatusCode, String)> {
    let students: Vec<User> = sqlx::query_as(
        "SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE role = 'hosteler' ORDER BY name"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let student_responses: Vec<UserResponse> = students.into_iter().map(|user| UserResponse {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        course: user.course,
        year: user.year,
        room_number: user.room_number,
    }).collect();

    Ok(Json(student_responses))
}

pub async fn assign_room(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path((student_id, room_number)): Path<(Uuid, String)>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    // Check if room exists and has capacity
    let room: Option<crate::models::Room> = sqlx::query_as(
        "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, price_per_month::FLOAT8, status, created_at FROM rooms WHERE room_number = $1"
    )
    .bind(&room_number)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let room = room.ok_or((StatusCode::NOT_FOUND, "Room not found".to_string()))?;
    
    if room.occupancy.unwrap_or(0) >= room.capacity {
        return Err((StatusCode::BAD_REQUEST, "Room is at full capacity".to_string()));
    }

    // Assign room to student
    let result = sqlx::query("UPDATE users SET room_number = $1 WHERE id = $2 AND role = 'hosteler'")
        .bind(&room_number)
        .bind(student_id)
        .execute(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, "Student not found".to_string()));
    }

    // Update room occupancy
    sqlx::query("UPDATE rooms SET occupancy = occupancy + 1 WHERE room_number = $1")
        .bind(&room_number)
        .execute(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update room occupancy".to_string()))?;

    Ok(Json("Room assigned successfully"))
}

pub async fn remove_student(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(student_id): Path<Uuid>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    // Get student's current room
    let student: Option<User> = sqlx::query_as(
        "SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE id = $1 AND role = 'hosteler'"
    )
    .bind(student_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let student = student.ok_or((StatusCode::NOT_FOUND, "Student not found".to_string()))?;

    // Update room occupancy if student had a room
    if let Some(room_number) = &student.room_number {
        sqlx::query("UPDATE rooms SET occupancy = occupancy - 1 WHERE room_number = $1")
            .bind(room_number)
            .execute(&state.db)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update room occupancy".to_string()))?;
    }

    // Delete student
    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(student_id)
        .execute(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Student not found".to_string()))
    } else {
        Ok(Json("Student removed successfully"))
    }
}

pub async fn get_student_by_id(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(student_id): Path<Uuid>,
) -> Result<Json<UserResponse>, (StatusCode, String)> {
    let user: User = sqlx::query_as(
        "SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE id = $1 AND role = 'hosteler'"
    )
    .bind(student_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "Student not found".to_string()))?;

    Ok(Json(UserResponse {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        course: user.course,
        year: user.year,
        room_number: user.room_number,
    }))
}

pub async fn update_student(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(student_id): Path<Uuid>,
    Json(update): Json<UserResponse>,
) -> Result<Json<UserResponse>, (StatusCode, String)> {
    // 1. Get current student data to check for room change
    let current: User = sqlx::query_as(
        "SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE id = $1 AND role = 'hosteler'"
    )
    .bind(student_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "Student not found".to_string()))?;

    // 2. Handle room occupancy changes if room_number is different
    if current.room_number != update.room_number {
        // Decrease old room occupancy if it existed
        if let Some(old_room) = &current.room_number {
            let _ = sqlx::query("UPDATE rooms SET occupancy = GREATEST(0, occupancy - 1) WHERE room_number = $1")
                .bind(old_room)
                .execute(&state.db)
                .await;
        }

        // Increase new room occupancy if it exists and has space
        if let Some(new_room) = &update.room_number {
            let room_exists = sqlx::query("SELECT 1 FROM rooms WHERE room_number = $1 AND occupancy < capacity")
                .bind(new_room)
                .fetch_optional(&state.db)
                .await
                .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error checking room".to_string()))?;

            if room_exists.is_none() {
                return Err((StatusCode::BAD_REQUEST, "Target room is full or does not exist".to_string()));
            }

            let _ = sqlx::query("UPDATE rooms SET occupancy = occupancy + 1 WHERE room_number = $1")
                .bind(new_room)
                .execute(&state.db)
                .await;
        }
    }

    // 3. Update the student record
    let updated: User = sqlx::query_as(
        r#"
        UPDATE users 
        SET name = $1, email = $2, phone = $3, course = $4, year = $5, room_number = $6
        WHERE id = $7 AND role = 'hosteler'
        RETURNING id, name, email, password_hash, role, phone, course, year, room_number, created_at
        "#
    )
    .bind(&update.name)
    .bind(&update.email)
    .bind(&update.phone)
    .bind(&update.course)
    .bind(update.year)
    .bind(&update.room_number)
    .bind(student_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Update student error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update student".to_string())
    })?;

    Ok(Json(UserResponse {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        course: updated.course,
        year: updated.year,
        room_number: updated.room_number,
    }))
}

pub async fn create_student(
    RequireAdmin(_admin_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<crate::models::RegisterRequest>,
) -> Result<(StatusCode, Json<UserResponse>), (StatusCode, String)> {
    let hashed_password = crate::auth::service::hash_password(&payload.password);
    let user_id = Uuid::new_v4();
    
    // 1. Check if room exists and has capacity (if provided)
    if let Some(room_num) = &payload.room_number {
        let room: Option<crate::models::Room> = sqlx::query_as(
            "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, price_per_month::FLOAT8, status, created_at FROM rooms WHERE room_number = $1"
        )
        .bind(room_num)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error checking room".to_string()))?;

        if let Some(r) = room {
            if r.occupancy.unwrap_or(0) >= r.capacity {
                return Err((StatusCode::BAD_REQUEST, "Selected room is already full".to_string()));
            }
        } else {
            return Err((StatusCode::NOT_FOUND, "Selected room number does not exist".to_string()));
        }
    }

    // 2. Create student
    let result = sqlx::query(
        r#"
        INSERT INTO users (id, name, email, password_hash, role, phone, course, year, room_number, created_at)
        VALUES ($1, $2, $3, $4, 'hosteler', $5, $6, $7, $8, NOW())
        "#
    )
    .bind(user_id)
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&hashed_password)
    .bind(&payload.phone)
    .bind(&payload.course)
    .bind(&payload.year)
    .bind(&payload.room_number)
    .execute(&state.db)
    .await;

    match result {
        Ok(_) => {
            // 3. Update room occupancy if assigned
            if let Some(room_num) = &payload.room_number {
                let _ = sqlx::query("UPDATE rooms SET occupancy = occupancy + 1, status = 'occupied' WHERE room_number = $1")
                    .bind(room_num)
                    .execute(&state.db)
                    .await;
            }

            Ok((StatusCode::CREATED, Json(UserResponse {
                id: user_id,
                name: payload.name,
                email: payload.email,
                role: "hosteler".to_string(),
                phone: payload.phone,
                course: payload.course,
                year: payload.year,
                room_number: payload.room_number,
            })))
        },
        Err(e) => {
            if e.to_string().contains("duplicate key") {
                Err((StatusCode::CONFLICT, "Email already exists".to_string()))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))
            }
        }
    }
}