import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Clock, Edit3, Trash2, Plus, Calendar, Star, ArrowRight, BarChart3, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrainingLog = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Sample workout data
    const workoutData = {
        '2024-12-23': [
            { id: 1, name: 'Bench Press', sets: 3, reps: 8, weight: '135 lbs', restTime: '2 min', duration: '45 min', notes: 'Felt strong today' },
            { id: 2, name: 'Pull-ups', sets: 3, reps: 10, weight: 'Bodyweight', restTime: '1 min', duration: '30 min', notes: '' }
        ],
        '2024-12-21': [
            { id: 3, name: 'Squats', sets: 4, reps: 12, weight: '185 lbs', restTime: '2 min', duration: '50 min', notes: 'Good form' }
        ],
        '2024-12-19': [
            { id: 4, name: 'Deadlifts', sets: 3, reps: 5, weight: '225 lbs', restTime: '3 min', duration: '40 min', notes: 'PR!' }
        ]
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    };

    const formatDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        return date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const getWorkoutDots = (date) => {
        const dateKey = formatDateKey(date);
        const workouts = workoutData[dateKey];
        if (!workouts) return [];
        
        // Return up to 3 dots
        return workouts.slice(0, 3).map((_, index) => (
            <div key={index} className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
        ));
    };

    const getSelectedDateWorkouts = () => {
        const dateKey = formatDateKey(selectedDate);
        return workoutData[dateKey] || [];
    };

    const deleteWorkout = (workoutId) => {
        console.log('Delete workout:', workoutId);
    };

    const addWorkout = () => {
        console.log('Add workout for:', selectedDate);
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

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
                            onClick={() => navigate('/')}
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
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Weekly Plan</span>
                        </button>
                        <button
                            onClick={() => navigate('/training-log')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-purple-100 text-purple-700 border border-purple-200"
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
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Full-Width Calendar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Training Calendar</h2>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
                                {day}
                            </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {days.map((day, index) => {
                            if (!day) {
                                return <div key={index} className="p-3"></div>;
                            }
                            
                            const hasWorkouts = workoutData[formatDateKey(day)];
                            const workoutDots = getWorkoutDots(day);
                            
                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(day)}
                                    className={`p-3 text-center rounded-lg transition-all hover:bg-gray-50 ${
                                        isToday(day) 
                                            ? 'bg-blue-100 border-2 border-blue-500' 
                                            : isSelected(day)
                                                ? 'bg-purple-100 border-2 border-purple-500'
                                                : 'hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`text-sm font-medium ${
                                        isToday(day) ? 'text-blue-700' : 
                                        isSelected(day) ? 'text-purple-700' : 'text-gray-900'
                                    }`}>
                                        {day.getDate()}
                                    </div>
                                    {workoutDots.length > 0 && (
                                        <div className="flex justify-center space-x-1 mt-1">
                                            {workoutDots}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Workouts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Workouts List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Workouts - {selectedDate.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </h3>
                                <button
                                    onClick={addWorkout}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                                >
                                    <Plus size={16} />
                                    <span>Log Workout</span>
                                </button>
                            </div>

                            {getSelectedDateWorkouts().length > 0 ? (
                                <div className="space-y-4">
                                    {getSelectedDateWorkouts().map((workout) => (
                                        <div
                                            key={workout.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Dumbbell size={20} className="text-gray-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{workout.name}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                                                {workout.sets} sets × {workout.reps} reps
                                                            </span>
                                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                                                {workout.weight}
                                                            </span>
                                                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center space-x-1">
                                                                <Clock size={12} />
                                                                <span>{workout.duration}</span>
                                                            </span>
                                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                                                Rest: {workout.restTime}
                                                            </span>
                                                        </div>
                                                        {workout.notes && (
                                                            <p className="text-sm text-gray-500 mt-2 italic">"{workout.notes}"</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteWorkout(workout.id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Dumbbell size={48} className="text-gray-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No workouts logged</h4>
                                    <p className="text-gray-500 mb-4">Start tracking your training progress</p>
                                    <button
                                        onClick={addWorkout}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                                    >
                                        <Plus size={16} />
                                        <span>Log Workout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-6">
                        {/* Monthly Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Workouts</span>
                                    <span className="text-lg font-bold text-purple-600">12</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Minutes</span>
                                    <span className="text-lg font-bold text-blue-600">540</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Calories Burned</span>
                                    <span className="text-lg font-bold text-green-600">2,160</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Current Streak</span>
                                    <span className="text-lg font-bold text-orange-600">5 days</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3">
                                    <Calendar size={16} className="text-blue-600" />
                                    <span className="text-sm font-medium">View Weekly Plan</span>
                                </button>
                                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center space-x-3">
                                    <ArrowRight size={16} className="text-green-600" />
                                    <span className="text-sm font-medium">Export Data</span>
                                </button>
                                <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-3">
                                    <Edit3 size={16} className="text-purple-600" />
                                    <span className="text-sm font-medium">Bulk Edit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingLog;
