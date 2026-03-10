use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
    http::StatusCode,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::env;

use crate::auth::service::Claims;

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
                ).map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid or expired token".to_string()))?;
                
                return Ok(RequireAuth(token_data.claims.sub));
            }
        }
        
        Err((StatusCode::UNAUTHORIZED, "Missing or malformed Authorization header".to_string()))
    }
}
