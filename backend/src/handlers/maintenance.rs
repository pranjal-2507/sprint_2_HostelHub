use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::db::AppState;
use crate::models::MaintenanceRequest;

pub async fn get_maintenance_requests(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MaintenanceRequest>>, StatusCode> {
    let requests = sqlx::query_as::<_, MaintenanceRequest>("SELECT * FROM maintenance_requests")
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(requests))
}

pub async fn create_maintenance_request(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<MaintenanceRequest>,
) -> Result<(StatusCode, Json<MaintenanceRequest>), StatusCode> {
    let request = sqlx::query_as::<_, MaintenanceRequest>(
        "INSERT INTO maintenance_requests (id, room_id, title, description, status, priority, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    )
    .bind(payload.id)
    .bind(payload.room_id)
    .bind(payload.title)
    .bind(payload.description)
    .bind(payload.status)
    .bind(payload.priority)
    .bind(payload.created_at)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(request)))
}
