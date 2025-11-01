-- 创建数据库
CREATE DATABASE aiagentdb;

-- 切换到新数据库
\c aiagentdb

-- 创建用户（如果不存在）
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_user
      WHERE  usename = 'aiagentuser') THEN
      CREATE USER aiagentuser WITH PASSWORD 'password123';
   END IF;
END
$do$;

-- 授予所有权限
GRANT ALL PRIVILEGES ON DATABASE aiagentdb TO aiagentuser;

-- 授予schema权限（PostgreSQL 15+需要）
GRANT ALL ON SCHEMA public TO aiagentuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aiagentuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aiagentuser;

