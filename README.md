# AI Agent Project

一个基于 Spring Boot + React 的 AI 智能助手项目框架，支持多种 AI 代理类型和对话管理。

## 🚀 技术栈

### 后端

- **Spring Boot 3.3.2** - Java 17
- **Spring Data JPA** - 数据持久化
- **PostgreSQL** - 数据库
- **SpringDoc OpenAPI** - API 文档
- **Ollama** - AI 模型集成

### 前端

- **React 18** - 用户界面
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **React Markdown** - Markdown 渲染

## 📁 项目结构

```
ai-agent-project/
├── ai-agent-backend/          # Spring Boot后端
│   ├── src/main/java/com/aiagent/main/
│   │   ├── config/           # 配置类
│   │   ├── controller/       # REST控制器
│   │   ├── entity/          # 数据实体
│   │   ├── repository/      # 数据访问层
│   │   ├── service/         # 业务逻辑层
│   │   └── utils/           # 工具类
│   └── src/main/resources/
│       └── application.properties
└── ai-agent-frontend/        # React前端
    ├── src/
    │   ├── components/      # React组件
    │   ├── App.jsx         # 主应用组件
    │   └── main.jsx        # 应用入口
    └── package.json
```

## 🛠️ 快速开始

### 1. 环境准备

确保已安装：

- Java 17+
- Node.js 18+
- PostgreSQL
- Ollama (AI 模型服务)

### 2. 数据库设置

```sql
-- 创建数据库
CREATE DATABASE aiagentdb;

-- 创建用户
CREATE USER aiagentuser WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE aiagentdb TO aiagentuser;
```

### 3. 启动 Ollama 服务

```bash
# 安装并启动Ollama
ollama serve

# 拉取AI模型
ollama pull llama3.2
```

### 4. 启动后端

```bash
cd ai-agent-backend
./gradlew bootRun
```

后端服务将在 `http://localhost:8080` 启动

### 5. 启动前端

```bash
cd ai-agent-frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

## 📚 API 文档

启动后端后，访问以下地址查看 API 文档：

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

## 🤖 AI 代理类型

项目支持以下 AI 代理类型：

1. **General Assistant** (`general`) - 通用助手
2. **Coding Assistant** (`coding`) - 编程助手
3. **Creative Writer** (`creative`) - 创意写作助手
4. **Analytical Assistant** (`analytical`) - 分析助手
5. **Fitness Assistant** (`fitness`) - 智能健身助手 💪

### 智能健身助手功能

智能健身助手是一个专门的 AI 代理，帮助用户在健身房器械被占用时，提供合适的替代方案。

**主要特性：**

- 🤖 AI 智能推荐替代器械
- 💪 内置常见健身器械知识库
- 🎯 基于肌群智能匹配
- 📝 提供详细训练建议和安全提示
- 🔄 支持多轮对话

**使用方法：**

```bash
# 访问健身助手界面
http://localhost:5173/fitness
```

详细使用说明请查看 [FITNESS_ASSISTANT_README.md](./FITNESS_ASSISTANT_README.md)

## 🔧 配置说明

### 后端配置 (`application.properties`)

```properties
# 数据库配置
spring.datasource.url=jdbc:postgresql://localhost:5432/aiagentdb
spring.datasource.username=aiagentuser
spring.datasource.password=password123

# AI模型配置
ai.model.base-url=http://localhost:11434/api
ai.model.name=llama3.2
```

### 前端配置 (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

## 📝 主要功能

- ✅ 用户注册/登录
- ✅ 多类型 AI 代理对话
- ✅ 智能健身助手（器械替代方案推荐）
- ✅ 健身器械知识库管理
- ✅ 对话历史管理
- ✅ 实时消息传递
- ✅ Markdown 消息渲染
- ✅ 响应式 UI 设计
- ✅ API 文档自动生成

## 🔄 开发工作流

1. **后端开发**: 在 `ai-agent-backend/src/main/java/com/aiagent/main/` 目录下编辑
2. **前端开发**: 在 `ai-agent-frontend/src/components/` 目录下编辑
3. **数据库变更**: 修改实体类，Hibernate 会自动更新表结构
4. **API 测试**: 使用 Swagger UI 或 Postman 测试接口

## 🚀 部署建议

### 生产环境配置

1. **数据库**: 使用云数据库服务
2. **AI 模型**: 部署到 GPU 服务器或使用云 AI 服务
3. **前端**: 构建静态文件部署到 CDN
4. **后端**: 使用 Docker 容器化部署

### Docker 部署示例

```dockerfile
# 后端Dockerfile
FROM openjdk:17-jdk-slim
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📞 支持

如有问题，请检查：

1. 数据库连接是否正常
2. Ollama 服务是否运行
3. 端口是否被占用
4. 依赖是否正确安装

## 📄 许可证

MIT License
