use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc, NaiveDate};

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
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub _role: Option<String>,
    pub phone: Option<String>,
    pub course: Option<String>,
    pub year: Option<i32>,
    pub room_number: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub course: Option<String>,
    pub year: Option<i32>,
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

#[derive(Debug, Serialize, Deserialize)]
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
    pub hostel_id: Option<Uuid>,
    pub room_number: String,
    pub floor: i32,
    pub capacity: i32,
    pub occupancy: Option<i32>,
    pub room_type: Option<String>, // single, double, triple, dormitory
    pub status: Option<String>,    // available, occupied, maintenance, reserved
    pub price_per_month: Option<f64>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRoomRequest {
    pub hostel_id: Uuid,
    pub room_number: String,
    pub floor: i32,
    pub capacity: i32,
    pub room_type: String,
    pub status: String,
    pub price_per_month: f64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateRoomRequest {
    pub room_number: Option<String>,
    pub floor: Option<i32>,
    pub capacity: Option<i32>,
    pub room_type: Option<String>,
    pub status: Option<String>,
    pub price_per_month: Option<f64>,
}

// Fee Management Models
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Fee {
    pub id: Uuid,
    pub student_id: Uuid,
    pub amount: f64,
    pub fee_type: Option<String>,
    pub status: Option<String>, // paid, pending, overdue
    pub due_date: NaiveDate,
    pub payment_date: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct FeeResponse {
    pub id: Uuid,
    pub student_id: Uuid,
    pub student_name: String,
    pub room_number: Option<String>,
    pub amount: f64,
    pub fee_type: Option<String>,
    pub status: Option<String>,
    pub due_date: NaiveDate,
    pub payment_date: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateFeeRequest {
    pub student_id: Uuid,
    pub amount: f64,
    pub fee_type: String,
    pub due_date: String,
}

// Complaint Management Models
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Complaint {
    pub id: Uuid,
    pub student_id: Uuid,
    pub student_name: Option<String>,
    pub room_number: Option<String>,
    pub title: String,
    pub description: String,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
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
    pub category: Option<String>,
    pub priority: Option<String>,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoticeRequest {
    pub title: String,
    pub content: String,
    pub category: String,
    pub priority: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNoticeRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub category: Option<String>,
    pub priority: Option<String>,
}

// Dashboard Stats Models
#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_students: i64,
    pub total_rooms: i64,
    pub occupied_rooms: i64,
    pub vacant_rooms: i64,
    pub pending_payments: i64,
    pub active_complaints: i64,
    pub overdue_payments: i64,
    pub pending_maintenance: i64,
    pub visitors_checked_in: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HostelerDashboardData {
    pub user: UserResponse,
    pub room_info: Option<Room>,
    pub fee_status: Vec<Fee>,
    pub recent_complaints: Vec<Complaint>,
    pub recent_notices: Vec<Notice>,
}

// --- Management Models ---

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

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct RoomAllocation {
    pub id: Uuid,
    pub room_id: Uuid,
    pub student_id: Uuid,
    pub student_name: String,
    pub check_in_date: NaiveDate,
    pub check_out_date: Option<NaiveDate>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct MaintenanceRequest {
    pub id: Uuid,
    pub room_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub status: String,   // pending, in-progress, completed
    pub priority: String, // low, medium, high
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct MaintenanceResponse {
    pub id: Uuid,
    pub room_id: Uuid,
    pub room_number: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Visitor {
    pub id: Uuid,
    pub student_id: Uuid,
    pub name: String,
    pub relationship: Option<String>,
    pub purpose: Option<String>,
    pub entry_time: DateTime<Utc>,
    pub exit_time: Option<DateTime<Utc>>,
}
