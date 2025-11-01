import React, { useState } from 'react';
import { MessageCircle, Send, Calendar, Clock, MapPin, Dumbbell, Star, ArrowRight, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const AIFitnessPlan = () => {
    const navigate = useNavigate();
    const { user, logout } = useUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
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
    const [isLoading, setIsLoading] = useState(false);

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
        setInputMessage('');
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: messages.length + 2,
                type: 'ai',
                content: "Great! Based on your preferences, I'll create a personalized workout plan. Let me generate a schedule that fits your lifestyle and goals.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 2000);
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

    const quickPrompts = [
        "I finish work at 5-6 PM every day, please arrange my training plan",
        "I want to build muscle and have 3 days per week available",
        "I prefer home workouts with minimal equipment",
        "I'm a beginner and want to lose weight"
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
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-purple-100 text-purple-700 border border-purple-200"
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
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chat Interface */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Planning by AI!</h2>
                                <p className="text-sm text-gray-600">Describe your goals and I'll create a personalized plan</p>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg ${
                                                message.type === 'user'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}
                                        >
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
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                                <span className="text-sm">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Describe your fitness goals..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <Send size={16} />
                                        <span>Send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Prompts & Calendar Preview */}
                    <div className="space-y-6">
                        {/* Quick Prompts */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Prompts</h3>
                            <div className="space-y-3">
                                {quickPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInputMessage(prompt)}
                                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generated Plan Preview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Plan</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <Calendar size={16} className="text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Monday</p>
                                        <p className="text-xs text-gray-600">Upper Body Strength</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <Clock size={16} className="text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Duration</p>
                                        <p className="text-xs text-gray-600">45 minutes</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                    <MapPin size={16} className="text-purple-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Location</p>
                                        <p className="text-xs text-gray-600">Gym</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                                <ArrowRight size={16} />
                                <span>View Full Plan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIFitnessPlan;
