import React, { useState, useEffect } from 'react';
import { Dumbbell, ArrowRight, CheckCircle, AlertCircle, Info, Loader, MessageCircle, X, Send } from 'lucide-react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

const EquipmentCard = ({ equipment, isSelected, onClick }) => {
    return (
        <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={onClick}
        >
            <div className="flex items-center mb-2">
                <Dumbbell size={20} className="mr-2 text-green-600" />
                <h3 className="font-semibold text-gray-800">{equipment.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{equipment.description}</p>
            <div className="flex flex-wrap gap-1">
                {equipment.primaryMuscles.split(',').map((muscle, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {muscle.trim()}
                    </span>
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
                    conversationId: conversationId
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
                    <MessageCircle size={24} className="text-green-600 mr-2" />
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
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
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
                            <Loader className="w-5 h-5 animate-spin text-green-500" />
                            <span className="text-gray-600">AI is thinking...</span>
                        </div>
                        </div>
                    )}

                    {answer && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Dumbbell size={20} className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-green-800 mb-2">AI Fitness Coach Answer:</h4>
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

const AlternativeCard = ({ alternative, index }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold text-lg">{index + 1}</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{alternative.name}</h4>
                    <p className="text-gray-600 mb-4">{alternative.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Training Parameters */}
                        <div className="space-y-3">
                            {alternative.setsReps && (
                                <div className="flex items-start">
                                    <CheckCircle size={18} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Sets/Reps</p>
                                        <p className="text-sm text-gray-600">{alternative.setsReps}</p>
                                    </div>
                                </div>
                            )}
                            
                            {alternative.weight && (
                                <div className="flex items-start">
                                    <Info size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Weight Recommendation</p>
                                        <p className="text-sm text-gray-600">{alternative.weight}</p>
                                    </div>
                                </div>
                            )}
                            
                            {alternative.technique && (
                                <div className="flex items-start">
                                    <CheckCircle size={18} className="text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Technique</p>
                                        <p className="text-sm text-gray-600">{alternative.technique}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Safety and Effects */}
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <CheckCircle size={18} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Target Muscles</p>
                                    <p className="text-sm text-gray-600">{alternative.primaryMuscles}</p>
                                </div>
                            </div>
                            
                            {alternative.precautions && (
                                <div className="flex items-start">
                                    <AlertCircle size={18} className="text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Precautions</p>
                                        <p className="text-sm text-gray-600">{alternative.precautions}</p>
                                    </div>
                                </div>
                            )}
                            
                            {alternative.comparison && (
                                <div className="flex items-start">
                                    <Info size={18} className="text-indigo-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Training Effect Comparison</p>
                                        <p className="text-sm text-gray-600">{alternative.comparison}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FitnessChatInterface = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [equipmentList, setEquipmentList] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isQuestionWindowOpen, setIsQuestionWindowOpen] = useState(false);

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
            }
        } catch (error) {
            console.error('Failed to fetch equipment list:', error);
        }
    };

    const handleEquipmentSelect = async (equipment) => {
        setSelectedEquipment(equipment);
        setLoading(true);
        
        try {
            const response = await fetch('/api/fitness/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `${equipment.name} is occupied, please provide detailed recommendations for each alternative exercise separately, format as follows:\n\n1. [Alternative Exercise Name]\n   - Sets/Reps: [Specific recommendations]\n   - Weight Recommendation: [Specific recommendations]\n   - Technique: [Detailed instructions]\n   - Precautions: [Safety reminders]\n   - Training Effect Comparison: [Differences from original equipment]\n\n2. [Next Alternative Exercise Name]\n   - Sets/Reps: [Specific recommendations]\n   - Weight Recommendation: [Specific recommendations]\n   - Technique: [Detailed instructions]\n   - Precautions: [Safety reminders]\n   - Training Effect Comparison: [Differences from original equipment]\n\nPlease provide complete independent information for each alternative exercise.`,
                    conversationId: null
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Parse AI response and extract alternative solutions
                const alternatives = parseDetailedAlternatives(data.response, equipment);
                setAlternatives(alternatives);
            } else {
                setAlternatives([]);
            }
        } catch (error) {
            console.error('Failed to get alternatives:', error);
            setAlternatives([]);
        } finally {
            setLoading(false);
        }
    };

    const parseDetailedAlternatives = (aiResponse, originalEquipment) => {
        // Parse AI's detailed response, handle each alternative exercise independently
        const lines = aiResponse.split('\n').filter(line => line.trim());
        const alternatives = [];
        let currentAlternative = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect start of new alternative solution (number prefix)
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
                // Handle sub-items
                const content = line.replace(/^-\s*/, '');
                if (content.includes('Sets/Reps') || content.includes('训练组数/次数')) {
                    currentAlternative.setsReps = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Weight Recommendation') || content.includes('重量建议')) {
                    currentAlternative.weight = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Technique') || content.includes('动作要领')) {
                    currentAlternative.technique = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Precautions') || content.includes('注意事项')) {
                    currentAlternative.precautions = content.split('：')[1] || content.split(':')[1] || '';
                } else if (content.includes('Training Effect Comparison') || content.includes('训练效果对比')) {
                    currentAlternative.comparison = content.split('：')[1] || content.split(':')[1] || '';
                }
            } else if (currentAlternative && line.length > 0 && !line.startsWith('-')) {
                // Handle exercise description
                if (!currentAlternative.description) {
                    currentAlternative.description = line;
                }
            }
        }
        
        if (currentAlternative) {
            alternatives.push(currentAlternative);
        }
        
        // If no detailed content parsed, create independent detailed information for each alternative equipment
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
        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Fitness Assistant</h1>
                <p className="text-gray-600">Select occupied equipment and get professional alternatives</p>
                
                {/* Training Question Consultation Button */}
                <div className="mt-4">
                    <button
                        onClick={() => setIsQuestionWindowOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <MessageCircle size={20} className="mr-2" />
                        Training Question Consultation
                    </button>
                </div>
            </div>

            {/* Equipment Selection Area */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Occupied Equipment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipmentList.map((equipment) => (
                        <EquipmentCard
                            key={equipment.id}
                            equipment={equipment}
                            isSelected={selectedEquipment?.id === equipment.id}
                            onClick={() => handleEquipmentSelect(equipment)}
                        />
                    ))}
                </div>
            </div>

            {/* Alternative Solutions Area */}
            {selectedEquipment && (
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <ArrowRight size={20} className="text-green-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Alternative Solutions for {selectedEquipment.name}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex items-center space-x-2">
                                <Loader className="w-5 h-5 animate-spin text-green-500" />
                                <span className="text-gray-600">Generating alternative solutions...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alternatives.map((alternative, index) => (
                                <AlternativeCard
                                    key={index}
                                    alternative={alternative}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Usage Instructions</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Click on equipment cards above to select occupied equipment</li>
                    <li>• AI will generate detailed alternative training plans</li>
                    <li>• Each plan includes: sets/reps, weight recommendations, techniques, precautions</li>
                    <li>• Training effect comparison helps you understand differences from original equipment</li>
                    <li>• Choose appropriate alternative equipment and training intensity based on your ability</li>
                    <li>• Click "Training Question Consultation" button to ask AI fitness coach anytime</li>
                </ul>
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