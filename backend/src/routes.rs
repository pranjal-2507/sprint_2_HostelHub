use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;

use crate::auth::handlers::{login, me, register};
use crate::db::AppState;

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/me", get(me))
        .with_state(state)
}
