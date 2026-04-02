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

    // Fix all admin passwords seeded by supabase_seed.sql to use Argon2
    let update_admin_result = sqlx::query(
        "UPDATE users SET password_hash = $1 WHERE role = 'admin'"
    )
    .bind(&admin_password)
    .execute(pool)
    .await;

    match update_admin_result {
        Ok(res) if res.rows_affected() > 0 => println!("✓ Updated password for {} admins to Argon2", res.rows_affected()),
        Ok(_) => println!("! No extra admins found for password update"),
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
    let hosteler_password = hash_password("password123");
    
    let hosteler_result = sqlx::query(
        r#"
        INSERT INTO users (id, name, email, password_hash, role, phone, course, year, room_number, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        "#
    )
    .bind(hosteler_id)
    .bind("Sagar Raut")
    .bind("student1@gmail.com")
    .bind(&hosteler_password)
    .bind("hosteler")
    .bind("9876543210")
    .bind("B.Tech CSE")
    .bind(3)
    .bind("204")
    .execute(pool)
    .await?;

    if hosteler_result.rows_affected() > 0 {
        println!("✓ Created student user: student1@gmail.com");
    }

    // Fix all hosteler passwords seeded by supabase_seed.sql to use Argon2 (password123)
    let update_students_result = sqlx::query(
        "UPDATE users SET password_hash = $1 WHERE role = 'hosteler'"
    )
    .bind(&hosteler_password)
    .execute(pool)
    .await;
    
    if let Ok(res) = update_students_result {
        println!("✓ Updated password for {} students to Argon2 format", res.rows_affected());
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
        "SELECT id FROM users WHERE email = 'student1@gmail.com'"
    )
    .fetch_optional(pool)
    .await?;

    if let Some((actual_hosteler_id,)) = hosteler_user {
        // Create sample fee
        let fee_id = Uuid::new_v4();
        let due_date = chrono::Utc::now() + chrono::Duration::days(30);
        let fee_result = sqlx::query(
            r#"
            INSERT INTO fees (id, student_id, amount, fee_type, due_date, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            "#
        )
        .bind(fee_id)
        .bind(actual_hosteler_id)
        .bind(8000.0) // Bind as float for DECIMAL
        .bind("Monthly Rent")
        .bind(due_date.naive_utc()) // Bind as NaiveDateTime
        .bind("pending")
        .execute(pool)
        .await;

        if fee_result.is_ok() && fee_result.unwrap().rows_affected() > 0 {
            println!("✓ Created sample fee record");
        }

        // Create sample complaint
        let complaint_id = Uuid::new_v4();
        let complaint_result = sqlx::query(
            r#"
            INSERT INTO complaints (id, student_id, title, description, priority, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            "#
        )
        .bind(complaint_id)
        .bind(actual_hosteler_id)
        .bind("Water leakage in bathroom")
        .bind("There is continuous water leakage from the bathroom tap")
        .bind("high")
        .execute(pool)
        .await;

        if complaint_result.is_ok() && complaint_result.unwrap().rows_affected() > 0 {
            println!("✓ Created sample complaint");
        }
    }

    if let Some((actual_admin_id,)) = admin_user {
        // Create sample notice
        let notice_id = Uuid::new_v4();
        let notice_result = sqlx::query(
            r#"
            INSERT INTO notices (id, title, content, priority, created_by, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            "#
        )
        .bind(notice_id)
        .bind("Fee Payment Reminder")
        .bind("Monthly fees are due by the 5th of every month. Late payments will incur penalties.")
        .bind("high")
        .bind(actual_admin_id)
        .execute(pool)
        .await;

        if notice_result.is_ok() && notice_result.unwrap().rows_affected() > 0 {
            println!("✓ Created sample notice");
        }
    }

    println!("Database seeding completed successfully!");
    Ok(())
}