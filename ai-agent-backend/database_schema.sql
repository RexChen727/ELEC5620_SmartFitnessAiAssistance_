-- ============================================
-- Smart Fitness AI Assistant - Database Schema
-- ============================================
-- Database Name: aiagentdb
-- Version: 2.0
-- Created: 2025-10-30
-- ============================================

-- ============================================
-- 1. Database Setup (Run in pgAdmin as superuser)
-- ============================================
-- CREATE DATABASE aiagentdb WITH ENCODING 'UTF8';
-- CREATE USER aiagentuser WITH PASSWORD '123456';
-- GRANT ALL PRIVILEGES ON DATABASE aiagentdb TO aiagentuser;
-- After connecting to aiagentdb:
-- GRANT ALL ON SCHEMA public TO aiagentuser;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aiagentuser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aiagentuser;

-- ============================================
-- 2. Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 3. Core Tables
-- ============================================

-- 用户表 (Users Table)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(500),
    CONSTRAINT chk_role CHECK (role IN ('USER', 'ADMIN', 'TRAINER'))
);

-- 用户偏好设置表 (User Preferences Table)
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fitness_goal VARCHAR(100), -- weight-loss, muscle-gain, endurance, strength, flexibility, general-fitness
    experience_level VARCHAR(50), -- beginner, intermediate, advanced
    training_frequency INTEGER, -- days per week (2-7)
    preferred_workout_time VARCHAR(50), -- morning, midday, afternoon, evening
    session_duration INTEGER, -- minutes (30, 45, 60, 90)
    available_equipment TEXT[], -- array of equipment IDs
    dietary_restrictions TEXT[], -- array of dietary restriction IDs
    custom_diet_notes TEXT,
    injuries_limitations TEXT,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- 用户统计表 (User Statistics Table)
CREATE TABLE IF NOT EXISTS user_statistics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_workouts INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_workout_date DATE,
    achievements_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_statistics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_statistics UNIQUE (user_id)
);

-- ============================================
-- 4. AI Assistant Tables
-- ============================================

-- 对话表 (Conversations Table)
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_conversation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 消息表 (Messages Table)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- for storing additional info like tokens, model used, etc.
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- ============================================
-- 5. Training Plan Tables
-- ============================================

-- 训练计划主表 (Training Plans Table)
CREATE TABLE IF NOT EXISTS training_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal VARCHAR(100) NOT NULL, -- weight-loss, muscle-gain, endurance, general-fitness
    experience_level VARCHAR(50), -- beginner, intermediate, advanced
    total_weeks INTEGER DEFAULT 8,
    days_per_week INTEGER NOT NULL,
    session_duration INTEGER, -- minutes
    equipment_required TEXT[],
    injuries_considerations TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, paused, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE,
    end_date DATE,
    CONSTRAINT fk_training_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('active', 'completed', 'paused', 'cancelled'))
);

-- 每周计划表 (Weekly Plans Table)
CREATE TABLE IF NOT EXISTS weekly_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    training_plan_id BIGINT, -- optional, can be part of a training plan or standalone
    week_number INTEGER, -- week number in the training plan
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weekly_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_weekly_plan_training_plan FOREIGN KEY (training_plan_id) REFERENCES training_plans(id) ON DELETE SET NULL
);

-- 每周计划训练项目表 (Weekly Plan Workouts Table)
CREATE TABLE IF NOT EXISTS weekly_plan_workouts (
    id BIGSERIAL PRIMARY KEY,
    weekly_plan_id BIGINT NOT NULL,
    day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    workout_name VARCHAR(255) NOT NULL,
    workout_type VARCHAR(100), -- e.g., "Upper Body Strength", "HIIT Cardio"
    exercises TEXT[], -- array of exercise names
    sets INTEGER,
    reps INTEGER,
    weight VARCHAR(100),
    duration VARCHAR(100), -- e.g., "45 min"
    rest_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    notes TEXT,
    order_index INTEGER DEFAULT 0, -- for ordering workouts on the same day
    CONSTRAINT fk_workout_weekly_plan FOREIGN KEY (weekly_plan_id) REFERENCES weekly_plans(id) ON DELETE CASCADE
);

-- ============================================
-- 6. Exercise Library Tables
-- ============================================

-- 运动库表 (Exercise Library Table)
CREATE TABLE IF NOT EXISTS exercises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- Strength, Cardio, HIIT, Flexibility, etc.
    difficulty VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced
    primary_muscles TEXT[], -- array of muscle groups
    secondary_muscles TEXT[],
    equipment_required VARCHAR(255), -- None, Dumbbells, Barbell, etc.
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    instructions TEXT[],
    tips TEXT[],
    calories_per_minute DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_difficulty CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced'))
);

-- 运动替代表 (Exercise Alternatives Table)
CREATE TABLE IF NOT EXISTS exercise_alternatives (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    alternative_exercise_id BIGINT NOT NULL,
    reason VARCHAR(255), -- e.g., "Similar muscle groups", "Same difficulty"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT fk_alternative_exercise FOREIGN KEY (alternative_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT unique_exercise_alternative UNIQUE (exercise_id, alternative_exercise_id)
);

-- 健身器材表 (Gym Equipment Table)
CREATE TABLE IF NOT EXISTS gym_equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    primary_muscles TEXT[], -- array of muscle groups
    alternative_equipments TEXT[], -- array of alternative equipment names
    workout_types TEXT[], -- array of workout types
    difficulty VARCHAR(100),
    tips TEXT[],
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. Training Log Tables
-- ============================================

-- 训练日志表 (Training Logs Table)
CREATE TABLE IF NOT EXISTS training_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workout_date DATE NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    exercise_id BIGINT, -- optional reference to exercise library
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL(10,2),
    weight_unit VARCHAR(10) DEFAULT 'lbs', -- lbs, kg
    rest_seconds INTEGER,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_training_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_training_log_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
);

-- 训练会话表 (Training Sessions Table)
-- Groups multiple exercises into a single workout session
CREATE TABLE IF NOT EXISTS training_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    session_name VARCHAR(255),
    total_duration_minutes INTEGER,
    total_calories_burned INTEGER,
    notes TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_training_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 训练会话练习关联表 (Training Session Exercises Table)
CREATE TABLE IF NOT EXISTS training_session_exercises (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    training_log_id BIGINT NOT NULL,
    order_index INTEGER DEFAULT 0,
    CONSTRAINT fk_session_exercise_session FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_exercise_log FOREIGN KEY (training_log_id) REFERENCES training_logs(id) ON DELETE CASCADE,
    CONSTRAINT unique_session_log UNIQUE (session_id, training_log_id)
);

-- ============================================
-- 8. Progress Tracking Tables
-- ============================================

-- 成就表 (Achievements Table)
CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(100), -- streak, workouts, duration, milestones
    requirement_type VARCHAR(100), -- total_workouts, streak_days, total_minutes, etc.
    requirement_value INTEGER,
    points INTEGER DEFAULT 0,
    badge_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户成就表 (User Achievements Table)
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_user_achievement_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_achievement_achievement FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 每周目标表 (Weekly Goals Table)
CREATE TABLE IF NOT EXISTS weekly_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    target_workouts INTEGER,
    completed_workouts INTEGER DEFAULT 0,
    target_minutes INTEGER,
    completed_minutes INTEGER DEFAULT 0,
    target_calories INTEGER,
    completed_calories INTEGER DEFAULT 0,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weekly_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 身体测量记录表 (Body Measurements Table)
CREATE TABLE IF NOT EXISTS body_measurements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    measurement_date DATE NOT NULL,
    weight DECIMAL(5,2),
    weight_unit VARCHAR(10) DEFAULT 'lbs', -- lbs, kg
    body_fat_percentage DECIMAL(4,2),
    muscle_mass DECIMAL(5,2),
    bmi DECIMAL(4,2),
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    arms DECIMAL(5,2),
    thighs DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_body_measurement_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 9. Calendar & Scheduling Tables
-- ============================================

-- 日历事件表 (Calendar Events Table)
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100), -- workout, meal, rest, custom
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_completed BOOLEAN DEFAULT FALSE,
    reminder_minutes INTEGER, -- minutes before event to remind
    recurrence_rule VARCHAR(255), -- for recurring events (e.g., "WEEKLY", "DAILY")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_calendar_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 10. Indexes for Performance
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- User preferences and statistics indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Conversation and message indexes
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_message_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON messages(created_at);

-- Training plan indexes
CREATE INDEX IF NOT EXISTS idx_training_plan_user_id ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_status ON training_plans(status);
CREATE INDEX IF NOT EXISTS idx_training_plan_dates ON training_plans(start_date, end_date);

-- Weekly plan indexes
CREATE INDEX IF NOT EXISTS idx_weekly_plan_user_id ON weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_training_plan_id ON weekly_plans(training_plan_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_dates ON weekly_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_workout_plan_id ON weekly_plan_workouts(weekly_plan_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_workout_day_index ON weekly_plan_workouts(day_index);

-- Exercise library indexes
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises(is_active);

-- Training log indexes
CREATE INDEX IF NOT EXISTS idx_training_log_user_id ON training_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_log_date ON training_logs(workout_date);
CREATE INDEX IF NOT EXISTS idx_training_log_exercise_id ON training_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_training_log_user_date ON training_logs(user_id, workout_date);

-- Training session indexes
CREATE INDEX IF NOT EXISTS idx_training_session_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_session_date ON training_sessions(session_date);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(is_completed);

-- Weekly goal indexes
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_id ON weekly_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_dates ON weekly_goals(week_start_date, week_end_date);

-- Body measurement indexes
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON body_measurements(measurement_date);

-- Calendar event indexes
CREATE INDEX IF NOT EXISTS idx_calendar_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_type ON calendar_events(event_type);

-- ============================================
-- 11. Triggers for Automatic Updates
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_plans_updated_at BEFORE UPDATE ON weekly_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_equipment_updated_at BEFORE UPDATE ON gym_equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_logs_updated_at BEFORE UPDATE ON training_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_goals_updated_at BEFORE UPDATE ON weekly_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. Sample Data Insertion
-- ============================================

-- Sample Users
INSERT INTO users (username, email, password, role, created_at) VALUES
('admin', 'admin@example.com', '$2a$10$rZ8qBZ7YO8VHH1F8hVwM5OdwKqBXPp8PwxkO9RHlVwXhUfLmQGGD2', 'ADMIN', CURRENT_TIMESTAMP),
('john_doe', 'john@example.com', '$2a$10$rZ8qBZ7YO8VHH1F8hVwM5OdwKqBXPp8PwxkO9RHlVwXhUfLmQGGD2', 'USER', CURRENT_TIMESTAMP),
('jane_smith', 'jane@example.com', '$2a$10$rZ8qBZ7YO8VHH1F8hVwM5OdwKqBXPp8PwxkO9RHlVwXhUfLmQGGD2', 'USER', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Sample Exercises
INSERT INTO exercises (name, description, category, difficulty, primary_muscles, equipment_required, tips, calories_per_minute) VALUES
('Push-ups', 'Classic bodyweight exercise targeting chest, shoulders, and triceps.', 'Strength', 'Beginner', ARRAY['Chest', 'Shoulders', 'Triceps'], 'None', ARRAY['Keep your body straight', 'Lower until chest nearly touches ground'], 7.0),
('Squats', 'Fundamental lower body exercise that builds leg and core strength.', 'Strength', 'Beginner', ARRAY['Legs', 'Glutes', 'Core'], 'None', ARRAY['Keep feet shoulder-width apart', 'Lower until thighs parallel to ground'], 8.0),
('Running', 'Excellent cardiovascular exercise that improves endurance.', 'Cardio', 'Beginner', ARRAY['Legs', 'Core', 'Cardiovascular'], 'None', ARRAY['Maintain steady pace', 'Land on midfoot'], 10.0),
('Deadlifts', 'Compound exercise working multiple muscle groups.', 'Strength', 'Advanced', ARRAY['Back', 'Legs', 'Core'], 'Barbell', ARRAY['Keep back straight', 'Drive through heels'], 9.0),
('Burpees', 'High-intensity full-body exercise.', 'HIIT', 'Intermediate', ARRAY['Full Body'], 'None', ARRAY['Move explosively', 'Maintain form throughout'], 12.0),
('Yoga Flow', 'Flowing yoga sequences for flexibility and mindfulness.', 'Flexibility', 'Intermediate', ARRAY['Full Body'], 'Yoga Mat', ARRAY['Focus on breathing', 'Move slowly and deliberately'], 4.0),
('Bench Press', 'Classic chest building exercise.', 'Strength', 'Intermediate', ARRAY['Chest', 'Shoulders', 'Triceps'], 'Barbell', ARRAY['Keep feet flat on ground', 'Control the weight'], 8.0),
('Pull-ups', 'Upper body strength exercise.', 'Strength', 'Intermediate', ARRAY['Back', 'Biceps', 'Shoulders'], 'Pull-up Bar', ARRAY['Use full range of motion', 'Avoid swinging'], 9.0)
ON CONFLICT (name) DO NOTHING;

-- Sample Gym Equipment
INSERT INTO gym_equipment (name, description, primary_muscles, alternative_equipments, workout_types, difficulty, tips) VALUES
('Dumbbell', 'Dumbbells are versatile fitness equipment that allow for various free weight training exercises.', ARRAY['Full body muscle groups'], ARRAY['Barbell', 'Kettlebell', 'Resistance bands'], ARRAY['Strength training', 'Cardio training'], 'Beginner', ARRAY['Choose appropriate weight for your fitness level', 'Maintain proper form']),
('Barbell', 'Barbells are suitable for heavy compound movements like squats and bench presses.', ARRAY['Shoulders', 'Chest', 'Back', 'Legs'], ARRAY['Dumbbell', 'Kettlebell'], ARRAY['Strength training'], 'Intermediate', ARRAY['Always prioritize safety', 'Consider professional guidance']),
('Treadmill', 'Treadmills are the most common cardio equipment for convenient cardiovascular training.', ARRAY['Leg muscles', 'Cardiovascular system'], ARRAY['Elliptical machine', 'Exercise bike', 'Outdoor running'], ARRAY['Cardio training'], 'Beginner', ARRAY['Maintain proper running posture', 'Gradually increase intensity']),
('Rowing Machine', 'Rowing machines provide full-body cardio workouts engaging both upper and lower body.', ARRAY['Back', 'Shoulders', 'Legs', 'Core muscles'], ARRAY['Ergometer', 'Rowing simulator'], ARRAY['Cardio training'], 'Intermediate', ARRAY['Keep back straight', 'Initiate movement with leg power']),
('Kettlebell', 'Kettlebells are ideal for functional training and explosive power workouts.', ARRAY['Full body muscles', 'Core strength'], ARRAY['Dumbbell', 'Barbell'], ARRAY['Strength training', 'Functional training'], 'Intermediate', ARRAY['Start with lighter weight for beginners', 'Pay attention to grip technique'])
ON CONFLICT (name) DO NOTHING;

-- Sample Achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points, badge_color) VALUES
('First Workout', 'Complete your first workout', '🎯', 'milestones', 'total_workouts', 1, 10, 'blue'),
('5 Day Streak', 'Workout 5 days in a row', '🔥', 'streak', 'streak_days', 5, 50, 'orange'),
('10 Day Streak', 'Workout 10 days in a row', '🔥', 'streak', 'streak_days', 10, 100, 'red'),
('25 Workouts', 'Complete 25 total workouts', '💪', 'workouts', 'total_workouts', 25, 100, 'green'),
('50 Workouts', 'Complete 50 total workouts', '💪', 'workouts', 'total_workouts', 50, 200, 'green'),
('100 Workouts', 'Complete 100 total workouts', '💪', 'workouts', 'total_workouts', 100, 500, 'gold'),
('1000 Minutes', 'Train for 1000 total minutes', '⏱️', 'duration', 'total_minutes', 1000, 150, 'purple'),
('Early Bird', 'Complete 10 morning workouts', '🌅', 'milestones', 'morning_workouts', 10, 75, 'yellow')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 13. Useful Views
-- ============================================

-- View for user workout summary
CREATE OR REPLACE VIEW v_user_workout_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    us.total_workouts,
    us.total_minutes,
    us.current_streak,
    us.achievements_count,
    COUNT(DISTINCT tl.workout_date) AS unique_workout_days,
    COUNT(tl.id) AS total_exercises_logged,
    SUM(tl.calories_burned) AS total_calories
FROM users u
LEFT JOIN user_statistics us ON u.id = us.user_id
LEFT JOIN training_logs tl ON u.id = tl.user_id
GROUP BY u.id, u.username, us.total_workouts, us.total_minutes, us.current_streak, us.achievements_count;

-- View for recent activity
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    u.id AS user_id,
    u.username,
    tl.workout_date,
    tl.exercise_name,
    tl.sets,
    tl.reps,
    tl.weight,
    tl.duration_minutes,
    tl.created_at
FROM users u
INNER JOIN training_logs tl ON u.id = tl.user_id
ORDER BY tl.workout_date DESC, tl.created_at DESC;

-- ============================================
-- 14. Utility Functions
-- ============================================

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg DECIMAL, height_m DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF height_m <= 0 THEN
        RETURN NULL;
    END IF;
    RETURN ROUND(weight_kg / (height_m * height_m), 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update user statistics after workout
CREATE OR REPLACE FUNCTION update_user_stats_after_workout()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total workouts and minutes
    UPDATE user_statistics
    SET 
        total_workouts = total_workouts + 1,
        total_minutes = total_minutes + COALESCE(NEW.duration_minutes, 0),
        total_calories_burned = total_calories_burned + COALESCE(NEW.calories_burned, 0),
        last_workout_date = NEW.workout_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
    
    -- If no stats record exists, create one
    IF NOT FOUND THEN
        INSERT INTO user_statistics (user_id, total_workouts, total_minutes, total_calories_burned, last_workout_date)
        VALUES (NEW.user_id, 1, COALESCE(NEW.duration_minutes, 0), COALESCE(NEW.calories_burned, 0), NEW.workout_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user statistics
CREATE TRIGGER trg_update_user_stats_after_workout
AFTER INSERT ON training_logs
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_after_workout();

-- ============================================
-- 15. Query Examples (Commented)
-- ============================================

/*
-- Get user's workout history for a specific month
SELECT * FROM training_logs 
WHERE user_id = 1 
AND workout_date >= '2025-10-01' 
AND workout_date < '2025-11-01'
ORDER BY workout_date DESC;

-- Get user's current weekly plan
SELECT wp.*, wpw.*
FROM weekly_plans wp
INNER JOIN weekly_plan_workouts wpw ON wp.id = wpw.weekly_plan_id
WHERE wp.user_id = 1
AND wp.start_date <= CURRENT_DATE
AND wp.end_date >= CURRENT_DATE
ORDER BY wpw.day_index, wpw.order_index;

-- Get user's achievements
SELECT a.*, ua.earned_at, ua.is_completed
FROM achievements a
INNER JOIN user_achievements ua ON a.id = ua.achievement_id
WHERE ua.user_id = 1
ORDER BY ua.earned_at DESC;

-- Get exercise alternatives
SELECT e1.name AS original_exercise, e2.name AS alternative_exercise, ea.reason
FROM exercise_alternatives ea
INNER JOIN exercises e1 ON ea.exercise_id = e1.id
INNER JOIN exercises e2 ON ea.alternative_exercise_id = e2.id
WHERE e1.name = 'Bench Press';

-- Get user's workout streak
WITH daily_workouts AS (
    SELECT DISTINCT workout_date
    FROM training_logs
    WHERE user_id = 1
    ORDER BY workout_date DESC
),
streaks AS (
    SELECT 
        workout_date,
        workout_date - ROW_NUMBER() OVER (ORDER BY workout_date)::INTEGER AS streak_group
    FROM daily_workouts
)
SELECT COUNT(*) AS current_streak
FROM streaks
WHERE streak_group = (SELECT MAX(streak_group) FROM streaks);
*/

-- ============================================
-- Done! Schema is ready for use.
-- ============================================

