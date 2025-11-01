import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Star, MessageCircle, Target, Zap, Award, Settings, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const MonthlyReport = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [reportId, setReportId] = useState(null);
    const [aiInsights, setAiInsights] = useState('');
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

    const [stats, setStats] = useState({
        totalWorkouts: 0,
        totalMinutes: 0,
        caloriesBurned: 0,
        currentStreak: 0,
        adherenceRate: 0
    });

    const [weeklyActivityData, setWeeklyActivityData] = useState([]);
    const [topExercises, setTopExercises] = useState([]);

    // Year/Month selection
    const now = useMemo(() => new Date(), []);
    const defaultYear = now.getFullYear();
    const defaultMonth = now.getMonth() + 1; // 1-12
    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

    const monthLabel = useMemo(() =>
        new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        [selectedYear, selectedMonth]
    );

    const parseMaybeJson = (value) => {
        if (!value) return null;
        if (Array.isArray(value) || typeof value === 'object') return value;
        try {
            return JSON.parse(value);
        } catch (_) {
            return null;
        }
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    // Last 5 years
    const yearOptions = useMemo(() => {
        const cur = now.getFullYear();
        return Array.from({ length: 5 }, (_, i) => cur - i);
    }, [now]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Current-month summary (fallback when no monthly report exists for selected period)
                const statsRes = await fetch(`/api/monthly-reports/statistics/user/${user.id}`);
                if (statsRes.ok) {
                    const s = await statsRes.json();
                    setStats({
                        totalWorkouts: s.totalWorkouts ?? 0,
                        totalMinutes: s.totalMinutes ?? 0,
                        caloriesBurned: s.caloriesBurned ?? 0,
                        currentStreak: s.currentStreak ?? 0,
                        adherenceRate: s.adherenceRate ?? 0
                    });
                }

                // Selected year/month report
                const reportRes = await fetch(`/api/monthly-reports/user/${user.id}/month/${selectedYear}/${selectedMonth}`);
                if (reportRes.ok) {
                    const report = await reportRes.json();
                    const rid = report.id ?? null;
                    setReportId(rid);
                    setAiInsights(report.aiInsights || '');

                    const weekly = parseMaybeJson(report.weeklyActivityData) || [];
                    const exercises = parseMaybeJson(report.topExercises) || [];
                    setWeeklyActivityData(weekly);
                    setTopExercises(exercises);

                    // Use selected month aggregated stats for top cards
                    const statsFromReport = {
                        totalWorkouts: report.totalSessions ?? 0,
                        totalMinutes: report.totalDurationMinutes ?? 0,
                        caloriesBurned: report.totalCaloriesBurned ?? 0,
                        currentStreak: report.currentStreakDays ?? 0,
                        adherenceRate: Number(report.goalAchievementPercentage ?? 0)
                    };
                    setStats(statsFromReport);

                    if (!weekly || weekly.length === 0) {
                        setWeeklyActivityData([
                            { week: 'Week 1', workouts: 0, minutes: 0 },
                            { week: 'Week 2', workouts: 0, minutes: 0 },
                            { week: 'Week 3', workouts: 0, minutes: 0 },
                            { week: 'Week 4', workouts: 0, minutes: 0 }
                        ]);
                    }
                    if (!exercises || exercises.length === 0) {
                        setTopExercises([]);
                    }
                } else {
                    setReportId(null);
                    setAiInsights('');
                    // Placeholder when no report exists for selected month
                    setWeeklyActivityData([
                        { week: 'Week 1', workouts: 0, minutes: 0 },
                        { week: 'Week 2', workouts: 0, minutes: 0 },
                        { week: 'Week 3', workouts: 0, minutes: 0 },
                        { week: 'Week 4', workouts: 0, minutes: 0 }
                    ]);
                    setTopExercises([]);
                }
            } catch (e) {
                console.error('Failed to load monthly report:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedYear, selectedMonth]);

    const generateAIInsights = async () => {
        if (!user) return;
        setIsGeneratingInsights(true);
        try {
            const prompt = `You are a fitness analyst. Based on this monthly data, provide concise, actionable insights. Use encouraging tone and at most 120 words. Data: totalWorkouts=${stats.totalWorkouts}, totalMinutes=${stats.totalMinutes}, caloriesBurned=${stats.caloriesBurned}, currentStreak=${stats.currentStreak}, adherenceRate=${stats.adherenceRate}. TopExercises=${JSON.stringify(topExercises)}. WeeklyActivity=${JSON.stringify(weeklyActivityData)}`;

            const chatRes = await fetch('/api/chat/analytical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt })
            });
            if (chatRes.ok) {
                const chat = await chatRes.json();
                const text = (chat?.response || chat?.message || '').toString().trim();
                const finalText = text.length > 0 ? text : 'Great consistency this month. Consider adding 2–3 cardio sessions and regular mobility work.';
                setAiInsights(finalText);
                if (reportId) {
                    await fetch(`/api/monthly-reports/${reportId}/ai-insights`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ aiInsights: finalText })
                    });
                }
            } else {
                setAiInsights('AI is temporarily unavailable. Please try again later.');
            }
        } catch (e) {
            console.error(e);
            setAiInsights('Failed to generate insights. Please check network or backend service.');
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    const monthlyStats = [
        { label: 'Total Workouts', value: String(stats.totalWorkouts ?? 0), icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { label: 'Total Minutes', value: (stats.totalMinutes ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
        { label: 'Calories Burned', value: (stats.caloriesBurned ?? 0).toLocaleString(), icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-100' },
        { label: 'Current Streak', value: `${stats.currentStreak ?? 0} days`, icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        { label: 'Adherence Rate', value: `${Number(stats.adherenceRate ?? 0).toFixed(0)}%`, icon: Award, color: 'text-red-600', bgColor: 'bg-red-100' }
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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Monthly Report</h2>
                        <p className="text-gray-600 mt-1">{monthLabel} Performance Summary</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                            >
                                {monthOptions.map((m) => (
                                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleDownloadPDF} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                            <Download size={18} />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-600">Loading...</div>
                ) : (
                    <>
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
                            {/* Weekly Activity */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h3>
                                <div className="space-y-4">
                                    {weeklyActivityData.map((week, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 w-16">{week.week || `Week ${index + 1}`}</span>
                                            <div className="flex-1 mx-4">
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div 
                                                        className="bg-blue-500 h-3 rounded-full" 
                                                        style={{ width: `${Math.min(100, ((week.workouts || 0) / 7) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-gray-900">{week.workouts || 0} workouts</div>
                                                <div className="text-xs text-gray-500">{week.minutes || 0} min</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Exercises */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Exercises</h3>
                                <div className="space-y-4">
                                    {(topExercises || []).map((exercise, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{exercise.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-gray-900">{exercise.count ?? 0} times</div>
                                                <div className="text-xs text-gray-500">{exercise.percentage ?? 0}%</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!topExercises || topExercises.length === 0) && (
                                        <div className="text-sm text-gray-500">No exercises found this month.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AI Summary */}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default MonthlyReport;
