-- Smart Fitness AI Assistant - Database Schema Script
-- For deployment in pgAdmin
-- Database Name: aiagentdb

-- ============================================
-- 1. Create Database (if not exists)
-- ============================================
-- CREATE DATABASE aiagentdb;
-- CREATE USER aiagentuser WITH PASSWORD '123456';
-- GRANT ALL PRIVILEGES ON DATABASE aiagentdb TO aiagentuser;

-- ============================================
-- 2. Switch to Database (Select aiagentdb in pgAdmin)
-- ============================================

-- ============================================
-- 3. Create Table Structures
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT 'USER'
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_conversation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conversation_id BIGINT NOT NULL,
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_calendar_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gym Equipment Table
CREATE TABLE IF NOT EXISTS gym_equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(2000),
    primary_muscles VARCHAR(2000),
    alternative_equipments VARCHAR(2000),
    workout_types VARCHAR(1000),
    difficulty VARCHAR(1000),
    tips VARCHAR(2000)
);

-- Weekly Plans Table
CREATE TABLE IF NOT EXISTS weekly_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weekly_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weekly Plan Workouts Table
CREATE TABLE IF NOT EXISTS weekly_plan_workouts (
    id BIGSERIAL PRIMARY KEY,
    weekly_plan_id BIGINT NOT NULL,
    day_index INTEGER NOT NULL,
    workout_name VARCHAR(255) NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight VARCHAR(100),
    duration VARCHAR(100),
    completed BOOLEAN DEFAULT FALSE,
    notes VARCHAR(2000),
    CONSTRAINT fk_workout_weekly_plan FOREIGN KEY (weekly_plan_id) REFERENCES weekly_plans(id) ON DELETE CASCADE
);

-- ============================================
-- 4. Create Indexes for Query Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_message_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_user_id ON weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_start_date ON weekly_plans(start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_workout_plan_id ON weekly_plan_workouts(weekly_plan_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_workout_day_index ON weekly_plan_workouts(day_index);

-- ============================================
-- 5. Insert Sample Data (Optional)
-- ============================================

-- Sample Users (Password: password123)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', 'password123', 'ADMIN'),
('user1', 'user1@example.com', 'password123', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Sample Gym Equipment Data
INSERT INTO gym_equipment (name, description, primary_muscles, alternative_equipments, workout_types, difficulty, tips) VALUES
('Dumbbell', 'Dumbbells are versatile fitness equipment that allow for various free weight training exercises.', 'Full body muscle groups', 'Barbell, Kettlebell, Resistance bands', 'Strength training, Cardio training', 'Beginner', 'Choose appropriate weight for your fitness level, maintain proper form'),
('Barbell', 'Barbells are suitable for heavy compound movements like squats and bench presses.', 'Shoulders, Chest, Back, Legs', 'Dumbbell, Kettlebell', 'Strength training', 'Intermediate', 'Always prioritize safety, consider professional guidance'),
('Treadmill', 'Treadmills are the most common cardio equipment for convenient cardiovascular training.', 'Leg muscles, Cardiovascular system', 'Elliptical machine, Exercise bike, Outdoor running', 'Cardio training', 'Beginner', 'Maintain proper running posture, gradually increase intensity'),
('Rowing Machine', 'Rowing machines provide full-body cardio workouts engaging both upper and lower body.', 'Back, Shoulders, Legs, Core muscles', 'Ergometer, Rowing simulator', 'Cardio training', 'Intermediate', 'Keep back straight, initiate movement with leg power'),
('Kettlebell', 'Kettlebells are ideal for functional training and explosive power workouts.', 'Full body muscles, Core strength', 'Dumbbell, Barbell', 'Strength training, Functional training', 'Intermediate', 'Start with lighter weight for beginners, pay attention to grip technique')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 6. View Table Structure
-- ============================================
-- Execute the following query in pgAdmin to view all tables:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- ============================================
-- 7. View Table Data
-- ============================================
-- SELECT * FROM users;
-- SELECT * FROM conversations;
-- SELECT * FROM messages;
-- SELECT * FROM calendar_events;
-- SELECT * FROM gym_equipment;
-- SELECT * FROM weekly_plans;
-- SELECT * FROM weekly_plan_workouts;

-- ============================================
-- Done!
-- ============================================