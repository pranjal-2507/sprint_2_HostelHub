mod auth;
mod db;
mod handlers;
mod models;
mod routes;

use axum::http::{header, Method};
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

use crate::db::AppState;

#[tokio::main]
async fn main() {
    // Load variables from .env file
    dotenv().ok();

    // Setup CORS to allow Angular frontend
    let cors = CorsLayer::new()
        .allow_origin(["http://localhost:4200".parse().unwrap()])
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

    // Database connection
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to Postgres");

    // Construct app state
    let state = Arc::new(AppState { db: pool });

    // Establish table structure if not exists
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            name VARCHAR NOT NULL,
            email VARCHAR UNIQUE NOT NULL,
            password_hash VARCHAR NOT NULL,
            created_at TIMESTAMP NOT NULL
        )
        "#,
    )
    .execute(&state.db)
    .await
    .expect("Failed to initialize database schema");

    // Setup routes
    let app = routes::create_router(state).layer(cors);

    // Bind server listener
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Backend server listening on 0.0.0.0:8080");

    axum::serve(listener, app).await.unwrap();
}
