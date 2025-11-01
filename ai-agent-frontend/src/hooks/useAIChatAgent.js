import { useState, useCallback } from 'react';
import { aiAgentService } from '../services/aiAgentService';
import { weeklyPlanService } from '../services/weeklyPlanService';

// 训练名称字典（支持中英文）
const WORKOUT_NAMES = {
    'chest': ['Bench Press', 'Push-ups', 'Dumbbell Flyes', 'Cable Crossover', 'Incline Press'],
    'back': ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Deadlift', 'Cable Row'],
    'legs': ['Squats', 'Leg Press', 'Lunges', 'Leg Curl', 'Calf Raises'],
    'shoulders': ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Arnold Press'],
    'arms': ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Tricep Extensions', 'Preacher Curls'],
    'core': ['Planks', 'Crunches', 'Leg Raises', 'Russian Twists', 'Mountain Climbers'],
    // 中文肌肉群映射
    '胸部': ['Bench Press', 'Push-ups', 'Dumbbell Flyes', 'Cable Crossover', 'Incline Press'],
    '背部': ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Deadlift', 'Cable Row'],
    '腿部': ['Squats', 'Leg Press', 'Lunges', 'Leg Curl', 'Calf Raises'],
    '肩部': ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Arnold Press'],
    '手臂': ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Tricep Extensions', 'Preacher Curls'],
    '核心': ['Planks', 'Crunches', 'Leg Raises', 'Russian Twists', 'Mountain Climbers']
};

// 肌肉群名称映射（中文→英文）
const MUSCLE_GROUP_MAP = {
    '胸部': 'chest',
    '背部': 'back',
    '腿部': 'legs',
    '肩部': 'shoulders',
    '手臂': 'arms',
    '核心': 'core'
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * AI Chat Agent Hook
 * 封装 AI 聊天相关的状态和操作逻辑
 */
export const useAIChatAgent = (user, weeklyPlan, selectedDay, loadAllPlans) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            welcome: true,
            content: "Hi! I'm your AI fitness planner! If you're feeling lost about your training plan, let me help you out! You can share your needs with me, or click:",
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    /**
     * 处理 add_workout 操作
     */
    const handleAddWorkout = useCallback(async (intent) => {
        if (!intent.parameters) return '参数缺失';

        try {
            // 处理中英文肌肉群名称
            let muscleGroup = intent.parameters.muscleGroup || 'General';
            // 如果是中文，先转换为英文key用于查找
            const normalizedGroup = MUSCLE_GROUP_MAP[muscleGroup] || muscleGroup.toLowerCase();
            
            const count = intent.parameters.count || 1;
            const sets = intent.parameters.sets || 3;
            const reps = intent.parameters.reps || 12;
            const weight = intent.parameters.weight || '';
            const intensity = intent.parameters.intensity || '';
            
            // 使用normalizedGroup查找训练列表
            const exercises = WORKOUT_NAMES[normalizedGroup] || WORKOUT_NAMES['chest'] || WORKOUT_NAMES[muscleGroup] || WORKOUT_NAMES['chest'];
            
            // 添加指定数量的训练
            for (let i = 0; i < Math.min(count, exercises.length); i++) {
                const workoutData = {
                    dayIndex: selectedDay,
                    workoutName: exercises[i],
                    sets: sets,
                    reps: reps,
                    weight: weight || '',
                    duration: '',
                    notes: `AI generated ${muscleGroup} workout${intensity ? ` - ${intensity}` : ''}`,
                    completed: false
                };
                
                // 只有当 weeklyPlan 存在时才发送 planId
                if (weeklyPlan && weeklyPlan.id) {
                    workoutData.planId = weeklyPlan.id;
                }
                
                await weeklyPlanService.addWorkout(user.id, workoutData);
            }
            
            await loadAllPlans();
            return intent.response || `✅ 已为您添加 ${count} 个${muscleGroup}训练！`;
        } catch (error) {
            return `❌ 添加失败：${error.response?.data?.error || error.message}`;
        }
    }, [user, weeklyPlan, selectedDay, loadAllPlans]);

    /**
     * 处理 clear_day 操作
     */
    const handleClearDay = useCallback(async (intent) => {
        if (!weeklyPlan) {
            return '您还没有创建本周的训练计划，无法清除训练。';
        }

        try {
            await weeklyPlanService.clearDayWorkouts(weeklyPlan.id, selectedDay, user.id);
            await loadAllPlans();
            return intent.response || `✅ 已清除 ${DAYS[selectedDay]} 的所有训练！`;
        } catch (error) {
            return `❌ 清除失败：${error.response?.data?.error || error.message}`;
        }
    }, [weeklyPlan, selectedDay, user, loadAllPlans]);

    /**
     * 发送消息
     */
    const sendMessage = useCallback(async (messageContent) => {
        if (!user) return;

        // 添加用户消息
        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: messageContent,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsThinking(true);

        try {
            // 构建意图识别提示词
            const intentPrompt = aiAgentService.buildIntentPrompt(
                messageContent,
                DAYS[selectedDay]
            );

            // 调用 AI
            const response = await aiAgentService.sendMessage(user.id, intentPrompt);
            const intent = aiAgentService.parseResponse(response.response);

            let aiResponseContent = '';

            // 根据意图执行相应操作
            if (intent.isAction) {
                switch (intent.action) {
                    case 'clear_day':
                        aiResponseContent = await handleClearDay(intent);
                        break;

                    case 'add_workout':
                        aiResponseContent = await handleAddWorkout(intent);
                        break;

                    default:
                        aiResponseContent = intent.response || '我理解了您的需求，但这个操作暂时还不支持。';
                }
            } else {
                // 普通对话
                aiResponseContent = intent.response;
            }

            // 添加 AI 响应
            const aiResponse = {
                id: messages.length + 2,
                type: 'ai',
                content: aiResponseContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error('Error calling AI:', error);
            const errorResponse = {
                id: messages.length + 2,
                type: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsThinking(false);
        }
    }, [user, messages.length, selectedDay, weeklyPlan, handleClearDay, handleAddWorkout]);

    /**
     * 添加 AI 消息（用于按钮点击触发的快捷操作）
     */
    const pushAIMessage = useCallback((content) => {
        const aiMsg = {
            id: messages.length + 1,
            type: 'ai',
            timestamp: new Date(),
            content
        };
        setMessages(prev => [...prev, aiMsg]);
    }, [messages.length]);

    return {
        messages,
        isThinking,
        sendMessage,
        pushAIMessage,
        setMessages
    };
};

