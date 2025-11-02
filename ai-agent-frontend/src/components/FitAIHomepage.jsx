import React from 'react';
import { MessageCircle, Calendar, Dumbbell, BarChart3, Settings, Star, ArrowRight, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import { useUser } from './UserContext';

const FitAIHomepage = () => {
    const navigate = useNavigate();
    const { user, logout } = useUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const moduleCards = [
        {
            title: 'Weekly Plan',
            description: 'View and edit your 7-day workout schedule',
            icon: Calendar,
            path: '/weekly-plan',
            color: 'bg-green-500',
            hoverColor: 'hover:bg-green-600'
        },
        {
            title: 'Training Log',
            description: 'Track your workouts and progress',
            icon: Dumbbell,
            path: '/training-log',
            color: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600'
        },
        {
            title: 'Monthly Report',
            description: 'AI insights and performance analytics',
            icon: BarChart3,
            path: '/monthly-report',
            color: 'bg-orange-500',
            hoverColor: 'hover:bg-orange-600'
        }
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
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-purple-100 text-purple-700 border border-purple-200"
                        >
                            <Star size={18} />
                            <span className="text-sm font-medium">Home</span>
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
            </nav>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* AI Assistant Hero Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">AI Assistant</h2>
                            <p className="text-lg text-purple-100 mb-6">Your personalized AI fitness coach</p>
                            {/* AI Fitness Plan buttons hidden */}
                        </div>
                        <div className="hidden md:block">
                            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <MessageCircle size={64} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {moduleCards.map((module, index) => {
                        const Icon = module.icon;
                        return (
                            <div
                                key={index}
                                onClick={() => navigate(module.path)}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                                <p className="text-sm text-gray-600">{module.description}</p>
                            </div>
                        );
                    })}
                </div>

                {/* User Profile */}
                <div className="mt-12">
                    <UserProfile />
                </div>

                {/* Quick Stats Section */}
                <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
                            <div className="text-sm text-gray-600">Workouts This Week</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                            <div className="text-sm text-gray-600">Minutes Trained</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                            <div className="text-sm text-gray-600">Calories Burned</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
                            <div className="text-sm text-gray-600">Current Streak</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FitAIHomepage;
