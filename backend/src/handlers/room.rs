use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;
use sqlx::Postgres;

use crate::auth::middleware::RequireAdmin;
use crate::db::AppState;
use crate::models::{Room, CreateRoomRequest};

pub async fn get_all_rooms(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Room>>, (StatusCode, String)> {
    let rooms = sqlx::query_as::<Postgres, Room>("SELECT * FROM rooms ORDER BY room_number")
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(rooms))
}

pub async fn get_rooms(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Room>>, (StatusCode, String)> {
    let rooms = sqlx::query_as::<Postgres, Room>("SELECT * FROM rooms WHERE status = 'available' ORDER BY room_number")
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(rooms))
}

#[allow(dead_code)]
pub async fn get_room_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Room>, (StatusCode, String)> {
    let room = sqlx::query_as::<Postgres, Room>("SELECT * FROM rooms WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| (StatusCode::NOT_FOUND, "Room not found".to_string()))?;

    Ok(Json(room))
}

pub async fn create_room(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateRoomRequest>,
) -> Result<(StatusCode, Json<Room>), (StatusCode, String)> {
    let room_id = Uuid::new_v4();
    let room = sqlx::query_as::<Postgres, Room>(
        "INSERT INTO rooms (id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *"
    )
    .bind(room_id)
    .bind(payload.hostel_id)
    .bind(payload.room_number)
    .bind(payload.floor)
    .bind(payload.capacity)
    .bind(0) // Initial occupancy
    .bind(payload.room_type)
    .bind("available") // Default status
    .bind(payload.price_per_month)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

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
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Room not found".to_string()))
    } else {
        Ok(Json("Room deleted successfully"))
    }
}
