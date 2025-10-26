import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Star, ArrowRight, MessageCircle, Target, Zap, Award, Settings, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MonthlyReport = () => {
    const navigate = useNavigate();
    const [aiInsights, setAiInsights] = useState('');
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

    const generateAIInsights = async () => {
        setIsGeneratingInsights(true);
        // Simulate AI processing
        setTimeout(() => {
            setAiInsights("Based on your training data, you've shown excellent consistency this month with a 85% adherence rate. Your strength gains are impressive, particularly in your deadlift progression. I recommend focusing on recovery between sessions and consider adding mobility work to prevent injury. Your cardio consistency could improve - try adding 2-3 sessions per week.");
            setIsGeneratingInsights(false);
        }, 3000);
    };

    const monthlyStats = [
        { label: 'Total Workouts', value: '24', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { label: 'Total Minutes', value: '1,080', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
        { label: 'Calories Burned', value: '4,320', icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-100' },
        { label: 'Current Streak', value: '7 days', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        { label: 'Adherence Rate', value: '85%', icon: Award, color: 'text-red-600', bgColor: 'bg-red-100' }
    ];

    const weeklyActivityData = [
        { week: 'Week 1', workouts: 6, minutes: 270 },
        { week: 'Week 2', workouts: 5, minutes: 225 },
        { week: 'Week 3', workouts: 7, minutes: 315 },
        { week: 'Week 4', workouts: 6, minutes: 270 }
    ];

    const topExercises = [
        { name: 'Squats', count: 12, percentage: 25 },
        { name: 'Bench Press', count: 10, percentage: 21 },
        { name: 'Deadlifts', count: 8, percentage: 17 },
        { name: 'Pull-ups', count: 6, percentage: 12 },
        { name: 'Rows', count: 5, percentage: 10 }
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
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Dumbbell size={18} />
                            <span className="text-sm font-medium">Training Log</span>
                        </button>
                        <button
                            onClick={() => navigate('/monthly-report')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-purple-100 text-purple-700 border border-purple-200"
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
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Monthly Report</h2>
                        <p className="text-gray-600 mt-1">December 2024 Performance Summary</p>
                    </div>
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                        <Download size={20} />
                        <span>Download PDF</span>
                    </button>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {monthlyStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                        <Icon size={24} className={stat.color} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Weekly Activity Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h3>
                        <div className="space-y-4">
                            {weeklyActivityData.map((week, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 w-16">{week.week}</span>
                                    <div className="flex-1 mx-4">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className="bg-blue-500 h-3 rounded-full" 
                                                style={{ width: `${(week.workouts / 7) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">{week.workouts} workouts</div>
                                        <div className="text-xs text-gray-500">{week.minutes} min</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Exercises */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Exercises</h3>
                        <div className="space-y-4">
                            {topExercises.map((exercise, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{exercise.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">{exercise.count} times</div>
                                        <div className="text-xs text-gray-500">{exercise.percentage}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Summary Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">AI Performance Insights</h3>
                        <button
                            onClick={generateAIInsights}
                            disabled={isGeneratingInsights}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <MessageCircle size={16} />
                            <span>{isGeneratingInsights ? 'Generating...' : 'Generate AI Insights'}</span>
                        </button>
                    </div>

                    {isGeneratingInsights ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <span className="text-gray-600">AI is analyzing your performance...</span>
                            </div>
                        </div>
                    ) : aiInsights ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-start space-x-3">
                                <MessageCircle size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-purple-800 mb-2">AI Coach Analysis</h4>
                                    <p className="text-gray-700 leading-relaxed">{aiInsights}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-600 mb-2">No AI insights yet</h4>
                            <p className="text-gray-500 mb-4">Generate personalized performance analysis</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3">
                                <Download size={16} className="text-blue-600" />
                                <span className="text-sm font-medium">Download PDF Report</span>
                            </button>
                            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center space-x-3">
                                <ArrowRight size={16} className="text-green-600" />
                                <span className="text-sm font-medium">Export to CSV</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compare Periods</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-3">
                                <TrendingUp size={16} className="text-purple-600" />
                                <span className="text-sm font-medium">vs Last Month</span>
                            </button>
                            <button className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center space-x-3">
                                <Calendar size={16} className="text-orange-600" />
                                <span className="text-sm font-medium">vs Last Year</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3">
                                <Target size={16} className="text-blue-600" />
                                <span className="text-sm font-medium">Set New Goals</span>
                            </button>
                            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center space-x-3">
                                <Star size={16} className="text-green-600" />
                                <span className="text-sm font-medium">Create New Plan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;
