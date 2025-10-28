-- Weekly Plan Database Queries
-- Use these queries in pgAdmin Query Tool to view your weekly plan data

-- ============================================
-- 1. View All Weekly Plans
-- ============================================
SELECT 
    wp.id,
    u.username,
    u.email,
    wp.start_date,
    wp.end_date,
    wp.created_at,
    COUNT(wpw.id) as total_workouts,
    COUNT(CASE WHEN wpw.completed = true THEN 1 END) as completed_workouts
FROM weekly_plans wp
JOIN users u ON wp.user_id = u.id
LEFT JOIN weekly_plan_workouts wpw ON wp.id = wpw.weekly_plan_id
GROUP BY wp.id, u.username, u.email, wp.start_date, wp.end_date, wp.created_at
ORDER BY wp.start_date DESC;

-- ============================================
-- 2. View Workouts for a Specific Weekly Plan
-- ============================================
-- Replace {plan_id} with the actual plan ID
SELECT 
    wpw.id,
    CASE 
        WHEN wpw.day_index = 0 THEN 'Monday'
        WHEN wpw.day_index = 1 THEN 'Tuesday'
        WHEN wpw.day_index = 2 THEN 'Wednesday'
        WHEN wpw.day_index = 3 THEN 'Thursday'
        WHEN wpw.day_index = 4 THEN 'Friday'
        WHEN wpw.day_index = 5 THEN 'Saturday'
        WHEN wpw.day_index = 6 THEN 'Sunday'
    END as day_name,
    wpw.workout_name,
    wpw.sets,
    wpw.reps,
    wpw.weight,
    wpw.duration,
    wpw.completed,
    wpw.notes
FROM weekly_plan_workouts wpw
WHERE wpw.weekly_plan_id = {plan_id}
ORDER BY wpw.day_index, wpw.id;

-- ============================================
-- 3. View Current User's Weekly Plans (All Plans)
-- ============================================
-- Replace {user_id} with your user ID (usually 1 for the first user)
SELECT 
    wp.id as plan_id,
    wp.start_date,
    wp.end_date,
    wp.created_at,
    COUNT(wpw.id) as total_workouts
FROM weekly_plans wp
LEFT JOIN weekly_plan_workouts wpw ON wp.id = wpw.weekly_plan_id
WHERE wp.user_id = {user_id}
GROUP BY wp.id, wp.start_date, wp.end_date, wp.created_at
ORDER BY wp.start_date DESC;

-- ============================================
-- 4. View Workouts Grouped by Day for a User's Current Plan
-- ============================================
-- Get the most recent plan for a user
WITH current_plan AS (
    SELECT id
    FROM weekly_plans
    WHERE user_id = {user_id}
    ORDER BY start_date DESC
    LIMIT 1
)
SELECT 
    CASE 
        WHEN wpw.day_index = 0 THEN 'Monday'
        WHEN wpw.day_index = 1 THEN 'Tuesday'
        WHEN wpw.day_index = 2 THEN 'Wednesday'
        WHEN wpw.day_index = 3 THEN 'Thursday'
        WHEN wpw.day_index = 4 THEN 'Friday'
        WHEN wpw.day_index = 5 THEN 'Saturday'
        WHEN wpw.day_index = 6 THEN 'Sunday'
    END as day,
    wpw.workout_name as workout,
    wpw.sets,
    wpw.reps,
    wpw.weight,
    wpw.duration,
    wpw.completed,
    CASE WHEN wpw.completed THEN '✓' ELSE '○' END as status
FROM weekly_plan_workouts wpw
WHERE wpw.weekly_plan_id = (SELECT id FROM current_plan)
ORDER BY wpw.day_index, wpw.id;

-- ============================================
-- 5. View Weekly Plan Summary with Progress
-- ============================================
SELECT 
    u.username,
    wp.start_date,
    wp.end_date,
    COUNT(wpw.id) as total_workouts,
    COUNT(CASE WHEN wpw.completed = true THEN 1 END) as completed,
    COUNT(CASE WHEN wpw.completed = false THEN 1 END) as pending,
    ROUND(COUNT(CASE WHEN wpw.completed = true THEN 1 END) * 100.0 / NULLIF(COUNT(wpw.id), 0), 2) as completion_percentage
FROM weekly_plans wp
JOIN users u ON wp.user_id = u.id
LEFT JOIN weekly_plan_workouts wpw ON wp.id = wpw.weekly_plan_id
WHERE wp.user_id = {user_id}
GROUP BY u.username, wp.id, wp.start_date, wp.end_date
ORDER BY wp.start_date DESC;

-- ============================================
-- 6. View Workout Distribution by Day
-- ============================================
SELECT 
    CASE 
        WHEN wpw.day_index = 0 THEN 'Monday'
        WHEN wpw.day_index = 1 THEN 'Tuesday'
        WHEN wpw.day_index = 2 THEN 'Wednesday'
        WHEN wpw.day_index = 3 THEN 'Thursday'
        WHEN wpw.day_index = 4 THEN 'Friday'
        WHEN wpw.day_index = 5 THEN 'Saturday'
        WHEN wpw.day_index = 6 THEN 'Sunday'
    END as day,
    COUNT(wpw.id) as workout_count,
    COUNT(CASE WHEN wpw.completed = true THEN 1 END) as completed_count
FROM weekly_plan_workouts wpw
WHERE wpw.weekly_plan_id = {plan_id}
GROUP BY wpw.day_index
ORDER BY wpw.day_index;

-- ============================================
-- 7. Find All Workouts by Name (Search)
-- ============================================
-- Replace 'Bench Press' with the workout you want to search for
SELECT 
    wp.start_date,
    wp.end_date,
    wpw.day_index,
    wpw.workout_name,
    wpw.sets,
    wpw.reps,
    wpw.weight,
    wpw.duration
FROM weekly_plan_workouts wpw
JOIN weekly_plans wp ON wpw.weekly_plan_id = wp.id
WHERE wpw.workout_name ILIKE '%Bench Press%'
ORDER BY wp.start_date DESC, wpw.day_index;

-- ============================================
-- 8. View Recent Weekly Plans with Workout Details
-- ============================================
SELECT 
    wp.id as plan_id,
    wp.start_date,
    wp.end_date,
    wpw.day_index,
    wpw.workout_name,
    wpw.sets,
    wpw.reps,
    wpw.weight,
    wpw.duration,
    wpw.completed
FROM weekly_plans wp
LEFT JOIN weekly_plan_workouts wpw ON wp.id = wpw.weekly_plan_id
WHERE wp.user_id = {user_id}
ORDER BY wp.start_date DESC, wpw.day_index, wpw.id
LIMIT 50;

-- ============================================
-- 9. Delete a Weekly Plan (Be Careful!)
-- ============================================
-- WARNING: This will delete the plan and all its workouts
-- DELETE FROM weekly_plan_workouts WHERE weekly_plan_id = {plan_id};
-- DELETE FROM weekly_plans WHERE id = {plan_id};

-- ============================================
-- 10. Update Workout Completion Status
-- ============================================
-- UPDATE weekly_plan_workouts 
-- SET completed = true 
-- WHERE id = {workout_id};

-- ============================================
-- QUICK REFERENCE
-- ============================================
-- To find your user_id:
SELECT id, username, email FROM users;

-- To find all tables:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- To view table structure:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'weekly_plans';

-- To view all weekly plans simply:
SELECT * FROM weekly_plans;

-- To view all workouts:
SELECT * FROM weekly_plan_workouts;
