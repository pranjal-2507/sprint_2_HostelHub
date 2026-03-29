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
        "SELECT id, room_number, floor, capacity, occupied, room_type, rent, status, created_at FROM rooms WHERE room_number = $1"
    )
    .bind(&room_number)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    let room = room.ok_or((StatusCode::NOT_FOUND, "Room not found".to_string()))?;
    
    if room.occupied >= room.capacity {
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
    sqlx::query("UPDATE rooms SET occupied = occupied + 1 WHERE room_number = $1")
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
        sqlx::query("UPDATE rooms SET occupied = occupied - 1 WHERE room_number = $1")
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