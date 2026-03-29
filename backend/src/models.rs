use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub role: String,
    pub phone: Option<String>,
    pub course: Option<String>,
    pub year: Option<i32>,
    pub room_number: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: Option<String>,
    pub phone: Option<String>,
    pub course: Option<String>,
    pub year: Option<i32>,
    pub room_number: Option<String>,
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
    pub role: String,
    pub phone: Option<String>,
    pub course: Option<String>,
    pub year: Option<i32>,
    pub room_number: Option<String>,
}
// Room Management Models
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Room {
    pub id: Uuid,
    pub room_number: String,
    pub floor: i32,
    pub capacity: i32,
    pub occupied: i32,
    pub room_type: String,
    pub rent: i32,
    pub status: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateRoomRequest {
    pub room_number: String,
    pub floor: i32,
    pub capacity: i32,
    pub room_type: String,
    pub rent: i32,
}

// Fee Management Models
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Fee {
    pub id: Uuid,
    pub student_id: Uuid,
    pub amount: i32,
    pub fee_type: String,
    pub due_date: NaiveDateTime,
    pub status: String,
    pub paid_at: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct FeeResponse {
    pub id: Uuid,
    pub student_id: Uuid,
    pub student_name: String,
    pub room_number: Option<String>,
    pub amount: i32,
    pub fee_type: String,
    pub due_date: NaiveDateTime,
    pub status: String,
    pub paid_at: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateFeeRequest {
    pub student_id: Uuid,
    pub amount: i32,
    pub fee_type: String,
    pub due_date: String,
}

// Complaint Management Models
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Complaint {
    pub id: Uuid,
    pub student_id: Uuid,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    pub resolved_at: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateComplaintRequest {
    pub title: String,
    pub description: String,
    pub priority: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateComplaintRequest {
    pub status: String,
}

// Notice Management Models
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Notice {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub category: String,
    pub priority: String,
    pub created_by: Uuid,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoticeRequest {
    pub title: String,
    pub content: String,
    pub category: String,
    pub priority: String,
}

// Dashboard Stats Models
#[derive(Debug, Serialize)]
pub struct DashboardStats {
    pub total_students: i64,
    pub total_rooms: i64,
    pub occupied_rooms: i64,
    pub vacant_rooms: i64,
    pub pending_payments: i64,
    pub active_complaints: i64,
}

#[derive(Debug, Serialize)]
pub struct HostelerDashboardData {
    pub user: UserResponse,
    pub room_info: Option<Room>,
    pub fee_status: Vec<Fee>,
    pub recent_complaints: Vec<Complaint>,
    pub recent_notices: Vec<Notice>,
}