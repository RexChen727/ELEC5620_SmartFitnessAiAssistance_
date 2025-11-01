import axios from 'axios';

/**
 * AI Agent Service
 * 封装所有与 AI 交互相关的 API 调用
 */
export const aiAgentService = {
    /**
     * 发送消息给 AI
     */
    async sendMessage(userId, message, conversationId = null) {
        const response = await axios.post(`/api/chat/general?userId=${userId}`, {
            message,
            conversationId
        });
        return response.data;
    },

    /**
     * 解析 AI 响应
     * 尝试将响应解析为 JSON，如果失败则作为普通文本处理
     */
    parseResponse(responseText) {
        try {
            // 移除可能的 markdown 代码块标记
            const cleanText = responseText.trim()
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '');
            return JSON.parse(cleanText);
        } catch (parseError) {
            // 如果无法解析为 JSON，当作普通对话处理
            return {
                isAction: false,
                response: responseText
            };
        }
    },

    /**
     * 构建智能化的意图识别 Prompt
     * 支持中英文输入、自然语言理解与可扩展动作
     */
    buildIntentPrompt(userMessage, currentDay) {
        // 自动检测语言
        const lang = /[\u4e00-\u9fa5]/.test(userMessage) ? 'zh' : 'en';

        // 英文版本
        const promptEN = `
You are an intelligent bilingual (English + Chinese) AI fitness assistant.
Understand what the user wants from their natural message and classify it as either:
1. an ACTION command (add/remove/clear/update/copy/mark_complete), or
2. a general conversation.

User message: """${userMessage}"""
Current context:
- Selected day: ${currentDay}

Respond ONLY in valid JSON. 
If it's an ACTION, use:
{
  "isAction": true,
  "action": "add_workout" | "remove_workout" | "clear_day" | "update_workout" | "copy_next_week" | "mark_complete" | "general_response",
  "parameters": {
    "muscleGroup": "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | null,
    "count": number | null,
    "sets": number | null,
    "reps": number | null,
    "weight": string | null,
    "intensity": "light" | "medium" | "hard" | null
  },
  "response": "Short, friendly, motivational confirmation in user's language"
}

If it's NOT an action, respond as:
{
  "isAction": false,
  "response": "Natural, empathetic, and short conversation reply"
}

Guidelines:
- Keep JSON clean with no markdown or code blocks.
- Be adaptive to tone: if user sounds tired → suggest rest; if excited → encourage.
- Reply in the same language as the user (English ↔ Chinese).
`;

        // 中文版本
        const promptZH = `
你是一个智能的中英双语AI健身助手。
请理解用户自然语言输入的真实意图，并将其分类为：
1. 操作命令（添加/删除/清空/修改/复制/标记完成），或
2. 普通对话。

用户输入："""${userMessage}"""
当前上下文：
- 当前日期：${currentDay}

仅以合法JSON格式输出：
如果是操作命令，使用以下格式：
{
  "isAction": true,
  "action": "add_workout" | "remove_workout" | "clear_day" | "update_workout" | "copy_next_week" | "mark_complete" | "general_response",
  "parameters": {
    "muscleGroup": "胸部" | "背部" | "腿部" | "肩部" | "手臂" | "核心" | null,
    "count": 数量或null,
    "sets": 组数或null,
    "reps": 次数或null,
    "weight": 重量或null,
    "intensity": "轻松" | "中等" | "高强度" | null
  },
  "response": "简短、友好且带鼓励语气的回复"
}

如果不是操作命令，请输出：
{
  "isAction": false,
  "response": "自然、同理心强、简洁的聊天回复"
}

输出要求：
- 严格保持JSON格式，不要包含markdown或解释说明。
- 如果用户看起来疲惫，建议休息；如果积极，鼓励继续努力。
- 回复语言应与用户一致。
`;

        return lang === 'zh' ? promptZH : promptEN;
    }
};

