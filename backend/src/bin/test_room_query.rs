use sqlx::postgres::PgPoolOptions;
use std::env;
use dotenv::dotenv;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, sqlx::FromRow)]
pub struct Room {
    pub id: Uuid,
    pub hostel_id: Option<Uuid>,
    pub room_number: String,
    pub floor: i32,
    pub capacity: i32,
    pub occupancy: Option<i32>,
    pub room_type: Option<String>,
    pub status: Option<String>,
    pub price_per_month: Option<f64>,
    pub created_at: DateTime<Utc>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await?;

    println!("Testing Room query...");
    let result = sqlx::query_as::<_, Room>(
        "SELECT id, hostel_id, room_number, floor, capacity, occupancy, room_type, status, price_per_month::FLOAT8 AS price_per_month, created_at FROM rooms"
    )
    .fetch_all(&pool)
    .await;

    match result {
        Ok(rooms) => println!("Success! Fetched {} rooms.", rooms.len()),
        Err(e) => println!("ERROR: {}", e),
    }

    Ok(())
}
