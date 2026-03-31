use axum::{
pub use axum::extract::State;
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::{RequireAdmin, RequireAuth};
use crate::db::AppState;
use crate::models::{MaintenanceRequest, MaintenanceResponse};

pub async fn get_maintenance_requests(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<MaintenanceResponse>>, StatusCode> {
    let requests = sqlx::query_as::<_, MaintenanceResponse>(
        r#"
        SELECT m.*, r.room_number 
        FROM maintenance_requests m
        JOIN rooms r ON m.room_id = r.id
        ORDER BY m.created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error fetching maintenance requests: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(requests))
}

pub async fn create_maintenance_request(
    _auth: RequireAuth,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<MaintenanceRequest>,
) -> Result<(StatusCode, Json<MaintenanceRequest>), StatusCode> {
    let request_id = Uuid::new_v4();
    let request = sqlx::query_as::<_, MaintenanceRequest>(
        "INSERT INTO maintenance_requests (id, room_id, title, description, status, priority, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *"
    )
    .bind(request_id)
    .bind(payload.room_id)
    .bind(payload.title)
    .bind(payload.description)
    .bind("pending") // Default status
    .bind(payload.priority)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error creating maintenance request: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((StatusCode::CREATED, Json(request)))
}
