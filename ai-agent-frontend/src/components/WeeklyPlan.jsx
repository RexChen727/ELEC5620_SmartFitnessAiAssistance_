import React, { useState } from 'react';
import { Calendar, Dumbbell, Clock, Edit3, Plus, CheckCircle, Star, ArrowRight, BarChart3, MessageCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WeeklyPlan = () => {
    const navigate = useNavigate();
    const [selectedDay, setSelectedDay] = useState(0);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const weeklyPlan = {
        0: [ // Monday
            { id: 1, name: 'Bench Press', sets: 3, reps: 8, weight: '135 lbs', duration: '45 min', completed: false },
            { id: 2, name: 'Pull-ups', sets: 3, reps: 10, weight: 'Bodyweight', duration: '30 min', completed: true }
        ],
        1: [ // Tuesday
            { id: 3, name: 'Squats', sets: 4, reps: 12, weight: '185 lbs', duration: '50 min', completed: false }
        ],
        2: [ // Wednesday
            { id: 4, name: 'Deadlifts', sets: 3, reps: 5, weight: '225 lbs', duration: '40 min', completed: false }
        ],
        3: [ // Thursday
            { id: 5, name: 'Shoulder Press', sets: 3, reps: 10, weight: '95 lbs', duration: '35 min', completed: false }
        ],
        4: [ // Friday
            { id: 6, name: 'Rows', sets: 3, reps: 12, weight: '115 lbs', duration: '40 min', completed: false }
        ],
        5: [ // Saturday
            { id: 7, name: 'Cardio', sets: 1, reps: 1, weight: 'N/A', duration: '60 min', completed: false }
        ],
        6: [ // Sunday
            // Rest day
        ]
    };

    const toggleWorkoutComplete = (workoutId) => {
        // This would update the workout completion status
        console.log('Toggle workout:', workoutId);
    };

    const addWorkout = () => {
        // This would open a modal to add a new workout
        console.log('Add workout for:', days[selectedDay]);
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
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Week Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Weekly Plan</h2>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold">Week of:</span> Dec 23 - Dec 29, 2024
                            </div>
                            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                                <Edit3 size={16} />
                                <span>Edit Plan</span>
                            </button>
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-4">
                        {days.map((day, index) => (
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
                                        {weeklyPlan[index]?.length || 0} workouts
                                    </div>
                                    {weeklyPlan[index]?.some(workout => workout.completed) && (
                                        <CheckCircle size={16} className="text-green-500 mx-auto mt-2" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Day Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Workouts List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {days[selectedDay]} Workouts
                                </h3>
                                <button
                                    onClick={addWorkout}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                    <Plus size={16} />
                                    <span>Add Workout</span>
                                </button>
                            </div>

                            {weeklyPlan[selectedDay]?.length > 0 ? (
                                <div className="space-y-4">
                                    {weeklyPlan[selectedDay].map((workout) => (
                                        <div
                                            key={workout.id}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                workout.completed
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Dumbbell size={20} className="text-gray-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{workout.name}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                            <span>{workout.sets} sets × {workout.reps} reps</span>
                                                            <span>{workout.weight}</span>
                                                            <span className="flex items-center space-x-1">
                                                                <Clock size={14} />
                                                                <span>{workout.duration}</span>
                                                            </span>
                                                        </div>
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
                                                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Edit3 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Dumbbell size={48} className="text-gray-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No workouts scheduled</h4>
                                    <p className="text-gray-500 mb-4">Add workouts to plan your {days[selectedDay].toLowerCase()} training</p>
                                    <button
                                        onClick={addWorkout}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                                    >
                                        <Plus size={16} />
                                        <span>Add First Workout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weekly Stats */}
                    <div className="space-y-6">
                        {/* Progress */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Completed Workouts</span>
                                        <span className="font-semibold">1/7</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '14%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Training Days</span>
                                        <span className="font-semibold">6/7</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '86%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3">
                                    <Calendar size={16} className="text-blue-600" />
                                    <span className="text-sm font-medium">Generate AI Plan</span>
                                </button>
                                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center space-x-3">
                                    <ArrowRight size={16} className="text-green-600" />
                                    <span className="text-sm font-medium">Copy to Next Week</span>
                                </button>
                                <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-3">
                                    <Edit3 size={16} className="text-purple-600" />
                                    <span className="text-sm font-medium">Edit Schedule</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyPlan;
