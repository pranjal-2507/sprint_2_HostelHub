use axum::{extract::{State, Path}, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::{RequireAdmin, RequireAuth};
use crate::db::AppState;
use crate::models::{Notice, CreateNoticeRequest, UpdateNoticeRequest};

pub async fn get_all_notices(
    RequireAuth(_user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Notice>>, (StatusCode, String)> {
    let notices: Vec<Notice> = sqlx::query_as(
        r#"
        SELECT id, title, content, category, priority, created_by, created_at
        FROM notices 
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error fetching notices: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e))
    })?;

    Ok(Json(notices))
}

pub async fn create_notice(
    RequireAdmin(user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateNoticeRequest>,
) -> Result<Json<Notice>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;
    let notice_id = Uuid::new_v4();
    
    let result = sqlx::query(
        r#"
        INSERT INTO notices (id, title, content, category, priority, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        "#
    )
    .bind(notice_id)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(&payload.category)
    .bind(&payload.priority)
    .bind(uuid)
    .execute(&state.db)
    .await;
    
    match result {
        Ok(_) => {
            let notice: Notice = sqlx::query_as(
                "SELECT id, title, content, category, priority, created_by, created_at FROM notices WHERE id = $1"
            )
            .bind(notice_id)
            .fetch_one(&state.db)
            .await
            .map_err(|e| {
                eprintln!("Failed to fetch created notice: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch created notice".to_string())
            })?;
            
            Ok(Json(notice))
        },
        Err(_) => {
            Err((StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))
        }
    }
}

pub async fn update_notice(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(notice_id): Path<Uuid>,
    Json(payload): Json<UpdateNoticeRequest>,
) -> Result<Json<Notice>, (StatusCode, String)> {
    let notice = sqlx::query_as::<_, Notice>(
        r#"
        UPDATE notices 
        SET 
            title = COALESCE($1, title),
            content = COALESCE($2, content),
            category = COALESCE($3, category),
            priority = COALESCE($4, priority)
        WHERE id = $5
        RETURNING id, title, content, category, priority, created_by, created_at
        "#
    )
    .bind(payload.title)
    .bind(payload.content)
    .bind(payload.category)
    .bind(payload.priority)
    .bind(notice_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error updating notice: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    Ok(Json(notice))
}

pub async fn delete_notice(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(notice_id): Path<Uuid>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let result = sqlx::query("DELETE FROM notices WHERE id = $1")
        .bind(notice_id)
        .execute(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Notice not found".to_string()))
    } else {
        Ok(Json("Notice deleted successfully"))
    }
}