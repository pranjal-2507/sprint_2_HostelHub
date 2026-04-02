use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::RequireAdmin;
use crate::db::AppState;
use crate::models::{Room, CreateRoomRequest, UpdateRoomRequest};

pub async fn get_all_rooms(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Room>>, (StatusCode, String)> {
    let rooms = sqlx::query_as::<_, Room>(
        "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at 
         FROM rooms 
         ORDER BY room_number"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error fetching all rooms: {}", e)))?;

    Ok(Json(rooms))
}

pub async fn get_rooms(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Room>>, (StatusCode, String)> {
    let rooms = sqlx::query_as::<_, Room>(
        "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at 
         FROM rooms 
         WHERE status = 'available' 
         ORDER BY room_number"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error fetching available rooms: {}", e)))?;

    Ok(Json(rooms))
}

pub async fn get_room_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Room>, (StatusCode, String)> {
    let room = sqlx::query_as::<_, Room>(
        "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at 
         FROM rooms 
         WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, format!("Room not found: {}", e)))?;

    Ok(Json(room))
}

pub async fn create_room(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateRoomRequest>,
) -> Result<(StatusCode, Json<Room>), (StatusCode, String)> {
    let room_id = Uuid::new_v4();
    let room = sqlx::query_as::<_, Room>(
        "INSERT INTO rooms (id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
         RETURNING id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at"
    )
    .bind(room_id)
    .bind(payload.hostel_id)
    .bind(payload.room_number)
    .bind(payload.floor)
    .bind(payload.capacity)
    .bind(0) // Initial occupancy
    .bind(payload.room_type)
    .bind(payload.status)
    .bind(payload.price_per_month)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error creating room: {}", e)))?;

    Ok((StatusCode::CREATED, Json(room)))
}

pub async fn delete_room(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<Uuid>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let result = sqlx::query("DELETE FROM rooms WHERE id = $1")
        .bind(room_id)
        .execute(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error deleting room: {}", e)))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Room not found".to_string()))
    } else {
        Ok(Json("Room deleted successfully"))
    }
}

pub async fn update_room(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<Uuid>,
    Json(payload): Json<UpdateRoomRequest>,
) -> Result<Json<Room>, (StatusCode, String)> {
    // Current room for fallback
    let current_room = sqlx::query_as::<_, Room>(
        "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at 
         FROM rooms 
         WHERE id = $1"
    )
    .bind(room_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::NOT_FOUND, format!("Room not found: {}", e)))?;

    let room = sqlx::query_as::<_, Room>(
        "UPDATE rooms 
         SET room_number = $1, floor = $2, capacity = $3, room_type = $4, status = $5, price_per_month = $6 
         WHERE id = $7 
         RETURNING id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at"
    )
    .bind(payload.room_number.unwrap_or(current_room.room_number))
    .bind(payload.floor.unwrap_or(current_room.floor))
    .bind(payload.capacity.unwrap_or(current_room.capacity))
    .bind(payload.room_type.unwrap_or(current_room.room_type.unwrap_or_default()))
    .bind(payload.status.unwrap_or(current_room.status.unwrap_or_default()))
    .bind(payload.price_per_month.or(current_room.price_per_month))
    .bind(room_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error updating room: {}", e)))?;

    Ok(Json(room))
}
