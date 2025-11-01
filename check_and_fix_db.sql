-- 检查并修复数据库结构
\c aiagentdb

-- 查看当前表结构
\d weekly_plan_workouts

-- 添加 muscle_group 字段(如果不存在)
ALTER TABLE weekly_plan_workouts 
ADD COLUMN IF NOT EXISTS muscle_group VARCHAR(100);

-- 再次查看表结构确认
\d weekly_plan_workouts

-- 查看现有数据
SELECT id, workout_name, day_index, muscle_group 
FROM weekly_plan_workouts 
LIMIT 10;

