use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;
use sqlx::Postgres;

use crate::db::AppState;
use crate::models::Hostel;

pub async fn get_hostels(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Hostel>>, StatusCode> {
    let hostels = sqlx::query_as::<Postgres, Hostel>("SELECT * FROM hostels")
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(hostels))
}

#[allow(dead_code)]
pub async fn get_hostel_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Hostel>, StatusCode> {
    let hostel = sqlx::query_as::<Postgres, Hostel>("SELECT * FROM hostels WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(hostel))
}

pub async fn create_hostel(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Hostel>,
) -> Result<(StatusCode, Json<Hostel>), StatusCode> {
    let hostel = sqlx::query_as::<Postgres, Hostel>(
        "INSERT INTO hostels (id, name, address, total_rooms, capacity, hostel_type, contact) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    )
    .bind(payload.id)
    .bind(payload.name)
    .bind(payload.address)
    .bind(payload.total_rooms)
    .bind(payload.capacity)
    .bind(payload.hostel_type)
    .bind(payload.contact)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(hostel)))
}
