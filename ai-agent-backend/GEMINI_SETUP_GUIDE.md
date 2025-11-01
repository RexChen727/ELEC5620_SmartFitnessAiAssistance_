# Google Gemini API 配置指南

## 📋 前提条件

1. 已创建 Google Cloud 项目
2. 已启用 Gemini API
3. 已生成 API Key

---

## 🔧 配置步骤

### 1. 更新配置文件

打开配置文件：
```bash
nano ai-agent-backend/src/main/resources/application.properties
```

### 2. 填入你的 API Key

找到第 22 行，将 `YOUR_GEMINI_API_KEY_HERE` 替换为你的真实 API Key：

```properties
# AI Model Configuration
# Current: Google Gemini
ai.model.base-url=https://generativelanguage.googleapis.com/v1beta/models
ai.model.name=gemini-1.5-flash
ai.model.api-key=YOUR_ACTUAL_GEMINI_API_KEY_HERE
```

**示例：**
```properties
ai.model.api-key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 重启后端服务

```bash
# 停止当前运行的服务（按 Ctrl+C）
# 然后重新启动
cd ai-agent-backend
./gradlew bootRun
```

---

## 🎯 可用的 Gemini 模型

根据你的需求，可以选择不同的模型：

| 模型名称 | 特点 | 适用场景 |
|---------|------|---------|
| `gemini-1.5-flash` | 快速、高效 ⚡ | **推荐**：日常对话、健身建议 |
| `gemini-1.5-pro` | 高质量、深度理解 | 复杂分析、专业建议 |
| `gemini-pro` | 稳定版本 | 生产环境 |

**修改模型示例：**
```properties
ai.model.name=gemini-1.5-pro
```

---

## ✅ 验证配置

### 方法 1：查看后端日志

启动后端后，观察日志输出：
```bash
# 应该看到类似的日志
INFO ... Starting AiAgentApplication ...
INFO ... Tomcat started on port(s): 8080
```

### 方法 2：测试 AI 聊天

1. 访问前端：`http://localhost:5173/weekly-plan`
2. 点击右侧聊天框的 "Training Intensity" 或 "Training Objectives"
3. 如果 AI 能正常回复，说明配置成功 ✅

### 方法 3：查看 API 调用日志

后端日志会显示：
```
INFO ... Raw AI model response: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
INFO ... Extracted AI response: ...
```

---

## 🔄 切换回其他 AI 提供商

### 切换到本地 Ollama

```properties
# Local Ollama
ai.model.base-url=http://localhost:11434/api
ai.model.name=llama3.2
ai.model.api-key=
```

### 切换到 OpenAI

```properties
# OpenAI
ai.model.base-url=https://api.openai.com/v1
ai.model.name=gpt-3.5-turbo
ai.model.api-key=YOUR_OPENAI_API_KEY
```

---

## 🚨 常见问题

### 问题 1：API Key 无效
**错误信息：** `403 Forbidden` 或 `Invalid API Key`

**解决方案：**
1. 检查 API Key 是否正确复制（没有多余空格）
2. 确认 API Key 在 Google Cloud Console 中已启用
3. 检查 API Key 的权限设置

### 问题 2：配额超限
**错误信息：** `429 Too Many Requests` 或 `Quota exceeded`

**解决方案：**
1. 查看 Google Cloud Console 的配额使用情况
2. 升级配额或等待配额重置
3. 临时切换到本地 Ollama

### 问题 3：后端无法启动
**可能原因：** 配置文件格式错误

**解决方案：**
```bash
# 检查配置文件语法
cat ai-agent-backend/src/main/resources/application.properties

# 确保每行格式为：key=value
# 不要有多余的引号或空格
```

### 问题 4：AI 回复为空
**可能原因：** 响应解析失败

**解决方案：**
1. 查看后端日志中的 `Raw AI model response`
2. 确认使用的是支持的 Gemini 模型名称
3. 检查网络连接是否正常

---

## 📊 性能对比

| 提供商 | 响应速度 | 成本 | 质量 | 离线使用 |
|--------|---------|------|------|---------|
| **Gemini 1.5 Flash** | ⚡⚡⚡ 快 | 💰 低 | ⭐⭐⭐⭐ 高 | ❌ 否 |
| Gemini 1.5 Pro | ⚡⚡ 中 | 💰💰 中 | ⭐⭐⭐⭐⭐ 很高 | ❌ 否 |
| OpenAI GPT-3.5 | ⚡⚡⚡ 快 | 💰💰 中 | ⭐⭐⭐⭐ 高 | ❌ 否 |
| Ollama (本地) | ⚡ 慢 | 💰 免费 | ⭐⭐⭐ 中 | ✅ 是 |

---

## 🔗 相关链接

- [Google AI Studio](https://makersuite.google.com/app/apikey) - 生成 API Key
- [Gemini API 文档](https://ai.google.dev/docs)
- [定价信息](https://ai.google.dev/pricing)

---

## 💡 提示

1. **不要提交 API Key 到 Git**
   ```bash
   # 确保 application.properties 在 .gitignore 中
   # 或使用环境变量
   ```

2. **使用环境变量（可选）**
   ```bash
   export AI_MODEL_API_KEY=your-gemini-api-key
   ```
   然后在代码中使用 `${AI_MODEL_API_KEY}`

3. **监控使用量**
   定期检查 Google Cloud Console 的 API 使用情况

---

✅ **配置完成后，你的 AI 健身助手就可以使用 Gemini 的强大能力了！**

