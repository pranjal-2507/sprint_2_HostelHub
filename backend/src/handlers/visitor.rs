use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::db::AppState;
use crate::models::Visitor;

pub async fn get_visitors(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Visitor>>, StatusCode> {
    let visitors = sqlx::query_as::<_, Visitor>("SELECT * FROM visitors")
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(visitors))
}

pub async fn create_visitor(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Visitor>,
) -> Result<(StatusCode, Json<Visitor>), StatusCode> {
    let visitor = sqlx::query_as::<_, Visitor>(
        "INSERT INTO visitors (id, student_id, name, relationship, purpose, entry_time, exit_time) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    )
    .bind(payload.id)
    .bind(payload.student_id)
    .bind(payload.name)
    .bind(payload.relationship)
    .bind(payload.purpose)
    .bind(payload.entry_time)
    .bind(payload.exit_time)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(visitor)))
}
