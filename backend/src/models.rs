use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{NaiveDateTime, NaiveDate};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub name: String,
    pub email: String,
}

// --- New Management Models ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Hostel {
    pub id: Uuid,
    pub name: String,
    pub address: String,
    pub total_rooms: i32,
    pub capacity: i32,
    pub hostel_type: String, // boys, girls, mixed
    pub contact: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Room {
    pub id: Uuid,
    pub hostel_id: Uuid,
    pub room_number: String,
    pub floor: i32,
    pub capacity: i32,
    pub occupancy: i32,
    pub room_type: String, // single, double, triple, dormitory
    pub status: String,    // available, occupied, maintenance, reserved
    pub price_per_month: f64,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct RoomAllocation {
    pub id: Uuid,
    pub room_id: Uuid,
    pub student_id: Uuid,
    pub student_name: String,
    pub check_in_date: NaiveDate,
    pub check_out_date: Option<NaiveDate>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Fee {
    pub id: Uuid,
    pub student_id: Uuid,
    pub amount: f64,
    pub status: String, // paid, pending, overdue
    pub due_date: NaiveDate,
    pub payment_date: Option<NaiveDate>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct MaintenanceRequest {
    pub id: Uuid,
    pub room_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub status: String,   // pending, in-progress, completed
    pub priority: String, // low, medium, high
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Visitor {
    pub id: Uuid,
    pub student_id: Uuid,
    pub name: String,
    pub relationship: Option<String>,
    pub purpose: Option<String>,
    pub entry_time: NaiveDateTime,
    pub exit_time: Option<NaiveDateTime>,
}
