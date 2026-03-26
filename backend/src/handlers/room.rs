use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::db::AppState;
use crate::models::Room;

pub async fn get_rooms(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Room>>, StatusCode> {
    let rooms = sqlx::query_as::<_, Room>("SELECT * FROM rooms")
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(rooms))
}

pub async fn get_room_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Room>, StatusCode> {
    let room = sqlx::query_as::<_, Room>("SELECT * FROM rooms WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(room))
}

pub async fn create_room(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Room>,
) -> Result<(StatusCode, Json<Room>), StatusCode> {
    let room = sqlx::query_as::<_, Room>(
        "INSERT INTO rooms (id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *"
    )
    .bind(payload.id)
    .bind(payload.hostel_id)
    .bind(payload.room_number)
    .bind(payload.floor)
    .bind(payload.capacity)
    .bind(payload.occupancy)
    .bind(payload.room_type)
    .bind(payload.status)
    .bind(payload.price_per_month)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error creating room: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((StatusCode::CREATED, Json(room)))
}
