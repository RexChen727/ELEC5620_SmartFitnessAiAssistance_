
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Dumbbell, Clock, Edit3, Plus, CheckCircle, Star, ArrowRight, BarChart3, MessageCircle, Settings, ChevronLeft, ChevronRight, Send, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import AddWorkoutDialog from './AddWorkoutDialog';
import EditWorkoutDialog from './EditWorkoutDialog';
import AICoachChat from './AICoachChat';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useAIChatAgent } from '../hooks/useAIChatAgent';

const WeeklyPlan = () => {
    const navigate = useNavigate();
    const { user, logout } = useUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const [selectedDay, setSelectedDay] = useState(0);
    
    // 对话框状态
    const [showAddWorkoutDialog, setShowAddWorkoutDialog] = useState(false);
    const [showEditWorkoutDialog, setShowEditWorkoutDialog] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    
    // AI 训练强度表单状态
    const [intensityForm, setIntensityForm] = useState({
        background: '',
        lastStructured: '',
        bmiBand: '',
        flags: { lowSleep: false, sore: false, pain: false }
    });
    const [selectedObjectives, setSelectedObjectives] = useState([]);

    // 使用新的 hooks
    const {
        weeklyPlan,
        allPlans,
        selectedPlanIndex,
        loading,
        startDate,
        endDate,
        workoutsByDay,
        muscleGroupsByDay,
        setSelectedPlanIndex,
        loadAllPlans,
        addWorkout,
        updateWorkout,
        toggleWorkoutCompletion,
        clearDayWorkouts
    } = useWeeklyPlan(user);

    // 星期标签
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // 周导航状态 - 计算本周的周一
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        // 获取当前是星期几 (0=周日, 1=周一, ..., 6=周六)
        const dayOfWeek = d.getDay();
        // 计算到本周一的天数差
        // 如果今天是周日(0)，则往前推6天到周一
        // 如果今天是周一(1)，则往前推0天
        // 如果今天是周二(2)，则往前推1天
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        d.setDate(d.getDate() + daysToMonday);
        return d;
    });

    // 辅助函数
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
        return `${formatDayShort(start)} – ${formatDayShort(end)}`;
    };

    // 格式化显示日期范围（从今天开始的未来7天）
    const formatDisplayDateRange = () => {
        if (displayDates.length === 7) {
            const start = displayDates[0];
            const end = displayDates[6];
            return `${formatDayShort(start)} – ${formatDayShort(end)}`;
        }
        return '';
    };

    // 获取实际的今天日期
    const getActualToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    // 创建显示顺序：从今天开始，显示未来7天（今天 + 明天 + ... + 6天后）
    // displayIndex -> 实际日期 的映射
    const getDisplayDates = () => {
        const today = getActualToday();
        const dates = [];
        // 从今天开始，显示未来7天
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    // 获取日期对应的dayIndex（相对于该日期所在周的周一）
    // 对于任何日期，计算它在其所在周的周一后的第几天
    const getDayIndexForDate = (date) => {
        const dateCopy = new Date(date);
        dateCopy.setHours(0, 0, 0, 0);
        const dayOfWeek = dateCopy.getDay(); // 0=周日, 1=周一, ..., 6=周六
        // 转换为周一到周日的索引（0=周一, 6=周日）
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return dayIndex;
    };

    // 获取日期所在周的周一
    const getMondayForDate = (date) => {
        const dateCopy = new Date(date);
        dateCopy.setHours(0, 0, 0, 0);
        const dayOfWeek = dateCopy.getDay(); // 0=周日, 1=周一, ..., 6=周六
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(dateCopy);
        monday.setDate(monday.getDate() + daysToMonday);
        return monday;
    };

    // 获取显示日期数组
    const displayDates = getDisplayDates();
    
    // 获取显示索引对应的实际日期
    const getDisplayDate = (displayIndex) => {
        return displayDates[displayIndex];
    };

    // 获取显示索引对应的dayIndex（相对于当前周）
    const getActualDayIndex = (displayIndex) => {
        const date = displayDates[displayIndex];
        return getDayIndexForDate(date);
    };

    // 根据显示日期创建dayLabels（显示星期几）
    const dayLabels = displayDates.map(date => {
        const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ..., 6=周六
        return days[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
    });

    const goPrevWeek = () => setWeekStart(prev => addDays(prev, -7));
    const goNextWeek = () => setWeekStart(prev => addDays(prev, 7));

    // AI Chat Agent - 传入显示日期数组（从今天开始的未来7天）
    const {
        messages,
        isThinking,
        sendMessage,
        pushAIMessage,
        setMessages
    } = useAIChatAgent(user, weeklyPlan, getActualDayIndex(selectedDay), loadAllPlans, displayDates);

    const navigatePlan = (direction) => {
        const newIndex = selectedPlanIndex - direction;
        if (newIndex >= 0 && newIndex < allPlans.length) {
            setSelectedPlanIndex(newIndex);
        }
    };

    const getWorkoutsForDay = (dayIndex) => {
        const key = String(dayIndex);
        return workoutsByDay[key] || [];
    };

    const hasCompletedWorkout = (dayIndex) => {
        return getWorkoutsForDay(dayIndex).some(w => w.completed);
    };

    const getWorkoutCount = (dayIndex) => {
        return getWorkoutsForDay(dayIndex).length;
    };

    // 检查某个日期是否是今天
    const isToday = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return today.getTime() === checkDate.getTime();
    };

    // 获取日期对象的字符串格式用于比较
    const getDateString = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // 初始化时自动选中今天（今天在显示顺序中总是第一个，displayIndex=0）
    useEffect(() => {
        setSelectedDay(0); // 今天始终在位置0
    }, []); // 只在组件挂载时执行一次

    // 事件处理
    const handleAddWorkout = () => {
        setShowAddWorkoutDialog(true);
    };

    const handleEditWorkout = (workout) => {
        setSelectedWorkout(workout);
        setShowEditWorkoutDialog(true);
    };

    const saveWorkout = async (workoutData) => {
        const result = await addWorkout(workoutData);
        if (result.success) {
            setShowAddWorkoutDialog(false);
            alert('Workout added successfully!');
        } else {
            throw new Error(result.error);
        }
    };

    const saveEditedWorkout = async (workoutData) => {
        const result = await updateWorkout(workoutData);
        if (result.success) {
            setShowEditWorkoutDialog(false);
            alert('Workout updated successfully!');
        } else {
            throw new Error(result.error);
        }
    };

    const toggleWorkoutComplete = async (workoutId) => {
        await toggleWorkoutCompletion(workoutId);
    };

    const handleClearDayClick = async () => {
        if (!weeklyPlan || !user) {
            alert('No weekly plan selected');
            return;
        }

        const actualDayIndex = getActualDayIndex(selectedDay);
        const dayKey = String(actualDayIndex);
        if (!workoutsByDay[dayKey] || workoutsByDay[dayKey].length === 0) {
            alert('No workouts to clear for this day');
            return;
        }

        if (!confirm(`Are you sure you want to clear all workouts for ${days[actualDayIndex]}?`)) {
            return;
        }

        const result = await clearDayWorkouts(actualDayIndex);
        if (result.success) {
            alert('Day workouts cleared successfully');
        } else {
            alert('Failed to clear day workouts: ' + result.error);
        }
    };

    // AI 训练强度和目标处理
    const showIntensityPrompt = () => {
        pushAIMessage(
            "Let's tune today's effort. Please select the options that best describe you today."
        );
        setMessages(prev => [...prev, { 
            id: prev.length + 1, 
            type: 'ai', 
            kind: 'intensity_prompt',
            content: '',
            timestamp: new Date()
        }]);
    };

    const showObjectivesPrompt = () => {
        pushAIMessage('Pick your primary training goal today:');
        setMessages(prev => [...prev, { 
            id: prev.length + 1, 
            type: 'ai', 
            kind: 'objectives_prompt',
            content: '',
            timestamp: new Date()
        }]);
    };

    const computeRecommendedIntensity = (form) => {
        const { background, lastStructured, bmiBand, flags } = form;
        if (flags.pain) return 'Recovery (Very Easy)';
        if (flags.lowSleep || flags.sore) return 'Base (Easy–Moderate)';

        if (lastStructured === 'over3m') return (background === 'consistent' || background === 'experienced') ? 'Base (Easy–Moderate)' : 'Recovery (Very Easy)';
        if (lastStructured === '1to3m') return 'Base (Easy–Moderate)';
        if (lastStructured === '1to4w') {
            return (background === 'consistent' || background === 'experienced') ? 'Build (Moderate–Challenging)' : 'Base (Easy–Moderate)';
        }
        
        let level = 'Base (Easy–Moderate)';
        if (background === 'consistent') level = 'Build (Moderate–Challenging)';
        if (background === 'experienced') level = 'Peak (Challenging)';
        if (bmiBand === 'high' && (background !== 'consistent' && background !== 'experienced')) level = 'Recovery (Very Easy)';
        return level;
    };

    const handleSubmitIntensity = () => {
        const recommendation = computeRecommendedIntensity(intensityForm);
        const summary = `Background: ${intensityForm.background || '-'}, Last training: ${intensityForm.lastStructured || '-'}, BMI band: ${intensityForm.bmiBand || '-'}, Flags: ${Object.entries(intensityForm.flags).filter(([,v])=>v).map(([k])=>k).join(', ') || 'none'}`;

        setMessages(prev => [
            ...prev.filter(m => m.kind !== 'intensity_prompt'),
            { id: prev.length + 1, type: 'user', content: `Training Intensity selections → ${summary}`, timestamp: new Date() },
            { id: prev.length + 2, type: 'ai', content: `Got it. Your recommended intensity is: ${recommendation}. I'll generate your plan accordingly.`, timestamp: new Date() }
        ]);
    };

    const handleSubmitObjectives = () => {
        if (!selectedObjectives.length) return;
        const summary = selectedObjectives.join(', ');
        setMessages(prev => [
            ...prev.filter(m => m.kind !== 'objectives_prompt'),
            { id: prev.length + 1, type: 'user', content: `Selected goals: ${summary}`, timestamp: new Date() },
            { id: prev.length + 2, type: 'ai', content: 'Understood. I will craft your plan around these goals.', timestamp: new Date() }
        ]);
    };

    const toggleObjective = (obj) => {
        setSelectedObjectives(prev =>
            prev.includes(obj) ? prev.filter(x => x !== obj) : [...prev, obj]
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your weekly plan</h2>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <Dumbbell className="text-purple-600" size={28} />
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

                    {/* User Info and Actions */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <User size={16} />
                            <span>{user?.username || 'User'}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
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
                    </div>

                    {/* Week header with navigation */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold">Week:</span> {formatDisplayDateRange()}
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
                        {dayLabels.map((day, displayIndex) => {
                            // displayIndex 是显示顺序中的索引（0-6，0=今天）
                            // dayDate 是实际日期（从今天开始的未来7天）
                            const dayDate = displayDates[displayIndex];
                            const actualDayIndex = getActualDayIndex(displayIndex);
                            const isTodayDate = isToday(dayDate);
                            const isSelected = selectedDay === displayIndex;
                            
                            return (
                                <button
                                    key={displayIndex}
                                    onClick={() => setSelectedDay(displayIndex)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        isSelected
                                            ? 'border-purple-500 bg-purple-50'
                                            : isTodayDate
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className={`text-sm font-medium ${
                                            isSelected 
                                                ? 'text-purple-700' 
                                                : isTodayDate 
                                                ? 'text-blue-700' 
                                                : 'text-gray-700'
                                        }`}>
                                            {day}
                                        </div>
                                        <div className={`text-xs mt-1 ${
                                            isTodayDate ? 'text-blue-600 font-semibold' : 'text-gray-500'
                                        }`}>
                                            {formatDayShort(dayDate)}
                                            {isTodayDate && <span className="ml-1">(Today)</span>}
                                        </div>
                                        {hasCompletedWorkout(actualDayIndex) && (
                                            <CheckCircle size={16} className="text-green-500 mx-auto mt-2" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Details + AI Coach */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Workouts Column */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col" style={{ height: '600px' }}>
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {days[getActualDayIndex(selectedDay)]} Workouts
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleClearDayClick}
                                    disabled={!weeklyPlan || getWorkoutsForDay(getActualDayIndex(selectedDay)).length === 0 || loading}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400 text-sm"
                                >
                                    <Edit3 size={14} />
                                    <span>Clear Day's Plan</span>
                                </button>
                                <button
                                    onClick={handleAddWorkout}
                                    disabled={!user || loading}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 text-sm"
                                >
                                    <Plus size={14} />
                                    <span>Add Workout</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                            {getWorkoutsForDay(getActualDayIndex(selectedDay)).length > 0 ? (
                                <div className="space-y-3">
                                    {getWorkoutsForDay(getActualDayIndex(selectedDay)).map((workout) => (
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

                    {/* AI Coach Column */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col" style={{ height: '600px' }}>
                        <AICoachChat
                            messages={messages.map(msg => {
                                // 添加训练强度表单
                                if (msg.kind === 'intensity_prompt') {
                                    return {
                                        ...msg,
                                        content: (
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
                                                <button onClick={handleSubmitIntensity} className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Submit</button>
                                            </div>
                                        )
                                    };
                                }
                                // 添加训练目标表单
                                if (msg.kind === 'objectives_prompt') {
                                    const objectives = ['Strength', 'Hypertrophy (Muscle Growth)', 'Endurance', 'Weight Loss / Fat Loss', 'General Fitness', 'Athletic Performance'];
                                    return {
                                        ...msg,
                                        content: (
                                            <div className="mt-3 space-y-3">
                                                {objectives.map(obj => (
                                                    <label key={obj} className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedObjectives.includes(obj)}
                                                            onChange={() => toggleObjective(obj)}
                                                        />
                                                        {obj}
                                                    </label>
                                                ))}
                                                <button onClick={handleSubmitObjectives} className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Submit</button>
                                            </div>
                                        )
                                    };
                                }
                                return msg;
                            })}
                            isThinking={isThinking}
                            onSendMessage={sendMessage}
                            onShowIntensityPrompt={showIntensityPrompt}
                            onShowObjectivesPrompt={showObjectivesPrompt}
                        />
                    </div>
                </div>
            </div>

            {/* Add Workout Dialog */}
            {showAddWorkoutDialog && (
                <AddWorkoutDialog
                    isOpen={showAddWorkoutDialog}
                    onClose={() => setShowAddWorkoutDialog(false)}
                    onSave={saveWorkout}
                    currentDay={getActualDayIndex(selectedDay)}
                    weeklyPlanId={weeklyPlan?.id || null}
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
                    onSave={saveEditedWorkout}
                    workout={selectedWorkout}
                    currentDay={getActualDayIndex(selectedDay)}
                    weeklyPlanId={weeklyPlan?.id}
                />
            )}
        </div>
    );
};

export default WeeklyPlan;
