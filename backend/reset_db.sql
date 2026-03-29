-- Run this to reset the database if you're having issues
-- Connect to your database and run: psql -U your_username -d postgres -f reset_db.sql

-- Drop all tables in the correct order (respecting foreign keys)
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- The application will recreate these tables on next startup