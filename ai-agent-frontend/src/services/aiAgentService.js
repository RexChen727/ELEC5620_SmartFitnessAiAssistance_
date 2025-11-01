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
        
        // 计算每个日期在其所在周的 dayIndex（0=周一, 6=周日）
        const getDayIndexForDate = (date) => {
            const dateCopy = new Date(date);
            dateCopy.setHours(0, 0, 0, 0);
            const dayOfWeek = dateCopy.getDay(); // 0=周日, 1=周一, ..., 6=周六
            return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 转换为 0=周一, 6=周日
        };

        // 构建周日期信息字符串
        let weekInfo = '';
        let todayActualDayIndex = null;
        if (weekDates && weekDates.length === 7) {
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const weekInfoList = weekDates.map((date, displayIdx) => {
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const isTodayDate = date.getTime() === actualToday.getTime();
                // 计算该日期在其所在周的 dayIndex（0=周一, 6=周日）
                const actualDayIndex = getDayIndexForDate(date);
                if (isTodayDate) {
                    todayActualDayIndex = actualDayIndex;
                }
                return `  Position ${displayIdx}: ${dayNames[actualDayIndex]} (${dateStr})${isTodayDate ? ' ← TODAY' : ''} - dayIndex: ${actualDayIndex}`;
            }).join('\n');
            weekInfo = `\nDisplay dates (from today, next 7 days):\n${weekInfoList}`;
            if (todayActualDayIndex !== null) {
                const todayDayName = dayNames[todayActualDayIndex];
                weekInfo += `\n**CRITICAL**: TODAY is ${todayDayName} (${todayStr}) with dayIndex: ${todayActualDayIndex} (NOT position 0 in display order, but actual dayIndex in its week!)`;
            }
        }

        return `
You are an intelligent AI fitness assistant that generates structured workout data for a gym app.

User message: """${userMessage}"""
Currently selected day: ${dayName} (dayIndex: ${dayIndex})
**ACTUAL TODAY**: ${todayStr}${todayActualDayIndex !== null ? ` (dayIndex: ${todayActualDayIndex} in its week)` : ''}${weekInfo}

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

1. **Date Extraction - IMPORTANT: dayIndex is relative to Monday of each date's week**
   - dayIndex format: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
   - dayIndex is ALWAYS calculated relative to the Monday of the week that the date belongs to
   - Example: If today is Sunday, its dayIndex is 6 (not 0, even though it's position 0 in display)
   
   - If user mentions "Monday"/"周一", use dayIndex: 0
   - If user mentions "Tuesday"/"周二", use dayIndex: 1
   - If user mentions "Wednesday"/"周三", use dayIndex: 2
   - If user mentions "Thursday"/"周四", use dayIndex: 3
   - If user mentions "Friday"/"周五", use dayIndex: 4
   - If user mentions "Saturday"/"周六", use dayIndex: 5
   - If user mentions "Sunday"/"周日", use dayIndex: 6
   - If user mentions "tomorrow"/"明天", calculate the dayIndex of tomorrow's date based on its week
   - **CRITICAL**: If user mentions "today"/"今天", use TODAY's actual dayIndex: ${todayActualDayIndex !== null ? todayActualDayIndex : 'calculate from date above'} (relative to Monday of today's week)
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
