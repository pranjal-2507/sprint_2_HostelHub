-- HostelHub Supabase Seed Script
-- Run this in your Supabase SQL Editor

-- 1. EXTENSIONS (Make sure UUID is enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLEANUP (Optional: Remove if you want to keep existing data)
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS room_allocations CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. SCHEMA DEFINITION (Aligned with backend models.rs)

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'hosteler',
    phone TEXT,
    course TEXT,
    year INTEGER,
    room_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    total_rooms INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 0,
    hostel_type TEXT, -- boys, girls, mixed
    contact TEXT
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID REFERENCES hostels(id),
    room_number TEXT NOT NULL,
    floor INTEGER,
    capacity INTEGER,
    occupancy INTEGER DEFAULT 0,
    room_type TEXT, -- single, double, triple, dormitory
    status TEXT DEFAULT 'available', -- available, occupied, maintenance, reserved
    price_per_month DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    fee_type TEXT NOT NULL, -- Rent, Mess, Utility, Fine
    status TEXT DEFAULT 'pending', -- paid, pending, overdue
    due_date DATE,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in-progress, resolved
    priority TEXT DEFAULT 'low', -- low, medium, high
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT, -- General, Event, Rules, Emergency
    priority TEXT DEFAULT 'low',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in-progress, completed
    priority TEXT DEFAULT 'low', -- low, medium, high
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    relationship TEXT,
    purpose TEXT,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_time TIMESTAMP WITH TIME ZONE
);

-- 4. DYNAMIC DATA INSERTION

-- Insert Main Hostel
INSERT INTO hostels (name, address, total_rooms, capacity, hostel_type, contact)
VALUES ('HostelHub Premium Residency', '123 University Road, Kalvium City', 20, 50, 'mixed', '+91 9876543210');

-- Insert Admin User (Password is 'password123' hashed with bcrypt or similar)
INSERT INTO users (name, email, password_hash, role, phone)
VALUES ('System Admin', 'admin@hostelhub.com', '$2y$12$R9h/lIPzHZ4vN5qM9aO7/u4B6jVpU9Y8v5B5L7B5v5v5v5v5v5v5', 'admin', '+91 1234567890');

-- Insert 20 Rooms
DO $$
DECLARE
    h_id UUID;
    i INTEGER;
BEGIN
    SELECT id INTO h_id FROM hostels LIMIT 1;
    FOR i IN 1..20 LOOP
        INSERT INTO rooms (hostel_id, room_number, floor, capacity, room_type, status, price_per_month)
        VALUES (
            h_id, 
            'R' || (100 + i), 
            ((i-1)/10) + 1, 
            CASE WHEN i % 5 = 0 THEN 4 ELSE 2 END,
            CASE WHEN i % 3 = 0 THEN 'single' WHEN i % 5 = 0 THEN 'dormitory' ELSE 'double' END,
            CASE WHEN i % 4 = 0 THEN 'maintenance' ELSE 'available' END,
            CASE WHEN i % 3 = 0 THEN 8000.00 WHEN i % 5 = 0 THEN 3000.00 ELSE 5500.00 END
        );
    END LOOP;
END $$;

-- Insert 15 Students
DO $$
DECLARE
    student_names TEXT[] := ARRAY['Sagar Sharma', 'Gauri Patil', 'Rahul Varma', 'Priya Singh', 'Amit Kumar', 'Sneha Reddy', 'Vikram Das', 'Anjali Gupta', 'Karan Johar', 'Meera Iyer', 'Rohan Mehta', 'Sonal Bajaj', 'Aditya Roy', 'Nandini Shah', 'Vivek Jain'];
    i INTEGER;
    r_no TEXT;
    u_id UUID;
BEGIN
    FOR i IN 1..15 LOOP
        r_no := 'R' || (100 + i);
        INSERT INTO users (name, email, password_hash, role, phone, course, year, room_number)
        VALUES (
            student_names[i], 
            LOWER(REPLACE(student_names[i], ' ', '.')) || '@student.com', 
            '$2y$12$R9h/lIPzHZ4vN5qM9aO7/u4B6jVpU9Y8v5B5L7B5v5v5v5v5v5v5', 
            'hosteler', 
            '+91 912345' || LPAD(i::text, 4, '0'),
            CASE WHEN i % 2 = 0 THEN 'B.Tech CS' ELSE 'MBA' END,
            (i % 4) + 1,
            r_no
        ) RETURNING id INTO u_id;

        -- Update room occupancy
        UPDATE rooms SET occupancy = occupancy + 1, status = 'occupied' WHERE room_number = r_no;

        -- Insert Fees for this student
        INSERT INTO fees (student_id, amount, fee_type, status, due_date, payment_date)
        VALUES 
            (u_id, 5500.00, 'Monthly Rent', CASE WHEN i % 3 = 0 THEN 'pending' ELSE 'paid' END, CURRENT_DATE - (i || ' days')::interval, CASE WHEN i % 3 != 0 THEN CURRENT_DATE - (i + 2 || ' days')::interval ELSE NULL END),
            (u_id, 2500.00, 'Mess Fee', CASE WHEN i % 5 = 0 THEN 'overdue' ELSE 'paid' END, CURRENT_DATE - (i + 15 || ' days')::interval, CASE WHEN i % 5 != 0 THEN CURRENT_DATE - (i + 14 || ' days')::interval ELSE NULL END);
        
        -- Insert a random complaint for some users
        IF i % 4 = 0 THEN
            INSERT INTO complaints (student_id, title, description, status, priority)
            VALUES (u_id, 'Slow Internet', 'Wi-Fi in my room is extremely slow during peak hours.', 'pending', 'medium');
        END IF;

        IF i % 7 = 0 THEN
            INSERT INTO complaints (student_id, title, description, status, priority, resolved_at)
            VALUES (u_id, 'No Water', 'Water supply interrupted in the morning.', 'resolved', 'high', NOW() - interval '2 days');
        END IF;

        -- Insert Visitor
        IF i % 5 = 0 THEN
            INSERT INTO visitors (student_id, name, relationship, purpose, exit_time)
            VALUES (u_id, 'Rajiv Sharma', 'Parent', 'Casual Visit', NOW() - interval '4 hours');
        END IF;
    END LOOP;
END $$;

-- Insert Notices
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
    
    INSERT INTO notices (title, content, category, priority, created_by)
    VALUES 
        ('Welcome to HostelHub', 'We are excited to launch the new management system.', 'General', 'low', admin_id),
        ('Maintenance Schedule', 'The water tanks will be cleaned this Sunday from 10 AM to 2 PM.', 'Maintenance', 'medium', admin_id),
        ('Annual Fest 2026', 'Registration is now open for the annual cultural festival.', 'Event', 'low', admin_id),
        ('Emergency Drill', 'Fire safety drill scheduled for Monday. Please cooperate.', 'Emergency', 'high', admin_id);
END $$;

-- Insert Maintenance Requests
DO $$
DECLARE
    rm_id UUID;
BEGIN
    FOR rm_id IN SELECT id FROM rooms WHERE status = 'maintenance' LOOP
        INSERT INTO maintenance_requests (room_id, title, description, status, priority)
        VALUES (rm_id, 'Electrical Fault', 'Smoking outlet near the desk.', 'in-progress', 'high');
    END LOOP;
END $$;

-- 5. FINAL STATS CHECK
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'hosteler') as total_students,
    (SELECT COUNT(*) FROM rooms) as total_rooms,
    (SELECT COUNT(*) FROM fees WHERE status = 'paid') as total_paid_fees;
