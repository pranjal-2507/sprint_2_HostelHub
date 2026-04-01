use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
    http::StatusCode,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::env;
use std::sync::Arc;
use uuid::Uuid;

use crate::auth::service::Claims;
use crate::db::AppState;

pub struct RequireAuth(pub String);

#[async_trait]
impl<S> FromRequestParts<S> for RequireAuth
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts.headers.get("Authorization").and_then(|h| h.to_str().ok());
        
        if let Some(auth_str) = auth_header {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
                let mut validation = Validation::default();
                validation.validate_exp = true;
                
                let token_data = decode::<Claims>(
                    token,
                    &DecodingKey::from_secret(secret.as_bytes()),
                    &validation
                ).map_err(|e| {
                    eprintln!("JWT Decode Error: {:?}", e);
                    (StatusCode::UNAUTHORIZED, "Invalid or expired token".to_string())
                })?;
                
                return Ok(RequireAuth(token_data.claims.sub));
            }
        }
        
        eprintln!("Auth Error: Missing or malformed Authorization header");
        Err((StatusCode::UNAUTHORIZED, "Missing or malformed Authorization header".to_string()))
    }
}

pub struct RequireAdmin(pub String);

#[async_trait]
impl FromRequestParts<Arc<AppState>> for RequireAdmin {
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, state: &Arc<AppState>) -> Result<Self, Self::Rejection> {
        // First check if user is authenticated
        let RequireAuth(user_id) = RequireAuth::from_request_parts(parts, state).await?;
        
        let uuid = Uuid::parse_str(&user_id)
            .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID in token".to_string()))?;
        
        // Query database for role
        println!("Checking admin role for user: {}", user_id);
        let role: String = sqlx::query_scalar("SELECT role FROM users WHERE id = $1")
            .bind(uuid)
            .fetch_one(&state.db)
            .await
            .map_err(|e| {
                eprintln!("Role Query Error for user {}: {:?}", user_id, e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Failed to verify permissions".to_string())
            })?;
            
        if role == "admin" {
            println!("Admin access granted for user: {}", user_id);
            Ok(RequireAdmin(user_id))
        } else {
            eprintln!("Admin access denied for user: {} (Role: {})", user_id, role);
            Err((StatusCode::FORBIDDEN, "Admin permission required".to_string()))
        }
    }
}

#[allow(dead_code)]
pub struct RequireHosteler(pub String);

#[async_trait]
impl FromRequestParts<Arc<AppState>> for RequireHosteler {
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, state: &Arc<AppState>) -> Result<Self, Self::Rejection> {
        // First check if user is authenticated
        let RequireAuth(user_id) = RequireAuth::from_request_parts(parts, state).await?;
        
        let uuid = Uuid::parse_str(&user_id)
            .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid UUID in token".to_string()))?;
        
        // Query database for role
        let role: String = sqlx::query_scalar("SELECT role FROM users WHERE id = $1")
            .bind(uuid)
            .fetch_one(&state.db)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to verify permissions".to_string()))?;
            
        if role == "hosteler" {
            Ok(RequireHosteler(user_id))
        } else {
            Err((StatusCode::FORBIDDEN, "Hosteler permission required".to_string()))
        }
    }
}