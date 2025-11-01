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
    buildIntentPrompt(userMessage, dayIndex, dayName) {
        return `
You are an intelligent AI fitness assistant that generates structured workout data for a gym app.

User message: """${userMessage}"""
Current day: ${dayName} (dayIndex: ${dayIndex})

Your job:
- Understand whether the message is an ACTION command or general conversation.
- If ACTION, return detailed workout JSON strictly following the schema below.

---

### JSON FORMAT

#### ACTION
{
  "isAction": true,
  "action": "add_workout" | "remove_workout" | "clear_day" | "update_workout" | "mark_complete",
  "parameters": {
    "dayIndex": ${dayIndex},
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

1. **Workout Plan Generation**
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

2. **Emotion Awareness**
   - If user sounds tired → suggest rest.
   - If excited → encourage.
   - Response must match user language.

3. **Output Rules**
   - Always return valid JSON.
   - No markdown or code blocks.
   - Never return just one workout if the user asked for a muscle group plan.
   - Default intensity = "medium".
   - Always use dayIndex: ${dayIndex} in parameters.

---

Respond only with JSON.
`;
    }
};
