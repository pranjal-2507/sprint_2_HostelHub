use axum::{
    routing::{get, post, put, delete},
    Router,
};
use std::sync::Arc;

use crate::auth::handlers::{login, me, register};
use crate::handlers::{dashboard, rooms, students, fees, complaints, notices};
use crate::db::AppState;

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        // Auth routes
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/me", get(me))
        
        // Dashboard routes
        .route("/api/admin/dashboard/stats", get(dashboard::get_admin_dashboard_stats))
        .route("/api/hosteler/dashboard", get(dashboard::get_hosteler_dashboard))
        .route("/api/hosteler/room-info", get(dashboard::get_hosteler_room_info))
        
        // Room management routes (Admin only)
        .route("/api/admin/rooms", get(rooms::get_all_rooms))
        .route("/api/admin/rooms", post(rooms::create_room))
        .route("/api/admin/rooms/:room_id", delete(rooms::delete_room))
        
        // Student management routes (Admin only)
        .route("/api/admin/students", get(students::get_all_students))
        .route("/api/admin/students/:student_id", get(students::get_student_by_id))
        .route("/api/admin/students/:student_id/assign-room/:room_number", put(students::assign_room))
        .route("/api/admin/students/:student_id", delete(students::remove_student))
        
        // Fee management routes
        .route("/api/admin/fees", get(fees::get_all_fees))
        .route("/api/admin/fees", post(fees::create_fee))
        .route("/api/admin/fees/:fee_id/status/:status", put(fees::update_payment_status))
        .route("/api/admin/students/:student_id/fees", get(fees::get_student_fees))
        .route("/api/hosteler/fees", get(fees::get_my_fees))
        
        // Complaint management routes
        .route("/api/admin/complaints", get(complaints::get_all_complaints))
        .route("/api/admin/complaints/:complaint_id", put(complaints::update_complaint_status))
        .route("/api/admin/students/:student_id/complaints", get(complaints::get_student_complaints))
        .route("/api/hosteler/complaints", get(complaints::get_my_complaints))
        .route("/api/hosteler/complaints", post(complaints::create_complaint))
        
        // Notice management routes
        .route("/api/notices", get(notices::get_all_notices))
        .route("/api/admin/notices", post(notices::create_notice))
        .route("/api/admin/notices/:notice_id", delete(notices::delete_notice))
        
        .with_state(state)
}
