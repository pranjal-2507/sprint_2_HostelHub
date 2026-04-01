use axum::{extract::{State, Path}, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;
use chrono::NaiveDate;

use crate::auth::middleware::{RequireAdmin, RequireAuth};
use crate::db::AppState;
use crate::models::{Fee, CreateFeeRequest, FeeResponse};

pub async fn get_all_fees(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<FeeResponse>>, (StatusCode, String)> {
    let fees: Vec<FeeResponse> = sqlx::query_as(
        r#"
        SELECT 
            f.id, f.student_id, u.name as student_name, u.room_number,
            f.amount::FLOAT8, f.fee_type, f.due_date, f.status, f.payment_date, f.created_at 
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
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateFeeRequest>,
) -> Result<Json<Fee>, (StatusCode, String)> {
    let fee_id = Uuid::new_v4();
    
    // Parse due_date string to NaiveDate
    let due_date = NaiveDate::parse_from_str(&payload.due_date, "%Y-%m-%d")
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid due_date format. Use YYYY-MM-DD".to_string()))?;
    
    let result = sqlx::query(
        r#"
        INSERT INTO fees (id, student_id, amount, fee_type, due_date, status, created_at)
        VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
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
                "SELECT id, student_id, amount::FLOAT8, fee_type, due_date, status, payment_date, created_at FROM fees WHERE id = $1"
            )
            .bind(fee_id)
            .fetch_one(&state.db)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch created fee".to_string()))?;
            
            Ok(Json(fee))
        },
        Err(e) => {
            println!("Error creating fee: {:?}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))
        }
    }
}

pub async fn update_payment_status(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path((fee_id, status)): Path<(Uuid, String)>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let query = if status == "paid" {
        "UPDATE fees SET status = $1, payment_date = CURRENT_DATE WHERE id = $2"
    } else {
        "UPDATE fees SET status = $1, payment_date = NULL WHERE id = $2"
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
        "SELECT id, student_id, amount::FLOAT8, fee_type, due_date, status, payment_date, created_at FROM fees WHERE student_id = $1 ORDER BY created_at DESC"
    )
    .bind(uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    Ok(Json(fees))
}

pub async fn get_student_fees(
    _admin: RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(student_id): Path<Uuid>,
) -> Result<Json<Vec<Fee>>, (StatusCode, String)> {
    let fees: Vec<Fee> = sqlx::query_as(
        "SELECT id, student_id, amount::FLOAT8, fee_type, due_date, status, payment_date, created_at FROM fees WHERE student_id = $1 ORDER BY created_at DESC"
    )
    .bind(student_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    Ok(Json(fees))
}