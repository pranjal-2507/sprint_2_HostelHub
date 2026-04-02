mod auth;
mod db;
mod handlers;
mod models;
mod routes;
mod seed;

use axum::http::{header, Method};
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::db::AppState;
use deadpool_redis::{Config, Runtime};

#[tokio::main]
async fn main() {
    // Load variables from .env file
    dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "hostelhub_backend=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Setup CORS to allow any origin for development convenience
    let cors = CorsLayer::permissive();

    // Database connection
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Connecting to database...");
    
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .acquire_timeout(std::time::Duration::from_secs(30))
        .connect_with(
            database_url.parse::<sqlx::postgres::PgConnectOptions>()
                .expect("Invalid DATABASE_URL")
                .statement_cache_capacity(0)
        )
        .await
        .expect("Failed to connect to Postgres");

    println!("✓ Database connected successfully (Pool size: 20)");

    // Redis connection pool
    let redis_url = env::var("REDIS_URL").expect("REDIS_URL must be set");
    println!("Connecting to Redis...");
    let redis_cfg = Config::from_url(redis_url);
    let redis_pool = redis_cfg.create_pool(Some(Runtime::Tokio1))
        .expect("Failed to create Redis pool");
    println!("✓ Redis pool initialized");

    // Construct app state
    let state = Arc::new(AppState { 
        db: pool,
        redis: redis_pool
    });

    // Establish table structure if not exists
    println!("Initializing database schema...");
    
    // Users table
    let _ = sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            name VARCHAR NOT NULL,
            email VARCHAR UNIQUE NOT NULL,
            password_hash VARCHAR NOT NULL,
            role VARCHAR NOT NULL DEFAULT 'hosteler',
            phone VARCHAR,
            course VARCHAR,
            year INTEGER,
            room_number VARCHAR,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(&state.db)
    .await;
    println!("✓ Users table ready");
    // Ensure missing columns exist
    for col in &["phone VARCHAR", "course VARCHAR", "year INTEGER", "room_number VARCHAR"] {
        let sql = format!("ALTER TABLE users ADD COLUMN IF NOT EXISTS {}", col);
        match sqlx::query(&sql).execute(&state.db).await {
            Ok(_) => println!("✓ Column checked/added: {}", col),
            Err(e) => println!("Warning: Could not add column {}: {}", col, e),
        }
    }
    // Ensure unique constraint on email (needed for ON CONFLICT)
    let _ = sqlx::query(
        "CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)"
    ).execute(&state.db).await;
    println!("✓ Users email unique constraint ready");

    // Rooms table
    let _ = sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS rooms (
            id UUID PRIMARY KEY,
            hostel_id UUID,
            room_number VARCHAR UNIQUE NOT NULL,
            floor INTEGER NOT NULL,
            capacity INTEGER NOT NULL,
            occupancy INTEGER DEFAULT 0,
            room_type VARCHAR NOT NULL,
            price_per_month DECIMAL(10,2) NOT NULL,
            status VARCHAR DEFAULT 'available',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(&state.db)
    .await;
    // Ensure missing room columns exist
    for col in &[
        "hostel_id UUID",
        "floor INTEGER NOT NULL DEFAULT 1",
        "capacity INTEGER NOT NULL DEFAULT 1",
        "occupancy INTEGER DEFAULT 0",
        "room_type VARCHAR NOT NULL DEFAULT 'standard'",
        "price_per_month DECIMAL(10,2) NOT NULL DEFAULT 0",
        "status VARCHAR DEFAULT 'available'",
    ] {
        let sql = format!("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS {}", col);
        let _ = sqlx::query(&sql).execute(&state.db).await;
    }
    // Ensure unique constraint on room_number (needed for ON CONFLICT)
    let _ = sqlx::query(
        "CREATE UNIQUE INDEX IF NOT EXISTS rooms_room_number_unique ON rooms (room_number)"
    ).execute(&state.db).await;
    println!("✓ Rooms table ready");

    // Fees table
    let _ = sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS fees (
            id UUID PRIMARY KEY,
            student_id UUID NOT NULL REFERENCES users(id),
            amount INTEGER NOT NULL,
            fee_type VARCHAR NOT NULL,
            due_date TIMESTAMP NOT NULL,
            status VARCHAR DEFAULT 'pending',
            payment_date TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(&state.db)
    .await;
    // Ensure missing fee columns exist
    for col in &[
        "amount DECIMAL(10,2) NOT NULL DEFAULT 0", // Use DECIMAL to match Supabase
        "fee_type VARCHAR NOT NULL DEFAULT 'room'",
        "due_date TIMESTAMP NOT NULL DEFAULT NOW()",
        "status VARCHAR DEFAULT 'pending'",
        "payment_date TIMESTAMP",
    ] {
        let sql = format!("ALTER TABLE fees ADD COLUMN IF NOT EXISTS {}", col);
        let _ = sqlx::query(&sql).execute(&state.db).await;
    }
    println!("✓ Fees table ready");

    // Complaints table
    let _ = sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS complaints (
            id UUID PRIMARY KEY,
            student_id UUID NOT NULL REFERENCES users(id),
            title VARCHAR NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR DEFAULT 'pending',
            priority VARCHAR DEFAULT 'medium',
            resolved_at TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(&state.db)
    .await;
    // Ensure missing complaint columns exist
    for col in &[
        "title VARCHAR NOT NULL DEFAULT 'Feedback'",
        "description TEXT NOT NULL DEFAULT ''",
        "status VARCHAR DEFAULT 'pending'",
        "priority VARCHAR DEFAULT 'medium'",
        "resolved_at TIMESTAMP",
    ] {
        let parts: Vec<&str> = col.split_whitespace().collect();
        let _col_name = parts[0];
        let sql = format!("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS {}", col);
        let _ = sqlx::query(&sql).execute(&state.db).await;
    }
    println!("✓ Complaints table ready");

    // Notices table
    let _ = sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS notices (
            id UUID PRIMARY KEY,
            title VARCHAR NOT NULL,
            content TEXT NOT NULL,
            category VARCHAR NOT NULL DEFAULT 'General',
            priority VARCHAR DEFAULT 'normal',
            created_by UUID NOT NULL REFERENCES users(id),
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(&state.db)
    .await;
    // Ensure missing notice columns exist
    for col in &[
        "title VARCHAR NOT NULL DEFAULT 'Announcement'",
        "content TEXT NOT NULL DEFAULT ''",
        "category VARCHAR NOT NULL DEFAULT 'General'",
        "priority VARCHAR DEFAULT 'normal'",
        "created_by UUID",
    ] {
        let parts: Vec<&str> = col.split_whitespace().collect();
        let _col_name = parts[0];
        let sql = format!("ALTER TABLE notices ADD COLUMN IF NOT EXISTS {}", col);
        let _ = sqlx::query(&sql).execute(&state.db).await;
    }
    println!("✓ Notices table ready");

    // Seed/Verify database with initial data
    println!("Verifying initial data...");
    if let Err(e) = seed::seed_database(&state.db).await {
        println!("Warning: Database initialization step failed: {}", e);
    }

    // Setup routes with tracing and CORS
    let app = routes::create_router(state)
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    // Get port from environment or default to 8080
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    // Bind server listener
    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(l) => l,
        Err(e) => {
            eprintln!("CRITICAL ERROR: Could not bind to {} - {}", addr, e);
            eprintln!("Help: Check if another instance of the backend is already running.");
            std::process::exit(1);
        }
    };
    println!("✓ Backend server listening on {}", addr);

    if let Err(e) = axum::serve(listener, app).await {
        eprintln!("Server error: {}", e);
    }
}
