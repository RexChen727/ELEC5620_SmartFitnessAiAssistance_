import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Calendar, LogOut, User } from 'lucide-react';
import { useUser } from './UserContext';

const MainLayout = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigationItems = [
        { path: '/chat', icon: MessageSquare, label: 'AI 聊天', key: 'chat' },
        { path: '/calendar', icon: Calendar, label: '智能日历', key: 'calendar' }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航栏 */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo 和标题 */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-gray-900">AI Agent</h1>
                            </div>
                        </div>

                        {/* 导航菜单 */}
                        <nav className="hidden md:flex space-x-8">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => navigate(item.path)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* 用户信息和退出 */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                                <User size={16} />
                                <span>欢迎, {user.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <LogOut size={16} />
                                <span>退出</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 移动端导航菜单 */}
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
                                            ? 'bg-indigo-100 text-indigo-700'
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

            {/* 主要内容区域 */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
