import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

/**
 * AI Coach Chat Component
 * AI 健身教练聊天界面
 */
const AICoachChat = ({ 
    messages, 
    isThinking, 
    onSendMessage, 
    onShowIntensityPrompt, 
    onShowObjectivesPrompt 
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    // 自动滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && !isThinking) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col" style={{ height: '600px' }}>
            {/* Header */}
            <div className="pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">AI Fitness Coach</h3>
                <p className="text-sm text-gray-600">Describe your goals and I'll create a personalized plan</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0, maxHeight: '100%' }}>
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.welcome && (
                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={onShowIntensityPrompt}
                                        className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                                    >
                                        Training Intensity
                                    </button>
                                    <button
                                        onClick={onShowObjectivesPrompt}
                                        className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                                    >
                                        Training Objectives
                                    </button>
                                </div>
                            )}
                            <div className="text-xs opacity-70 mt-1">
                                {message.timestamp?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </div>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
                            <div className="flex items-center space-x-2">
                                <div className="animate-bounce">●</div>
                                <div className="animate-bounce delay-100">●</div>
                                <div className="animate-bounce delay-200">●</div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Describe your fitness goals..."
                        disabled={isThinking}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={isThinking || !inputMessage.trim()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center space-x-2"
                    >
                        <Send size={18} />
                        <span>Send</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AICoachChat;

