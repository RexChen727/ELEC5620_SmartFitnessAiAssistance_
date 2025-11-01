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
     * AI directly returns complete workouts array
     */
    buildIntentPrompt(userMessage, dayIndex, dayName, weekDates = null) {
        // 获取实际的今天日期
        const actualToday = new Date();
        actualToday.setHours(0, 0, 0, 0);
        const todayStr = actualToday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        // 构建周日期信息字符串
        let weekInfo = '';
        let todayDayIndex = null;
        if (weekDates && weekDates.length === 7) {
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const weekInfoList = weekDates.map((date, idx) => {
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const isTodayDate = date.getTime() === actualToday.getTime();
                if (isTodayDate) {
                    todayDayIndex = idx;
                }
                return `  ${dayNames[idx]} (${dateStr})${isTodayDate ? ' ← TODAY' : ''} - dayIndex: ${idx}`;
            }).join('\n');
            weekInfo = `\nCurrent week dates:\n${weekInfoList}`;
            if (todayDayIndex !== null) {
                weekInfo += `\n**IMPORTANT**: TODAY is ${dayNames[todayDayIndex]} (${todayStr}) with dayIndex: ${todayDayIndex}`;
            }
        }

        return `
You are an intelligent AI fitness assistant that generates structured workout data for a gym app.

User message: """${userMessage}"""
Currently selected day: ${dayName} (dayIndex: ${dayIndex})
**ACTUAL TODAY**: ${todayStr}${todayDayIndex !== null ? ` (dayIndex: ${todayDayIndex})` : ''}${weekInfo}

Your job:
- Understand whether the message is an ACTION command or general conversation.
- **IMPORTANT**: If the user mentions a specific day (e.g. "Monday", "Tuesday", "明天", "周五", "Friday"), extract it from the message and use the corresponding dayIndex from the week dates above.
- If no day is mentioned, use the currently selected dayIndex: ${dayIndex}.
- If ACTION, return detailed workout JSON strictly following the schema below.

---

### JSON FORMAT

#### ACTION
{
  "isAction": true,
  "action": "add_workout" | "remove_workout" | "clear_day" | "update_workout" | "mark_complete",
  "parameters": {
    "dayIndex": <extracted_dayIndex_or_default_${dayIndex}>,
    "muscleGroup": "legs" | "chest" | "back" | "shoulders" | "arms" | "core" | null,
    "intensity": "light" | "medium" | "hard" | null,
    "workouts": [
      {
        "workoutName": string,
        "sets": number,
        "reps": number,
        "weight": string | null,
        "duration": string | null,
        "notes": string | null,
        "completed": boolean
      }
    ]
  },
  "response": "Short motivational sentence in user's language"
}

#### GENERAL
{
  "isAction": false,
  "response": "Natural, empathetic, concise chat reply"
}

---

### LOGIC RULES

1. **Date Extraction**
   - If user mentions "Monday"/"周一", use dayIndex: 0
   - If user mentions "Tuesday"/"周二", use dayIndex: 1
   - If user mentions "Wednesday"/"周三", use dayIndex: 2
   - If user mentions "Thursday"/"周四", use dayIndex: 3
   - If user mentions "Friday"/"周五", use dayIndex: 4
   - If user mentions "Saturday"/"周六", use dayIndex: 5
   - If user mentions "Sunday"/"周日", use dayIndex: 6
   - If user mentions "tomorrow"/"明天", calculate based on TODAY's dayIndex (${todayDayIndex !== null ? todayDayIndex : 'see above'})
   - **CRITICAL**: If user mentions "today"/"今天", use the ACTUAL TODAY's dayIndex (${todayDayIndex !== null ? todayDayIndex : 'see above'}), NOT the currently selected dayIndex
   - If NO day mentioned, use currently selected dayIndex: ${dayIndex}

2. **Workout Plan Generation**
   - If the user only mentions a muscle group (e.g. "train legs"), 
     generate **3–5 workouts** targeting that group.
   - Default values:
     - sets = 3, reps = 12, duration = "30min", completed = false
     - weight can be "bodyweight" if not specified
     - intensity affects sets:
       - light → 2–3 sets
       - medium → 3–4 sets
       - hard → 4–5 sets
   - Example workout library:
     - legs → ["Squats", "Lunges", "Leg Press", "Leg Curls", "Calf Raises"]
     - chest → ["Bench Press", "Push Ups", "Chest Fly", "Incline Dumbbell Press"]
     - back → ["Pull Ups", "Lat Pulldown", "Seated Row", "Deadlift"]
     - shoulders → ["Overhead Press", "Lateral Raise", "Arnold Press"]
     - arms → ["Bicep Curls", "Tricep Dips", "Hammer Curls"]
     - core → ["Plank", "Crunches", "Leg Raises", "Russian Twists"]

3. **Emotion Awareness**
   - If user sounds tired → suggest rest.
   - If excited → encourage.
   - Response must match user language.

4. **Output Rules**
   - Always return valid JSON.
   - No markdown or code blocks.
   - Never return just one workout if the user asked for a muscle group plan.
   - Default intensity = "medium".
   - Extract dayIndex from user message if mentioned, otherwise use ${dayIndex}.

---

Respond only with JSON.
`;
    }
};
