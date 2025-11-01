import React, { useState, useEffect } from 'react';
import { Dumbbell, ArrowRight, CheckCircle, AlertCircle, Info, Loader, MessageCircle, X, Send, Search, Lightbulb, Star, Home, Calendar, BarChart3, Settings } from 'lucide-react';
import { useUser } from './UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Navigation Bar Component
const NavigationBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const navigationItems = [
        { path: '/home', icon: Home, label: 'Home', key: 'home' },
        { path: '/ai-plan', icon: Star, label: 'AI Fitness Plan', key: 'ai-plan' },
        { path: '/weekly-plan', icon: Calendar, label: 'Weekly Plan', key: 'weekly-plan' },
        { path: '/training-log', icon: Dumbbell, label: 'Training Log', key: 'training-log' },
        { path: '/monthly-report', icon: BarChart3, label: 'Monthly Report', key: 'monthly-report' },
        { path: '/substitute', icon: Settings, label: 'Substitute', key: 'substitute' }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
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
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.key}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                    isActive(item.path)
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        );
                    })}
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
    );
};

// Exercise Substitution Card Component
const ExerciseSubstitutionCard = ({ onSearch, onPopularClick, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const popularExercises = [
        'Barbell Bench Press', 'Barbell Squats', 'Barbell Rows', 'Pull-up Bar', 
        'Barbell Shoulder Press', 'Leg Press Machine', 'Barbell Curls', 'Dips'
    ];

    const handleSearch = () => {
        if (searchTerm.trim()) {
            onSearch(searchTerm.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
                <Settings className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Exercise Substitution Finder</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
                Find alternative exercises when equipment is occupied or unavailable
            </p>

            {/* Search Input */}
            <div className="flex space-x-3 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter exercise name (e.g., Bench Press)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading || !searchTerm.trim()}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    <Search size={18} />
                    <span>Find Alternatives</span>
                </button>
            </div>

            {/* Popular Exercises */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Exercises</h3>
                <div className="flex flex-wrap gap-2">
                    {popularExercises.map((exercise) => (
                        <button
                            key={exercise}
                            onClick={() => onPopularClick(exercise)}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {exercise}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Tips Card Component
const TipsCard = () => {
    const tips = [
        "Choose alternatives that target the same muscle groups",
        "Match the difficulty level to your experience",
        "Consider available equipment when selecting substitutes",
        "Maintain similar movement patterns when possible",
        "Don't be afraid to modify exercises to fit your needs"
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Tips for Exercise Substitution</h2>
            </div>
            
            <ul className="space-y-3">
                {tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Alternative Results Component
const AlternativeResults = ({ alternatives, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin text-purple-500" />
                    <span className="text-gray-600">Finding alternatives...</span>
                </div>
            </div>
        );
    }

    if (!alternatives || alternatives.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Search for an exercise to see alternatives</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 flex flex-col">
            <div className="flex items-center mb-4 flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Alternative Solutions</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {alternatives.map((alternative, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start mb-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-800 mb-2">{alternative.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">{alternative.description}</p>
                                
                                <div className="space-y-2">
                                    {/* Training Parameters */}
                                    {alternative.setsReps && (
                                        <div className="flex items-start">
                                            <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">Sets/Reps</p>
                                                <p className="text-xs text-gray-600">{alternative.setsReps}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {alternative.weight && (
                                        <div className="flex items-start">
                                            <Info size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">Weight</p>
                                                <p className="text-xs text-gray-600">{alternative.weight}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {alternative.technique && (
                                        <div className="flex items-start">
                                            <CheckCircle size={16} className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">Technique</p>
                                                <p className="text-xs text-gray-600">{alternative.technique}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {alternative.precautions && (
                                        <div className="flex items-start">
                                            <AlertCircle size={16} className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">Precautions</p>
                                                <p className="text-xs text-gray-600">{alternative.precautions}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {alternative.comparison && (
                                        <div className="flex items-start">
                                            <Info size={16} className="text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">Comparison</p>
                                                <p className="text-xs text-gray-600">{alternative.comparison}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Training Question Consultation Window Component
const TrainingQuestionWindow = ({ isOpen, onClose }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);

    const { user } = useUser();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/fitness/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Training Question Consultation: ${question}`,
                    conversationId: conversationId,
                    userId: user?.id || null
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAnswer(data.response);
                if (data.conversationId && !conversationId) {
                    setConversationId(data.conversationId);
                }
            } else {
                setAnswer('Sorry, there was an error processing your question. Please try again.');
            }
        } catch (error) {
            setAnswer('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setQuestion('');
        setAnswer('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center">
                        <MessageCircle size={24} className="text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Training Question Consultation</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Question Input */}
                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Enter your training question, e.g., How to do squats correctly?"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>

                    {/* Quick Question Buttons */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Quick Questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "How to do squats correctly?",
                                "What to do about muscle soreness after training?",
                                "How to avoid sports injuries?",
                                "How should training frequency be arranged?"
                            ].map((quickQ, index) => (
                                <button
                                    key={index}
                                    onClick={() => setQuestion(quickQ)}
                                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                                >
                                    {quickQ}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Answer Area */}
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2">
                                <Loader className="w-5 h-5 animate-spin text-purple-500" />
                                <span className="text-gray-600">AI is thinking...</span>
                            </div>
                        </div>
                    )}

                    {answer && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Dumbbell size={20} className="text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-purple-800 mb-2">AI Fitness Coach Answer:</h4>
                                    <div className="text-gray-700 whitespace-pre-wrap">{answer}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Tip */}
                <div className="p-4 border-t bg-gray-50">
                    <p className="text-xs text-gray-500">
                        💡 Tip: You can ask any questions about training techniques, safety precautions, training plans, etc.
                    </p>
                </div>
            </div>
        </div>
    );
};

const FitnessChatInterface = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [equipmentList, setEquipmentList] = useState([]);
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isQuestionWindowOpen, setIsQuestionWindowOpen] = useState(false);
    const [conversationId, setConversationId] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
        fetchEquipmentList();
    }, [user, navigate]);

    const fetchEquipmentList = async () => {
        try {
            const response = await fetch('/api/fitness/equipment');
            if (response.ok) {
                const data = await response.json();
                setEquipmentList(data);
            } else {
                console.error('Failed to fetch equipment list:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch equipment list:', error);
        }
    };

    const handleSearch = async (exerciseName) => {
        setLoading(true);
        
        try {
            // Find equipment by name
            const equipment = equipmentList.find(eq => 
                eq.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
                exerciseName.toLowerCase().includes(eq.name.toLowerCase())
            );

            if (!equipment) {
                // If no exact match, try to find similar equipment
                const similarEquipment = equipmentList.find(eq => 
                    eq.name.toLowerCase().includes(exerciseName.split(' ')[0].toLowerCase())
                );
                
                if (similarEquipment) {
                    await getAlternatives(similarEquipment);
                } else {
                    setAlternatives([]);
                }
            } else {
                await getAlternatives(equipment);
            }
        } catch (error) {
            console.error('Failed to search alternatives:', error);
            setAlternatives([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePopularClick = (exerciseName) => {
        handleSearch(exerciseName);
    };

    const getAlternatives = async (equipment) => {
        try {
            const response = await fetch('/api/fitness/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `${equipment.name} is occupied, please provide detailed recommendations for each alternative exercise separately, format as follows:\n\n1. [Alternative Exercise Name]\n   - Sets/Reps: [Specific recommendations]\n   - Weight Recommendation: [Specific recommendations]\n   - Technique: [Detailed instructions]\n   - Precautions: [Safety reminders]\n   - Training Effect Comparison: [Differences from original equipment]\n\n2. [Next Alternative Exercise Name]\n   - Sets/Reps: [Specific recommendations]\n   - Weight Recommendation: [Specific recommendations]\n   - Technique: [Detailed instructions]\n   - Precautions: [Safety reminders]\n   - Training Effect Comparison: [Differences from original equipment]\n\nPlease provide complete independent information for each alternative exercise.`,
                    conversationId: conversationId,
                    userId: user?.id || null
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const alternatives = parseDetailedAlternatives(data.response, equipment);
                setAlternatives(alternatives);
                if (data.conversationId && !conversationId) {
                    setConversationId(data.conversationId);
                }
            } else {
                setAlternatives([]);
            }
        } catch (error) {
            console.error('Failed to get alternatives:', error);
            setAlternatives([]);
        }
    };

    const parseDetailedAlternatives = (aiResponse, originalEquipment) => {
        const lines = aiResponse.split('\n').filter(line => line.trim());
        const alternatives = [];
        let currentAlternative = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (/^\d+\./.test(line)) {
                if (currentAlternative) {
                    alternatives.push(currentAlternative);
                }
                currentAlternative = {
                    name: line.replace(/^\d+\.\s*/, ''),
                    description: '',
                    setsReps: '',
                    weight: '',
                    technique: '',
                    precautions: '',
                    comparison: '',
                    primaryMuscles: originalEquipment.primaryMuscles,
                    workoutTypes: originalEquipment.workoutTypes
                };
            } else if (currentAlternative && line.startsWith('- ')) {
                const content = line.replace(/^-\s*/, '');
                if (content.includes('Sets/Reps')) {
                    currentAlternative.setsReps = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Weight Recommendation')) {
                    currentAlternative.weight = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Technique')) {
                    currentAlternative.technique = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Precautions')) {
                    currentAlternative.precautions = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Training Effect Comparison')) {
                    currentAlternative.comparison = content.split('：')[1] || content.split(':')[1] || '';
                }
            } else if (currentAlternative && line.length > 0 && !line.startsWith('-')) {
                if (!currentAlternative.description) {
                    currentAlternative.description = line;
                }
            }
        }
        
        if (currentAlternative) {
            alternatives.push(currentAlternative);
        }
        
        if (alternatives.length === 0) {
            const alternativeNames = originalEquipment.alternativeEquipments.split(',').map(name => name.trim());
            return alternativeNames.map((name, index) => ({
                name: name,
                description: `${name} is an excellent alternative to ${originalEquipment.name}, effectively targeting the same muscle groups`,
                setsReps: 'Recommended 3-4 sets, 8-12 reps each, 60-90 seconds rest between sets',
                weight: 'Beginners choose lighter weights, experienced users can increase weight appropriately',
                technique: 'Keep core stable, control movement slowly, pay attention to breathing rhythm',
                precautions: originalEquipment.tips || 'Pay attention to proper form, avoid cheating, stop immediately if discomfort occurs',
                comparison: `${name} compared to ${originalEquipment.name}, has greater range of motion and more comprehensive muscle stimulation`,
                primaryMuscles: originalEquipment.primaryMuscles,
                workoutTypes: originalEquipment.workoutTypes
            }));
        }
        
        return alternatives;
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <NavigationBar />
            
            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <ExerciseSubstitutionCard 
                            onSearch={handleSearch}
                            onPopularClick={handlePopularClick}
                            loading={loading}
                        />
                        <TipsCard />
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-8">
                        <AlternativeResults 
                            alternatives={alternatives}
                            loading={loading}
                        />
                        
                        {/* Training Question Consultation Button */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <button
                                onClick={() => setIsQuestionWindowOpen(true)}
                                className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                            >
                                <MessageCircle size={20} className="mr-2" />
                                Training Question Consultation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Training Question Consultation Window */}
            <TrainingQuestionWindow 
                isOpen={isQuestionWindowOpen} 
                onClose={() => setIsQuestionWindowOpen(false)} 
            />
        </div>
    );
};

export default FitnessChatInterface;