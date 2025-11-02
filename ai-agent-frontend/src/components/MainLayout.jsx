import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Calendar, LogOut, User, Dumbbell, Star, BarChart3, Settings } from 'lucide-react';
import { useUser } from './UserContext';

const MainLayout = () => {
    const { user, loading, logout } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigationItems = [
        { path: '/home', icon: Star, label: 'Home', key: 'home' },
        // { path: '/ai-plan', icon: Star, label: 'AI Fitness Plan', key: 'ai-plan' }, // Hidden
        { path: '/weekly-plan', icon: Calendar, label: 'Weekly Plan', key: 'weekly-plan' },
        { path: '/training-log', icon: Dumbbell, label: 'Training Log', key: 'training-log' },
        { path: '/monthly-report', icon: BarChart3, label: 'Monthly Report', key: 'monthly-report' },
        { path: '/substitute', icon: Settings, label: 'Substitute', key: 'substitute' }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        if (loading) return; // 等待从本地恢复
        if (!user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return null; // 或者返回一个轻量的加载占位
    }

    if (!user) {
        return null;
    }

    // Hide navigation for pages that have their own navigation
    const hideNavigation = location.pathname === '/fitness' || 
                          location.pathname === '/substitute' ||
                          location.pathname === '/home' ||
                          location.pathname === '/ai-plan' ||
                          location.pathname === '/weekly-plan' ||
                          location.pathname === '/training-log' ||
                          location.pathname === '/monthly-report';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar - only show for pages without their own navigation */}
            {!hideNavigation && (
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo and Title */}
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <h1 className="text-xl font-bold text-gray-900">FitAI</h1>
                                </div>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="hidden md:flex space-x-8">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => navigate(item.path)}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                isActive(item.path)
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* User Info and Logout */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <User size={16} />
                                    <span>Welcome, {user.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => navigate(item.path)}
                                        className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
