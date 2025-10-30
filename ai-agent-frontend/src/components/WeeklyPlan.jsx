import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Dumbbell, Clock, Edit3, Plus, CheckCircle, Star, ArrowRight, BarChart3, MessageCircle, Settings, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext';
import AddWorkoutDialog from './AddWorkoutDialog';
import EditWorkoutDialog from './EditWorkoutDialog';

const WeeklyPlan = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [selectedDay, setSelectedDay] = useState(0);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [allPlans, setAllPlans] = useState([]);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [workoutsByDay, setWorkoutsByDay] = useState({});
    const [muscleGroupsByDay, setMuscleGroupsByDay] = useState({});
    const [showCopyDialog, setShowCopyDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddWorkoutDialog, setShowAddWorkoutDialog] = useState(false);
    const [showEditWorkoutDialog, setShowEditWorkoutDialog] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    // AI Coach chat state (ported from AIFitnessPlan)
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            welcome: true,
            content: "Hi! I'm your AI fitness planner! If you're feeling lost about your training plan, let me help you out! You can share your needs with me, or click:",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    // UI state for interactive prompts
    const [intensityForm, setIntensityForm] = useState({
        background: '',
        lastStructured: '',
        bmiBand: '',
        flags: {
            lowSleep: false,
            sore: false,
            pain: false
        }
    });
    const [selectedObjectives, setSelectedObjectives] = useState([]);
    const MAX_OBJECTIVES = 2;

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const messageContent = inputMessage;
        setInputMessage('');
        setIsThinking(true);

        try {
            // 首先让 AI 解析用户意图
            const intentPrompt = `You are a fitness assistant. Analyze this user request and determine if it's an action command or just a question.

User request: "${messageContent}"

Current context:
- Current day: ${days[selectedDay]}
- Weekly plan exists: ${weeklyPlan ? 'Yes' : 'No'}

If it's an ACTION command (like add/remove/clear workouts), respond with JSON:
{
  "isAction": true,
  "action": "clear_day" | "add_workout" | "remove_workout" | "general_response",
  "parameters": {
    "muscleGroup": "chest/back/legs/etc",
    "count": number,
    "exerciseName": "string"
  },
  "response": "User-friendly confirmation message"
}

If it's just a QUESTION or CONVERSATION, respond with JSON:
{
  "isAction": false,
  "response": "Your natural conversational response"
}

Respond ONLY with valid JSON, no other text.`;

            const response = await axios.post('/api/chat/general', {
                message: intentPrompt,
                conversationId: null
            });

            let aiResponseText = response.data.response.trim();
            
            // 尝试从回复中提取 JSON
            let intent;
            try {
                // 移除可能的 markdown 代码块标记
                aiResponseText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                intent = JSON.parse(aiResponseText);
            } catch (parseError) {
                // 如果无法解析为 JSON，当作普通对话处理
                intent = {
                    isAction: false,
                    response: aiResponseText
                };
            }

            // 根据意图执行相应操作
            if (intent.isAction && weeklyPlan) {
                let actionResult = '';
                
                switch (intent.action) {
                    case 'clear_day':
                        try {
                            await axios.delete(`/api/weekly-plan/clear-day?planId=${weeklyPlan.id}&dayIndex=${selectedDay}`);
                            await loadAllPlans();
                            actionResult = intent.response || `✅ 已清除 ${days[selectedDay]} 的所有训练！`;
                        } catch (error) {
                            actionResult = `❌ 清除失败：${error.response?.data?.error || error.message}`;
                        }
                        break;

                    case 'add_workout':
                        if (intent.parameters) {
                            try {
                                const muscleGroup = intent.parameters.muscleGroup || 'General';
                                const count = intent.parameters.count || 1;
                                
                                // 根据肌群生成训练名称
                                const workoutNames = {
                                    'chest': ['Bench Press', 'Push-ups', 'Dumbbell Flyes', 'Cable Crossover', 'Incline Press'],
                                    'back': ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Deadlift', 'Cable Row'],
                                    'legs': ['Squats', 'Leg Press', 'Lunges', 'Leg Curl', 'Calf Raises'],
                                    'shoulders': ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Arnold Press'],
                                    'arms': ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Tricep Extensions', 'Preacher Curls'],
                                    'core': ['Planks', 'Crunches', 'Leg Raises', 'Russian Twists', 'Mountain Climbers']
                                };
                                
                                const exercises = workoutNames[muscleGroup.toLowerCase()] || workoutNames['chest'];
                                
                                // 添加指定数量的训练
                                for (let i = 0; i < Math.min(count, exercises.length); i++) {
                                    const workoutData = {
                                        planId: weeklyPlan.id,
                                        dayIndex: selectedDay,
                                        workoutName: exercises[i],
                                        sets: 3,
                                        reps: 12,
                                        weight: '',
                                        duration: '',
                                        notes: `AI generated ${muscleGroup} workout`,
                                        completed: false
                                    };
                                    
                                    await axios.post('/api/weekly-plan/add-workout', workoutData);
                                }
                                
                                await loadAllPlans();
                                actionResult = intent.response || `✅ 已为您添加 ${count} 个${muscleGroup}训练！`;
                            } catch (error) {
                                actionResult = `❌ 添加失败：${error.response?.data?.error || error.message}`;
                            }
                        }
                        break;

                    default:
                        actionResult = intent.response || '我理解了您的需求，但这个操作暂时还不支持。';
                }

                const aiResponse = {
                    id: messages.length + 2,
                    type: 'ai',
                    content: actionResult,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
            } else if (!intent.isAction) {
                // 普通对话
                const aiResponse = {
                    id: messages.length + 2,
                    type: 'ai',
                    content: intent.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                // 没有训练计划时的提示
                const aiResponse = {
                    id: messages.length + 2,
                    type: 'ai',
                    content: '您还没有创建本周的训练计划。请先生成一个训练计划，或者我可以帮您创建一个？',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
            }

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
    };

    const pushAIMessage = (content, extra = {}) => {
        const aiMsg = {
            id: messages.length + 1,
            type: 'ai',
            timestamp: new Date(),
            content,
            ...extra
        };
        setMessages(prev => [...prev, aiMsg]);
    };

    const showIntensityPrompt = () => {
        pushAIMessage(
            "Let's tune today's effort. Please select the options that best describe you today.",
            { kind: 'intensity_prompt' }
        );
    };

    const showObjectivesPrompt = () => {
        pushAIMessage(
            'Pick your primary training goal today:',
            { kind: 'objectives_prompt' }
        );
    };

    const computeRecommendedIntensity = (form) => {
        // Simple rules based on provided logic snapshot
        const { background, lastStructured, bmiBand, flags } = form;
        if (flags.pain) return 'Recovery (Very Easy)';
        if (flags.lowSleep || flags.sore) return 'Base (Easy–Moderate)';

        if (lastStructured === 'over3m') return (background === 'consistent' || background === 'experienced') ? 'Base (Easy–Moderate)' : 'Recovery (Very Easy)';
        if (lastStructured === '1to3m') return 'Base (Easy–Moderate)';
        if (lastStructured === '1to4w') {
            return (background === 'consistent' || background === 'experienced') ? 'Build (Moderate–Challenging)' : 'Base (Easy–Moderate)';
        }
        // within1w
        let level = 'Base (Easy–Moderate)';
        if (background === 'consistent') level = 'Build (Moderate–Challenging)';
        if (background === 'experienced') level = 'Peak (Challenging)';
        if (bmiBand === 'high' && (background !== 'consistent' && background !== 'experienced')) level = 'Recovery (Very Easy)';
        return level;
    };

    const handleSubmitIntensity = () => {
        const recommendation = computeRecommendedIntensity(intensityForm);
        const summary = `Background: ${intensityForm.background || '-'}, Last training: ${intensityForm.lastStructured || '-'}, BMI band: ${intensityForm.bmiBand || '-'}, Flags: ${Object.entries(intensityForm.flags).filter(([,v])=>v).map(([k])=>k).join(', ') || 'none'}`;

        // Echo user selection and AI acknowledgement
        setMessages(prev => [
            ...prev,
            { id: prev.length + 1, type: 'user', content: `Training Intensity selections → ${summary}`, timestamp: new Date() },
            { id: prev.length + 2, type: 'ai', content: `Got it. Your recommended intensity is: ${recommendation}. I'll generate your plan accordingly.`, timestamp: new Date() }
        ]);
    };

    const handleSubmitObjectives = () => {
        if (!selectedObjectives.length) return;
        const summary = selectedObjectives.join(', ');
        setMessages(prev => [
            ...prev,
            { id: prev.length + 1, type: 'user', content: `Selected goals: ${summary}`, timestamp: new Date() },
            { id: prev.length + 2, type: 'ai', content: 'Understood. I will craft your plan around these goals.', timestamp: new Date() }
        ]);
    };

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    // Day labels will be generated from current window (leftmost = today)

    // Week navigation state (UI only, decoupled from backend plan for now)
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d; // today is the first day in the window
    });
    const [todayString, setTodayString] = useState(() => new Date().toDateString());

    const addDays = (date, daysToAdd) => {
        const nd = new Date(date);
        nd.setDate(nd.getDate() + daysToAdd);
        return nd;
    };

    const formatDayShort = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatWeekRange = (start) => {
        const end = addDays(start, 6);
        const left = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const right = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${left} - ${right}`;
    };

    const goPrevWeek = () => setWeekStart(prev => addDays(prev, -7));
    const goNextWeek = () => setWeekStart(prev => addDays(prev, 7));

    // Dynamic day labels for the 7-day window starting from weekStart
    const dayLabels = Array.from({ length: 7 }, (_, i) =>
        addDays(weekStart, i).toLocaleDateString('en-US', { weekday: 'long' })
    );
    // Keep compatibility with legacy references
    const days = dayLabels;

    // On mount: select leftmost (today)
    useEffect(() => {
        setSelectedDay(0);
    }, []);

    // Tick every 1 minute to sync with real time (跨天自动切换周与选中日)
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const nowStr = now.toDateString();
            if (nowStr !== todayString) {
                setTodayString(nowStr);
                const start = new Date(now);
                start.setHours(0,0,0,0);
                setWeekStart(start);
                setSelectedDay(0);
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [todayString]);

    // Load all weekly plans
    useEffect(() => {
        if (user) {
            loadAllPlans();
        }
    }, [user]);

    // Load selected plan when index changes
    useEffect(() => {
        if (allPlans.length > 0 && selectedPlanIndex !== null && allPlans[selectedPlanIndex]) {
            const selectedPlan = allPlans[selectedPlanIndex];
            setWeeklyPlan(selectedPlan);
            setStartDate(selectedPlan.startDate);
            setEndDate(selectedPlan.endDate);
            setWorkoutsByDay(selectedPlan.workoutsByDay || {});
            setMuscleGroupsByDay(selectedPlan.muscleGroupsByDay || {});
        }
    }, [selectedPlanIndex, allPlans]);

    const loadAllPlans = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`/api/weekly-plan/all?userId=${user.id}`);
            console.log('All plans loaded:', response.data);
            setAllPlans(response.data);
            if (response.data.length > 0) {
                // Preserve current selectedPlanIndex if within bounds, otherwise select last (most recent)
                const currentIndex = selectedPlanIndex;
                const targetIndex = (currentIndex !== null && currentIndex >= 0 && currentIndex < response.data.length) 
                    ? currentIndex 
                    : response.data.length - 1;
                setSelectedPlanIndex(targetIndex);
                const targetPlan = response.data[targetIndex];
                setWeeklyPlan(targetPlan);
                setStartDate(targetPlan.startDate);
                setEndDate(targetPlan.endDate);
                setWorkoutsByDay(targetPlan.workoutsByDay || {});
                setMuscleGroupsByDay(targetPlan.muscleGroupsByDay || {});
            }
        } catch (error) {
            console.error('Error loading all plans:', error);
        }
    };

    const loadPlanDetails = async (planId) => {
        try {
            const response = await axios.get(`/api/weekly-plan/${planId}`);
            const plan = response.data;
            
            console.log('Plan details loaded:', plan);
            setWeeklyPlan(plan);
            setStartDate(plan.startDate);
            setEndDate(plan.endDate);
            setWorkoutsByDay(plan.workoutsByDay || {});
            setMuscleGroupsByDay(plan.muscleGroupsByDay || {});
        } catch (error) {
            console.error('Error loading plan details:', error);
        }
    };

    const handleGenerateClick = async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        // Check if current week already has a plan
        try {
            const checkResponse = await axios.get(`/api/weekly-plan/check-current-week?userId=${user.id}`);
            const hasPlan = checkResponse.data.hasPlan;
            
            if (hasPlan) {
                alert('Current week already has a plan. Please delete it before generating a new one.');
                return;
            }
            
            // No plan exists, generate directly
            await generateAIPlan();
        } catch (error) {
            console.error('Error checking current week plan:', error);
            alert('Failed to check current week plan');
        }
    };

    const generateAIPlan = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await axios.post(`/api/weekly-plan/generate?userId=${user.id}`);
            const plan = response.data;
            
            console.log('Generated plan:', plan);
            
            // Reload all plans
            await loadAllPlans();
            
            alert('Weekly plan generated successfully!');
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Failed to generate weekly plan: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToNextWeek = async () => {
        if (!weeklyPlan || !user) {
            alert('No weekly plan to copy');
            return;
        }

        // Check if there are incomplete workouts
        const incompleteCount = Object.values(workoutsByDay)
            .flat()
            .filter(w => !w.completed).length;

        if (incompleteCount === 0) {
            alert('No incomplete workouts to copy');
            return;
        }

        // Check if next week already has a plan
        try {
            const checkResponse = await axios.get(
                `/api/weekly-plan/next-week/check?userId=${user.id}&currentPlanId=${weeklyPlan.id}`
            );
            
            const hasNextWeekPlan = checkResponse.data.hasPlan;
            
            if (hasNextWeekPlan) {
                // Next week has a plan, show merge options
                setShowCopyDialog(true);
            } else {
                // Next week doesn't have a plan, just copy directly
                await executeCopyAction('overwrite');
            }
        } catch (error) {
            console.error('Error checking next week plan:', error);
            // If check fails, show the dialog anyway
            setShowCopyDialog(true);
        }
    };

    const executeCopyAction = async (action) => {
        if (!weeklyPlan || !user) return;

        setShowCopyDialog(false);
        setLoading(true);

        try {
            const response = await axios.post(
                `/api/weekly-plan/copy-to-next-week?userId=${user.id}&currentPlanId=${weeklyPlan.id}&action=${action}`
            );

            // Reload all plans to refresh the view
            await loadAllPlans();
            
            // The newly created plan will be at the last index (most recent)
            // loadAllPlans() already sets the correct selectedPlanIndex
            
            const message = action === 'merge' ? 'Workouts merged to next week' :
                          action === 'overwrite' ? 'Plan copied to next week' :
                          'Copy cancelled';
            alert(message);
        } catch (error) {
            console.error('Error copying to next week:', error);
            alert('Failed to copy plan: ' + (error.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkoutComplete = async (workoutId) => {
        try {
            await axios.put(`/api/weekly-plan/workout/${workoutId}/toggle`);
            // Reload all plans to get updated state
            await loadAllPlans();
            // Keep showing the same plan (loadAllPlans preserves selectedPlanIndex)
        } catch (error) {
            console.error('Error toggling workout:', error);
        }
    };

    const handleClearDayClick = async () => {
        if (!weeklyPlan || !user) {
            alert('No weekly plan selected');
            return;
        }

        const dayKey = String(selectedDay);
        if (!workoutsByDay[dayKey] || workoutsByDay[dayKey].length === 0) {
            alert('No workouts to clear for this day');
            return;
        }

        if (!confirm(`Are you sure you want to clear all workouts for ${days[selectedDay]}?`)) {
            return;
        }

        setLoading(true);

        try {
            await axios.delete(`/api/weekly-plan/clear-day?planId=${weeklyPlan.id}&dayIndex=${selectedDay}`);
            // Reload all plans to refresh the view
            await loadAllPlans();
            alert('Day workouts cleared successfully');
        } catch (error) {
            console.error('Error clearing day workouts:', error);
            alert('Failed to clear day workouts: ' + (error.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!weeklyPlan || !user) return;

        setShowDeleteDialog(false);
        setLoading(true);

        try {
            await axios.delete(`/api/weekly-plan/${weeklyPlan.id}`);
            // Reload all plans
            await loadAllPlans();
            alert('Weekly plan deleted successfully');
        } catch (error) {
            console.error('Error deleting plan:', error);
            alert('Failed to delete plan: ' + (error.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
    };

    const handleAddWorkout = () => {
        if (!weeklyPlan) {
            alert('Please generate a weekly plan first');
            return;
        }
        setShowAddWorkoutDialog(true);
    };

    const saveWorkout = async (workoutData) => {
        try {
            const response = await axios.post('/api/weekly-plan/add-workout', workoutData);
            console.log('Workout saved:', response.data);
            
            // Reload all plans to refresh the view
            await loadAllPlans();
            
            // Close dialog
            setShowAddWorkoutDialog(false);
            alert('Workout added successfully!');
        } catch (error) {
            console.error('Error saving workout:', error);
            throw error;
        }
    };

    const handleEditWorkout = (workout) => {
        setSelectedWorkout(workout);
        setShowEditWorkoutDialog(true);
    };

    const updateWorkout = async (workoutData) => {
        try {
            const response = await axios.put(`/api/weekly-plan/workout/${workoutData.id}`, workoutData);
            console.log('Workout updated:', response.data);
            
            // Reload all plans to refresh the view
            await loadAllPlans();
            
            // Close dialog
            setShowEditWorkoutDialog(false);
            setSelectedWorkout(null);
            alert('Workout updated successfully!');
        } catch (error) {
            console.error('Error updating workout:', error);
            throw error;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getWorkoutCount = (dayIndex) => {
        return workoutsByDay[String(dayIndex)]?.length || 0;
    };

    const getMuscleGroupsForDay = (dayIndex) => {
        // Try both string and number keys
        const muscleGroups = muscleGroupsByDay[dayIndex] || muscleGroupsByDay[String(dayIndex)];
        if (muscleGroups && muscleGroups.trim() !== '') {
            return muscleGroups;
        }
        // Fallback: if no muscle groups found, show "Rest Day" or empty
        const workoutCount = getWorkoutCount(dayIndex);
        return workoutCount === 0 ? 'Rest Day' : '';
    };

    const getWorkoutsForDay = (dayIndex) => {
        return workoutsByDay[String(dayIndex)] || [];
    };

    const hasCompletedWorkout = (dayIndex) => {
        const workouts = getWorkoutsForDay(dayIndex);
        // 只有当该天有训练且所有训练都完成时才返回 true
        if (workouts.length === 0) return false;
        return workouts.every(w => w.completed);
    };

    const navigatePlan = (direction) => {
        if (selectedPlanIndex === null) return;
        const newIndex = selectedPlanIndex + direction;
        if (newIndex >= 0 && newIndex < allPlans.length) {
            setSelectedPlanIndex(newIndex);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">FitAI</h1>
                            <p className="text-xs text-gray-500">AI-Powered Training</p>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => navigate('/home')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Star size={18} />
                            <span className="text-sm font-medium">Home</span>
                        </button>
                        <button
                            onClick={() => navigate('/ai-plan')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Star size={18} />
                            <span className="text-sm font-medium">AI Fitness Plan</span>
                        </button>
                        <button
                            onClick={() => navigate('/weekly-plan')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-purple-100 text-purple-700 border border-purple-200"
                        >
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Weekly Plan</span>
                        </button>
                        <button
                            onClick={() => navigate('/training-log')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Dumbbell size={18} />
                            <span className="text-sm font-medium">Training Log</span>
                        </button>
                        <button
                            onClick={() => navigate('/monthly-report')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <BarChart3 size={18} />
                            <span className="text-sm font-medium">Monthly Report</span>
                        </button>
                        <button
                            onClick={() => navigate('/substitute')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Settings size={18} />
                            <span className="text-sm font-medium">Substitute</span>
                        </button>
                    </div>

                    {/* AI Assistant */}
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                            <MessageCircle size={18} />
                            <span className="text-sm font-medium">AI Assistant</span>
                        </button>
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">1</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-4 min-h-[calc(100vh-120px)] flex flex-col">
                {/* Week Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-2xl font-bold text-gray-900">Current Schedule</h2>
                            
                            {/* Week Navigation */}
                            {allPlans.length > 1 && selectedPlanIndex !== null && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => navigatePlan(1)}
                                        disabled={selectedPlanIndex >= allPlans.length - 1}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Week {allPlans.length - selectedPlanIndex} of {allPlans.length}
                                    </span>
                                    <button
                                        onClick={() => navigatePlan(-1)}
                                        disabled={selectedPlanIndex === 0}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Removed top-right Week of range per request */}
                    </div>

                    {/* Week header with navigation */}
                    <div className="flex items-center justify-between mb-3">
                                <div className="text-sm text-gray-600">
                            <span className="font-semibold">Week:</span> {formatWeekRange(weekStart)}
                                </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={goPrevWeek} className="p-2 rounded-lg hover:bg-gray-100">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={goNextWeek} className="p-2 rounded-lg hover:bg-gray-100">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-3">
                        {dayLabels.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedDay(index)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    selectedDay === index
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-center">
                                    <div className={`text-sm font-medium ${
                                        selectedDay === index ? 'text-purple-700' : 'text-gray-700'
                                    }`}>
                                        {day}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDayShort(addDays(weekStart, index))}
                                    </div>
                                    {hasCompletedWorkout(index) && (
                                        <CheckCircle size={16} className="text-green-500 mx-auto mt-2" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Day Details + AI Coach */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Workouts Column */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col" style={{ height: '600px' }}>
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                                    {days[selectedDay]} Workouts
                                </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleClearDayClick}
                                    disabled={!weeklyPlan || getWorkoutsForDay(selectedDay).length === 0 || loading}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400 text-sm"
                                >
                                    <Edit3 size={14} />
                                    <span>Clear Day's Plan</span>
                                </button>
                                <button
                                    onClick={handleAddWorkout}
                                    disabled={!weeklyPlan}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 text-sm"
                                >
                                    <Plus size={14} />
                                    <span>Add Workout</span>
                                </button>
                            </div>
                            </div>

                        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                            {getWorkoutsForDay(selectedDay).length > 0 ? (
                            <div className="space-y-3">
                                    {getWorkoutsForDay(selectedDay).map((workout) => (
                                        <div
                                            key={workout.id}
                                        className={`p-4 rounded-lg border transition ${
                                                workout.completed
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Dumbbell size={20} className="text-gray-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{workout.workoutName}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                            {workout.sets && workout.reps && (
                                                                <span>{workout.sets} sets × {workout.reps} reps</span>
                                                            )}
                                                            {workout.weight && <span>{workout.weight}</span>}
                                                            {workout.duration && (
                                                                <span className="flex items-center space-x-1">
                                                                    <Clock size={14} />
                                                                    <span>{workout.duration}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        {workout.notes && (
                                                            <p className="text-xs text-gray-500 mt-1">{workout.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleWorkoutComplete(workout.id)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            workout.completed
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditWorkout(workout)}
                                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                            <div className="text-center py-6 text-gray-500">No workouts scheduled</div>
                            )}
                        </div>
                    </div>

                    {/* AI Coach Column (ported chat) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col" style={{ height: '600px' }}>
                        <div className="pb-3 border-b border-gray-200 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">AI Fitness Coach</h3>
                            <p className="text-sm text-gray-600">Describe your goals and I'll create a personalized plan</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0, maxHeight: '100%' }}>
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                        <p className="text-sm">{message.content}</p>
                                        {message.welcome && (
                                            <div className="mt-3 flex items-center gap-2">
                                        <button
                                                    onClick={showIntensityPrompt}
                                                    className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                                                >
                                                    Training Intensity
                                        </button>
                                                <button
                                                    onClick={showObjectivesPrompt}
                                                    className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                                                >
                                                    Training Objectives
                                                </button>
                                </div>
                            )}
                                        {message.kind === 'intensity_prompt' && (
                                            <div className="mt-3 space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium mb-2">1) Your training background</p>
                                                    <div className="space-y-1 text-sm">
                                                        <label className="flex items-center gap-2"><input type="radio" name="bg" checked={intensityForm.background==='new'} onChange={()=>setIntensityForm(v=>({...v, background:'new'}))}/> I'm new (≤ 1 month)</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="bg" checked={intensityForm.background==='onoff'} onChange={()=>setIntensityForm(v=>({...v, background:'onoff'}))}/> On and off (1–6 months total)</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="bg" checked={intensityForm.background==='consistent'} onChange={()=>setIntensityForm(v=>({...v, background:'consistent'}))}/> Consistent (6–24 months)</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="bg" checked={intensityForm.background==='experienced'} onChange={()=>setIntensityForm(v=>({...v, background:'experienced'}))}/> Experienced (2+ years)</label>
                        </div>
                    </div>
                                    <div>
                                                    <p className="text-sm font-medium mb-2">2) Time since last structured training</p>
                                                    <div className="space-y-1 text-sm">
                                                        <label className="flex items-center gap-2"><input type="radio" name="lt" checked={intensityForm.lastStructured==='within1w'} onChange={()=>setIntensityForm(v=>({...v, lastStructured:'within1w'}))}/> Within the last week</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="lt" checked={intensityForm.lastStructured==='1to4w'} onChange={()=>setIntensityForm(v=>({...v, lastStructured:'1to4w'}))}/> 1–4 weeks ago</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="lt" checked={intensityForm.lastStructured==='1to3m'} onChange={()=>setIntensityForm(v=>({...v, lastStructured:'1to3m'}))}/> 1–3 months ago</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="lt" checked={intensityForm.lastStructured==='over3m'} onChange={()=>setIntensityForm(v=>({...v, lastStructured:'over3m'}))}/> Over 3 months ago</label>
                                        </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium mb-2">3) Height–weight range (rough BMI band)</p>
                                                    <div className="space-y-1 text-sm">
                                                        <label className="flex items-center gap-2"><input type="radio" name="bmi" checked={intensityForm.bmiBand==='light'} onChange={()=>setIntensityForm(v=>({...v, bmiBand:'light'}))}/> Lighter for my height</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="bmi" checked={intensityForm.bmiBand==='typical'} onChange={()=>setIntensityForm(v=>({...v, bmiBand:'typical'}))}/> Typical range</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="bmi" checked={intensityForm.bmiBand==='abitHigh'} onChange={()=>setIntensityForm(v=>({...v, bmiBand:'abitHigh'}))}/> A bit higher</label>
                                                        <label className="flex items-center gap-2"><input type="radio" name="bmi" checked={intensityForm.bmiBand==='high'} onChange={()=>setIntensityForm(v=>({...v, bmiBand:'high'}))}/> Higher and building up</label>
                                        </div>
                                    </div>
                                    <div>
                                                    <p className="text-sm font-medium mb-2">Quick check (optional)</p>
                                                    <div className="space-y-1 text-sm">
                                                        <label className="flex items-center gap-2"><input type="checkbox" checked={intensityForm.flags.lowSleep} onChange={(e)=>setIntensityForm(v=>({...v, flags:{...v.flags, lowSleep:e.target.checked}}))}/> I slept &lt; 6 hours last night</label>
                                                        <label className="flex items-center gap-2"><input type="checkbox" checked={intensityForm.flags.sore} onChange={(e)=>setIntensityForm(v=>({...v, flags:{...v.flags, sore:e.target.checked}}))}/> I feel sore or unusually tired today</label>
                                                        <label className="flex items-center gap-2"><input type="checkbox" checked={intensityForm.flags.pain} onChange={(e)=>setIntensityForm(v=>({...v, flags:{...v.flags, pain:e.target.checked}}))}/> I have pain/discomfort beyond normal soreness</label>
                                        </div>
                                                </div>
                                                <div className="pt-1">
                                                    <button onClick={handleSubmitIntensity} className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700">Submit</button>
                                                </div>
                                            </div>
                                        )}
                                        {message.kind === 'objectives_prompt' && (
                                            <div className="mt-3 space-y-3 text-sm">
                                                <div className="space-y-1">
                                                    {[
                                                        'Fat Loss / Body Composition',
                                                        'Muscle Gain (Hypertrophy)',
                                                        'Strength',
                                                        'Endurance / Cardio Fitness',
                                                        'General Fitness / Health',
                                                        'Mobility & Flexibility',
                                                        'Posture & Core Stability',
                                                        'Performance for a Sport',
                                                        'Rehab / Return to Training',
                                                        'Maintenance',
                                                        'Stress Relief / Wellbeing'
                                                    ].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedObjectives.includes(opt)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setSelectedObjectives((prev) => {
                                                                        if (checked) {
                                                                            if (prev.includes(opt)) return prev;
                                                                            if (prev.length >= MAX_OBJECTIVES) return prev; // cap reached
                                                                            return [...prev, opt];
                                                                        }
                                                                        return prev.filter(o => o !== opt);
                                                                    });
                                                                }}
                                                                disabled={!selectedObjectives.includes(opt) && selectedObjectives.length >= MAX_OBJECTIVES}
                                                            />
                                                            {opt}
                                                        </label>
                                                    ))}
                                        </div>
                                                <div className="pt-1 flex items-center gap-3">
                                                    <button onClick={handleSubmitObjectives} className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50" disabled={!selectedObjectives.length}>Submit</button>
                                                    <span className="text-xs text-gray-600">Select up to {MAX_OBJECTIVES}</span>
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                            <span className="text-sm">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="pt-3 border-t border-gray-200 flex-shrink-0">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Describe your fitness goals..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isThinking}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <Send size={16} />
                                    <span>Send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copy to Next Week Dialog */}
            {showCopyDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Copy to Next Week</h3>
                        <p className="text-gray-600 mb-6">
                            You have incomplete workouts to copy. If next week already has a plan, choose an action:
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => executeCopyAction('merge')}
                                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Merge Plans
                            </button>
                            <button
                                onClick={() => executeCopyAction('overwrite')}
                                className="w-full p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                                Overwrite Next Week
                            </button>
                            <button
                                onClick={() => executeCopyAction('cancel')}
                                className="w-full p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Weekly Plan?</h3>
                        <p className="text-gray-600 mb-2">
                            Are you sure you want to delete this weekly plan?
                        </p>
                        <p className="text-gray-600 mb-6">
                            This action cannot be undone. Other weekly plans will not be affected.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="w-full p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Workout Dialog */}
            {showAddWorkoutDialog && (
                <AddWorkoutDialog
                    isOpen={showAddWorkoutDialog}
                    onClose={() => setShowAddWorkoutDialog(false)}
                    onSave={saveWorkout}
                    currentDay={selectedDay}
                    weeklyPlanId={weeklyPlan?.id}
                />
            )}

            {/* Edit Workout Dialog */}
            {showEditWorkoutDialog && selectedWorkout && (
                <EditWorkoutDialog
                    isOpen={showEditWorkoutDialog}
                    onClose={() => {
                        setShowEditWorkoutDialog(false);
                        setSelectedWorkout(null);
                    }}
                    onSave={updateWorkout}
                    workout={selectedWorkout}
                    currentDay={selectedDay}
                    weeklyPlanId={weeklyPlan?.id}
                />
            )}
        </div>
    );
};

export default WeeklyPlan;