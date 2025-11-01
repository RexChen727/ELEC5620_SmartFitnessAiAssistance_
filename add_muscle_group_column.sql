-- 为 weekly_plan_workouts 表添加 muscle_group 字段
-- 用于存储每日训练的肌群标签（如 Chest, Back, Legs, Rest 等）

\c aiagentdb

ALTER TABLE weekly_plan_workouts 
ADD COLUMN IF NOT EXISTS muscle_group VARCHAR(100);

COMMENT ON COLUMN weekly_plan_workouts.muscle_group IS '训练日的肌群标签，如 Chest, Back, Legs, Shoulders, Arms, Core, Cardio, Full Body, Rest';

