# 项目启动说明

## 当前状态

✅ Ollama服务已启动  
✅ 前端依赖已安装  
✅ 数据库已创建 (aiagentdb)  
⚠️ **需要配置PostgreSQL密码**

## 快速启动步骤

### 1. 找到你的PostgreSQL密码

你的PostgreSQL密码是你在pgAdmin中连接服务器时使用的密码。如果没有特别设置，可能是：
- 安装时设置的密码
- 默认的 `postgres`
- 查看 pgAdmin 的连接配置

### 2. 更新配置文件

编辑文件：`ai-agent-backend/src/main/resources/application.properties`

找到这两行并更新密码：
```properties
spring.datasource.username=postgres
spring.datasource.password=你的实际密码
```

### 3. 启动服务

#### 启动后端：
```bash
cd ELEC5620_SmartFitnessAiAssistance_/ai-agent-backend
./gradlew bootRun
```

等待看到 "Started AiAgentApplication" 消息

#### 启动前端（新终端窗口）：
```bash
cd ELEC5620_SmartFitnessAiAssistance_/ai-agent-frontend
npm run dev
```

### 4. 访问应用

- 前端：http://localhost:5173
- API文档：http://localhost:8080/swagger-ui.html

## 或者：使用专用用户（更安全）

在pgAdmin中执行以下SQL：

```sql
-- 连接 aiagentdb 数据库
CREATE USER aiagentuser WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE aiagentdb TO aiagentuser;
GRANT ALL ON SCHEMA public TO aiagentuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aiagentuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aiagentuser;
```

然后修改 `application.properties` 使用 `aiagentuser` 用户。

