use axum::{extract::{State, Path}, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::RequireAdmin;
use crate::db::AppState;
use crate::models::{Room, CreateRoomRequest};

pub async fn get_all_rooms(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Room>>, (StatusCode, String)> {
    let rooms: Vec<Room> = sqlx::query_as(
        "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, price_per_month::FLOAT8, status, created_at FROM rooms ORDER BY room_number"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error fetching rooms: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e))
    })?;

    Ok(Json(rooms))
}

pub async fn create_room(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateRoomRequest>,
) -> Result<Json<Room>, (StatusCode, String)> {
    let room_id = Uuid::new_v4();
    
    let result = sqlx::query(
        r#"
        INSERT INTO rooms (id, hostel_id, room_number, floor, capacity, room_type, price_per_month, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        "#
    )
    .bind(room_id)
    .bind(payload.hostel_id)
    .bind(&payload.room_number)
    .bind(payload.floor)
    .bind(payload.capacity)
    .bind(&payload.room_type)
    .bind(payload.price_per_month)
    .execute(&state.db)
    .await;
    
    match result {
        Ok(_) => {
            let room: Room = sqlx::query_as(
                "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, price_per_month::FLOAT8, status, created_at FROM rooms WHERE id = $1"
            )
            .bind(room_id)
            .fetch_one(&state.db)
            .await
            .map_err(|e| {
                eprintln!("Failed to fetch created room: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch created room".to_string())
            })?;
            
            Ok(Json(room))
        },
        Err(e) => {
            if e.to_string().contains("duplicate key") {
                Err((StatusCode::CONFLICT, "Room number already exists".to_string()))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))
            }
        }
    }
}

pub async fn delete_room(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<Uuid>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let result = sqlx::query("DELETE FROM rooms WHERE id = $1")
        .bind(room_id)
        .execute(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Room not found".to_string()))
    } else {
        Ok(Json("Room deleted successfully"))
    }
}