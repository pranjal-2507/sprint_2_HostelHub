use axum::{
    extract::State,
    Json,
    http::StatusCode,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::middleware::RequireAuth;
use crate::auth::service::{generate_jwt, hash_password, verify_password};
use crate::db::AppState;
use crate::models::{AuthResponse, LoginRequest, RegisterRequest, User, UserResponse};

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    let hashed_password = hash_password(&payload.password);
    let user_id = Uuid::new_v4();
    
    let result = sqlx::query(
        r#"
        INSERT INTO users (id, name, email, password_hash, role, phone, course, year, room_number, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        "#
    )
    .bind(user_id)
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&hashed_password)
    .bind("hosteler")
    .bind(&payload.phone)
    .bind(&payload.course)
    .bind(&payload.year)
    .bind(&payload.room_number)
    .execute(&state.db)
    .await;
    
    match result {
        Ok(_) => {
            let token = generate_jwt(&user_id.to_string());
            let user_res = UserResponse {
                id: user_id,
                name: payload.name,
                email: payload.email,
                role: "hosteler".to_string(),
                phone: payload.phone,
                course: payload.course,
                year: payload.year,
                room_number: payload.room_number,
            };
            Ok(Json(AuthResponse {
                access_token: token,
                user: user_res,
            }))
        },
        Err(e) => {
            if e.to_string().contains("duplicate key") {
                Err((StatusCode::CONFLICT, "Email already exists".to_string()))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))
            }
        }
    }
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    let record: Option<User> = sqlx::query_as::<_, User>(
        r#"SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE email = $1"#
    )
    .bind(&payload.email)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;
    
    println!("Attempting login for email: {}", payload.email);
    if let Some(user) = record {
        println!("User found, checking password...");
        if verify_password(&payload.password, &user.password_hash) {
            println!("Password verified successfully");
            let token = generate_jwt(&user.id.to_string());
            Ok(Json(AuthResponse {
                access_token: token,
                user: UserResponse {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    course: user.course,
                    year: user.year,
                    room_number: user.room_number,
                }
            }))
        } else {
            Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))
        }
    } else {
        Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))
    }
}

pub async fn me(
    RequireAuth(user_id): RequireAuth,
    State(state): State<Arc<AppState>>,
) -> Result<Json<UserResponse>, (StatusCode, String)> {
    let uuid = Uuid::parse_str(&user_id)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID".to_string()))?;
        
    let record: Option<User> = sqlx::query_as::<_, User>(
        "SELECT id, name, email, password_hash, role, phone, course, year, room_number, created_at FROM users WHERE id = $1"
    )
    .bind(uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;
    
    if let Some(user) = record {
        Ok(Json(UserResponse {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            course: user.course,
            year: user.year,
            room_number: user.room_number,
        }))
    } else {
        Err((StatusCode::NOT_FOUND, "User not found".to_string()))
    }
}
