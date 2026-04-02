use sqlx::PgPool;
use uuid::Uuid;
use crate::auth::service::hash_password;

pub async fn seed_database(pool: &PgPool) -> Result<(), sqlx::Error> {
    println!("Seeding database with initial data...");
    
    // Ensure specific admin user exists
    let admin_password = hash_password("@12345");
    let admin_email = "pranjal@gmail.com";
    
    let _admin_result = sqlx::query(
        r#"
        INSERT INTO users (id, name, email, password_hash, role, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (email) DO UPDATE SET 
            role = EXCLUDED.role,
            password_hash = EXCLUDED.password_hash
        "#
    )
    .bind(Uuid::new_v4())
    .bind("Pranjal Gosavi")
    .bind(admin_email)
    .bind(&admin_password)
    .bind("admin")
    .execute(pool)
    .await?;
    
    println!("✓ Ensured admin user: {}", admin_email);

    // Also fix admin@hostelhub.com (seeded by supabase_seed.sql with bcrypt hash)
    // Update its password_hash to Argon2 format so login works
    let update_result = sqlx::query(
        "UPDATE users SET password_hash = $1 WHERE email = 'admin@hostelhub.com'"
    )
    .bind(&admin_password)
    .execute(pool)
    .await;

    match update_result {
        Ok(res) if res.rows_affected() > 0 => println!("✓ Updated password for admin@hostelhub.com to Argon2"),
        Ok(_) => println!("! admin@hostelhub.com not found for password update"),
        Err(e) => eprintln!("! Error updating admin password: {}", e),
    }

    // Also ensure admin@gmail.com exists and has the correct password
    let _gmail_admin = sqlx::query(
        r#"
        INSERT INTO users (id, name, email, password_hash, role, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (email) DO UPDATE SET 
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role
        "#
    )
    .bind(Uuid::new_v4())
    .bind("Admin User")
    .bind("admin@gmail.com")
    .bind(&admin_password)
    .bind("admin")
    .execute(pool)
    .await?;
    println!("✓ Ensured admin user: admin@gmail.com");

    // Create sample hosteler
    let hosteler_id = Uuid::new_v4();
    let hosteler_password = hash_password("student123");
    
    let hosteler_result = sqlx::query(
        r#"
        INSERT INTO users (id, name, email, password_hash, role, phone, course, year, room_number, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (email) DO NOTHING
        "#
    )
    .bind(hosteler_id)
    .bind("Rahul Sharma")
    .bind("rahul@hostelhub.com")
    .bind(&hosteler_password)
    .bind("hosteler")
    .bind("9876543210")
    .bind("B.Tech CSE")
    .bind(3)
    .bind("204")
    .execute(pool)
    .await?;

    if hosteler_result.rows_affected() > 0 {
        println!("✓ Created student user: rahul@hostelhub.com");
    }

    // Create sample rooms
    let room_numbers = ["201", "202", "203"];
    
    for (i, room_number) in room_numbers.iter().enumerate() {
        let room_id = Uuid::new_v4();
        let occupied = if i == 1 { 1 } else { 0 }; // Room 202 is occupied
        
        let room_result = sqlx::query(
            r#"
            INSERT INTO rooms (id, hostel_id, room_number, floor, capacity, occupancy, room_type, price_per_month, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (room_number) DO NOTHING
            "#
        )
        .bind(room_id)
        .bind(Uuid::new_v4()) // Placeholder hostel_id
        .bind(room_number)
        .bind(2)
        .bind(2)
        .bind(occupied)
        .bind("Double Sharing")
        .bind(8000.0) // Bind as float for DECIMAL
        .execute(pool)
        .await?;

        if room_result.rows_affected() > 0 {
            println!("✓ Created room: {}", room_number);
        }
    }

    // Get the actual user IDs from database for foreign key references
    let admin_user: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM users WHERE email = $1"
    )
    .bind(admin_email)
    .fetch_optional(pool)
    .await?;

    let hosteler_user: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM users WHERE email = 'rahul@hostelhub.com'"
    )
    .fetch_optional(pool)
    .await?;

    if let Some((actual_hosteler_id,)) = hosteler_user {
        // Clear existing duplicate fees for the sample student
        let _ = sqlx::query("DELETE FROM fees WHERE student_id = $1").bind(actual_hosteler_id).execute(pool).await;

        // Sample Fees with fixed IDs for idempotency
        let sample_fees = [
            (
                Uuid::parse_str("f1e2d3c4-b5a6-4c5d-8e9f-0a1b2c3d4e5f").unwrap(),
                8000.0,
                "Monthly Rent",
                chrono::Utc::now() + chrono::Duration::days(30),
                "pending"
            ),
            (
                Uuid::parse_str("e1d2c3b4-a5b6-4c5d-8e9f-1a2b3c4d5e6f").unwrap(),
                2500.0,
                "Mess Fee",
                chrono::Utc::now() + chrono::Duration::days(15),
                "paid"
            ),
        ];

        for (fee_id, amount, fee_type, due_date, status) in sample_fees {
            let _ = sqlx::query(
                r#"
                INSERT INTO fees (id, student_id, amount, fee_type, due_date, status, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (id) DO NOTHING
                "#
            )
            .bind(fee_id)
            .bind(actual_hosteler_id)
            .bind(amount)
            .bind(fee_type)
            .bind(due_date.naive_utc())
            .bind(status)
            .execute(pool)
            .await;
        }

        println!("✓ Created unique, diverse sample fee records");

        // Clear existing complaints to ensure only the diverse ones are shown
        let _ = sqlx::query("DELETE FROM complaints").execute(pool).await;

        // Fetch additional student IDs for diversity
        let sagar: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM users WHERE email = 'sagar.sharma@student.com'").fetch_optional(pool).await?;
        let gauri: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM users WHERE email = 'gauri.patil@student.com'").fetch_optional(pool).await?;
        let aditya: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM users WHERE email = 'aditya.roy@student.com'").fetch_optional(pool).await?;

        let student_ids = [
            actual_hosteler_id,
            sagar.map(|(id,)| id).unwrap_or(actual_hosteler_id),
            gauri.map(|(id,)| id).unwrap_or(actual_hosteler_id),
            aditya.map(|(id,)| id).unwrap_or(actual_hosteler_id),
        ];

        // Diversity in complaints
        let sample_complaints = [
            (
                Uuid::parse_str("d1a2b3c4-e5f6-4a5b-8c9d-0e1f2a3b4c5d").unwrap(),
                "Electricity Issue",
                "The ceiling fan is making a lot of noise and rotating slowly.",
                "medium",
                "pending"
            ),
            (
                Uuid::parse_str("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e").unwrap(),
                "Furniture Repair",
                "The study table in my room has a loose leg and needs fixing.",
                "low",
                "in-progress"
            ),
            (
                Uuid::parse_str("b1c2d3e4-f5a6-4b5c-8d9e-1f2a3b4c5d6e").unwrap(),
                "Cleaning Required",
                "The corridor outside my room has not been cleaned for a week.",
                "low",
                "resolved"
            ),
            (
                Uuid::parse_str("c1d2e3f4-a5b6-4c5d-8e9f-2a3b4c5d6e7f").unwrap(),
                "Internet Connectivity",
                "The Wi-Fi signal is very weak in the corner of my room.",
                "high",
                "pending"
            ),
        ];

        for (i, (comp_id, title, desc, prio, stat)) in sample_complaints.iter().enumerate() {
            let _ = sqlx::query(
                r#"
                INSERT INTO complaints (id, student_id, title, description, priority, status, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '1 day' * $7)
                ON CONFLICT (id) DO NOTHING
                "#
            )
            .bind(comp_id)
            .bind(student_ids[i % 4])
            .bind(title)
            .bind(desc)
            .bind(prio)
            .bind(stat)
            .bind(i as i32)
            .execute(pool)
            .await;
        }

        println!("✓ Created diverse sample complaints");
    }

    if let Some((actual_admin_id,)) = admin_user {
        // Sample notices with fixed IDs for idempotency
        let notice_1 = Uuid::parse_str("d1e2f3a4-b5c6-4d5e-8f9a-3b4c5d6e7f8a").unwrap();
        let notice_2 = Uuid::parse_str("e2f3a4b5-c6d7-4e5f-9a0b-4c5d6e7f8a9b").unwrap();
        let notice_3 = Uuid::parse_str("f3a4b5c6-d7e8-4f5a-0b1c-5d6e7f8a9b0c").unwrap();

        // Cleanup old non-idempotent notices to avoid duplicates in UI
        let _ = sqlx::query("DELETE FROM notices WHERE title IN ('Fee Payment Reminder', 'Welcome to HostelHub v2', 'Maintenance Schedule') AND id NOT IN ($1, $2, $3)")
            .bind(notice_1)
            .bind(notice_2)
            .bind(notice_3)
            .execute(pool)
            .await;

        let sample_notices = vec![
            (
                notice_1,
                "Fee Payment Reminder",
                "Monthly fees are due by the 5th of every month. Late payments will incur penalties.",
                "general",
                "high"
            ),
            (
                notice_2,
                "Welcome to HostelHub v2",
                "We are excited to launch the new management system.",
                "general",
                "low"
            ),
            (
                notice_3,
                "Maintenance Schedule",
                "The water tanks will be cleaned this Sunday from 10 AM to 2 PM.",
                "maintenance",
                "medium"
            )
        ];

        for (id, title, content, category, priority) in sample_notices {
            let _ = sqlx::query(
                r#"
                INSERT INTO notices (id, title, content, category, priority, created_by, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (id) DO NOTHING
                "#
            )
            .bind(id)
            .bind(title)
            .bind(content)
            .bind(category)
            .bind(priority)
            .bind(actual_admin_id)
            .execute(pool)
            .await;
        }

        println!("✓ Created idempotent sample notices");
    }

    println!("Database seeding completed successfully!");
    Ok(())
}