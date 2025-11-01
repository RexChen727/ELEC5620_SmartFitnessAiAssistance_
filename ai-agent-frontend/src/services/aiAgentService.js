import axios from 'axios';

/**
 * AI Agent Service
 * Handles all AI-related API interactions
 */
export const aiAgentService = {
    /**
     * Send message to AI backend
     */
    async sendMessage(userId, message, conversationId = null) {
        const response = await axios.post(`/api/chat/general?userId=${userId}`, {
            message,
            conversationId
        });
        return response.data;
    },

    /**
     * Parse AI response
     * Try to parse as JSON; if failed, treat as plain text
     */
    parseResponse(responseText) {
        try {
            // Remove markdown code fences if present
            const cleanText = responseText.trim()
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '');
            return JSON.parse(cleanText);
        } catch (parseError) {
            // Return fallback for conversational text
            return {
                isAction: false,
                response: responseText
            };
        }
    },

    /**
     * Build intelligent intent-recognition prompt
     * 适配本地处理逻辑：使用 muscleGroup + count 方式
     */
    buildIntentPrompt(userMessage, currentDay) {
        return `
You are an intelligent AI fitness assistant.
Understand what the user wants from their natural message and classify it as either:
1. an ACTION command (add/remove/clear/update/mark_complete), or
2. a general conversation.

User message: """${userMessage}"""
Current context:
- Selected day: ${currentDay}

Respond ONLY in valid JSON. 
If it's an ACTION, use:
{
  "isAction": true,
  "action": "add_workout" | "remove_workout" | "clear_day" | "update_workout" | "mark_complete" | "general_response",
  "parameters": {
    "muscleGroup": "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | null,
    "count": number | null,
    "sets": number | null,
    "reps": number | null,
    "weight": string | null,
    "intensity": "light" | "medium" | "hard" | null
  },
  "response": "Short, friendly, motivational confirmation message"
}

If it's NOT an action, respond as:
{
  "isAction": false,
  "response": "Natural, empathetic, and short conversation reply"
}

Guidelines:
- Keep JSON clean with no markdown or code blocks.
- Be adaptive to tone: if user sounds tired → suggest rest; if excited → encourage.
- For add_workout: extract muscleGroup and count from user message. Default count is 3-5 if not specified.
- The system will use the muscleGroup to select exercises from a predefined list.
- Always respond in English.
`;
    }
};
