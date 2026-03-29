use axum::{extract::{State, Path}, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;
use chrono::NaiveDateTime;

use crate::auth::middleware::{RequireAdmin, RequireAuth};
use crate::db::AppState;
use crate::models::{Fee, CreateFeeRequest, FeeResponse};

pub async fn get_all_fees(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<FeeResponse>>, (StatusCode, String)> {
    let fees: Vec<FeeResponse> = sqlx::query_as(
        r#"
        SELECT 
            f.id, f.student_id, u.name as student_name, u.room_number,
            f.amount, f.fee_type, f.due_date, f.status, f.paid_at, f.created_at 
        FROM fees f
        JOIN users u ON f.student_id = u.id
        ORDER BY f.created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        println!("Error fetching fees: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    Ok(Json(fees))
}

pub async fn create_fee(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateFeeRequest>,
) -> Result<Json<Fee>, (StatusCode, String)> {
    let fee_id = Uuid::new_v4();
    
    // Parse due_date string to NaiveDateTime
    let due_date = NaiveDateTime::parse_from_str(&payload.due_date, "%Y-%m-%d %H:%M:%S")
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid due_date format. Use YYYY-MM-DD HH:MM:SS".to_string()))?;
    
    let result = sqlx::query(
        r#"
        INSERT INTO fees (id, student_id, amount, fee_type, due_date, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        "#
    )
    .bind(fee_id)
    .bind(payload.student_id)
    .bind(payload.amount)
    .bind(&payload.fee_type)
    .bind(due_date)
    .execute(&state.db)
    .await;
    
    match result {
        Ok(_) => {
            let fee: Fee = sqlx::query_as(
                "SELECT id, student_id, amount, fee_type, due_date, status, paid_at, created_at FROM fees WHERE id = $1"
            )
            .bind(fee_id)
            .fetch_one(&state.db)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch created fee".to_string()))?;
            
            Ok(Json(fee))
        },
        Err(_) => {
            Err((StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))
        }
    }
}

pub async fn update_payment_status(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path((fee_id, status)): Path<(Uuid, String)>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let paid_at = if status == "paid" {
        Some("NOW()")
    } else {
        None
    };

    let query = if let Some(_) = paid_at {
        "UPDATE fees SET status = $1, paid_at = NOW() WHERE id = $2"
    } else {
        "UPDATE fees SET status = $1, paid_at = NULL WHERE id = $2"
    };

    let result = sqlx::query(query)
        .bind(&status)
        .bind(fee_id)
        .execute(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Fee record not found".to_string()))
    } else {
        Ok(Json("Payment status updated successfully"))
    }
}

pub async fn get_my_fees(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Fee>>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

    let fees: Vec<Fee> = sqlx::query_as(
        "SELECT id, student_id, amount, fee_type, due_date, status, paid_at, created_at FROM fees WHERE student_id = $1 ORDER BY created_at DESC"
    )
    .bind(uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    Ok(Json(fees))
}

pub async fn get_student_fees(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(student_id): Path<Uuid>,
) -> Result<Json<Vec<Fee>>, (StatusCode, String)> {
    let fees: Vec<Fee> = sqlx::query_as(
        "SELECT id, student_id, amount, fee_type, due_date, status, paid_at, created_at FROM fees WHERE student_id = $1 ORDER BY created_at DESC"
    )
    .bind(student_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    Ok(Json(fees))
}