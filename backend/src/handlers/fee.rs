use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::db::AppState;
use crate::models::Fee;

pub async fn get_fees(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Fee>>, StatusCode> {
    let fees = sqlx::query_as::<_, Fee>("SELECT * FROM fees")
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(fees))
}

pub async fn create_fee(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Fee>,
) -> Result<(StatusCode, Json<Fee>), StatusCode> {
    let fee = sqlx::query_as::<_, Fee>(
        "INSERT INTO fees (id, student_id, amount, status, due_date, payment_date) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
    )
    .bind(payload.id)
    .bind(payload.student_id)
    .bind(payload.amount)
    .bind(payload.status)
    .bind(payload.due_date)
    .bind(payload.payment_date)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(fee)))
}
