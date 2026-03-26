use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;

use crate::auth::handlers::{login, me, register};
use crate::db::AppState;
use crate::handlers::fee::{create_fee, get_fees};
use crate::handlers::hostel::{create_hostel, get_hostels};
use crate::handlers::maintenance::{create_maintenance_request, get_maintenance_requests};
use crate::handlers::room::{create_room, get_rooms};
use crate::handlers::visitor::{create_visitor, get_visitors};

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/me", get(me))
        .route("/api/hostels", get(get_hostels).post(create_hostel))
        .route("/api/rooms", get(get_rooms).post(create_room))
        .route("/api/fees", get(get_fees).post(create_fee))
        .route(
            "/api/maintenance",
            get(get_maintenance_requests).post(create_maintenance_request),
        )
        .route("/api/visitors", get(get_visitors).post(create_visitor))
        .with_state(state)
}
