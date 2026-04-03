use axum::{extract::{State, Path}, Json, http::StatusCode};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::{RequireAdmin, RequireAuth};
use crate::db::AppState;
use crate::models::{Complaint, CreateComplaintRequest, UpdateComplaintRequest, HostelerUpdateComplaintRequest};

pub async fn get_all_complaints(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Complaint>>, (StatusCode, String)> {
    let complaints: Vec<Complaint> = sqlx::query_as(
        r#"
        SELECT 
            c.id, c.student_id, u.name as student_name, u.room_number,
            c.title, c.description, c.status, c.priority, c.resolved_at, c.created_at 
        FROM complaints c
        JOIN users u ON c.student_id = u.id
        ORDER BY c.created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    Ok(Json(complaints))
}

pub async fn update_complaint_status(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(complaint_id): Path<Uuid>,
    Json(payload): Json<UpdateComplaintRequest>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let resolved_at = if payload.status == "resolved" {
        Some("NOW()")
    } else {
        None
    };

    let query = if let Some(_) = resolved_at {
        "UPDATE complaints SET status = $1, resolved_at = NOW() WHERE id = $2"
    } else {
        "UPDATE complaints SET status = $1, resolved_at = NULL WHERE id = $2"
    };

    let result = sqlx::query(query)
        .bind(&payload.status)
        .bind(complaint_id)
        .execute(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Complaint not found".to_string()))
    } else {
        Ok(Json("Complaint status updated successfully"))
    }
}

pub async fn create_complaint(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateComplaintRequest>,
) -> Result<Json<Complaint>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;
    let complaint_id = Uuid::new_v4();
    
    let result = sqlx::query(
        r#"
        INSERT INTO complaints (id, student_id, title, description, priority, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        "#
    )
    .bind(complaint_id)
    .bind(uuid)
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(&payload.priority)
    .execute(&state.db)
    .await;
    
    match result {
        Ok(_) => {
            let complaint: Complaint = sqlx::query_as(
                r#"
                SELECT 
                    c.id, c.student_id, u.name as student_name, u.room_number,
                    c.title, c.description, c.status, c.priority, c.resolved_at, c.created_at 
                FROM complaints c
                JOIN users u ON c.student_id = u.id
                WHERE c.id = $1
                "#
            )
            .bind(complaint_id)
            .fetch_one(&state.db)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch created complaint".to_string()))?;
            
            Ok(Json(complaint))
        },
        Err(_) => {
            Err((StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))
        }
    }
}

pub async fn get_my_complaints(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Complaint>>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

    let complaints: Vec<Complaint> = sqlx::query_as(
        r#"
        SELECT 
            c.id, c.student_id, u.name as student_name, u.room_number,
            c.title, c.description, c.status, c.priority, c.resolved_at, c.created_at 
        FROM complaints c
        JOIN users u ON c.student_id = u.id
        WHERE c.student_id = $1 
        ORDER BY c.created_at DESC
        "#
    )
    .bind(uuid)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    Ok(Json(complaints))
}

pub async fn get_student_complaints(
    RequireAdmin(_user_id): RequireAdmin,
    State(state): State<Arc<AppState>>,
    Path(student_id): Path<Uuid>,
) -> Result<Json<Vec<Complaint>>, (StatusCode, String)> {
    let complaints: Vec<Complaint> = sqlx::query_as(
        r#"
        SELECT 
            c.id, c.student_id, u.name as student_name, u.room_number,
            c.title, c.description, c.status, c.priority, c.resolved_at, c.created_at 
        FROM complaints c
        JOIN users u ON c.student_id = u.id
        WHERE c.student_id = $1 
        ORDER BY c.created_at DESC
        "#
    )
    .bind(student_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    Ok(Json(complaints))
}

pub async fn update_my_complaint(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
    Path(id_str): Path<String>,
    Json(payload): Json<HostelerUpdateComplaintRequest>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let student_uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

    // Try to parse as full UUID first, otherwise match as a prefix string
    // (This handles the 8-character IDs shown in the frontend)
    let result = sqlx::query(
        r#"
        UPDATE complaints 
        SET title = $1, description = $2, priority = $3 
        WHERE (id::text LIKE $4 || '%') AND student_id = $5 AND status = 'pending'
        "#
    )
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(&payload.priority)
    .bind(&id_str)
    .bind(student_uuid)
    .execute(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error updating complaint: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Complaint not found, or it is no longer pending and cannot be edited".to_string()))
    } else {
        Ok(Json("Complaint updated successfully"))
    }
}

pub async fn delete_my_complaint(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
    Path(id_str): Path<String>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    let student_uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;

    let result = sqlx::query(
        "DELETE FROM complaints WHERE (id::text LIKE $1 || '%') AND student_id = $2 AND status = 'pending'"
    )
    .bind(&id_str)
    .bind(student_uuid)
    .execute(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error deleting complaint: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
    })?;

    if result.rows_affected() == 0 {
        Err((StatusCode::NOT_FOUND, "Complaint not found, or it is no longer pending and cannot be deleted".to_string()))
    } else {
        Ok(Json("Complaint deleted successfully"))
    }
}