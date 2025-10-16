import React, { useState, useEffect } from 'react';
import { Send, Bot, User, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

const ChatMessage = ({ message, isUser }) => {
    const bubbleStyle = isUser 
        ? `bg-blue-100 text-black justify-end`
        : `bg-gray-100 text-black justify-start`;

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
            <div className={`max-w-xs mx-2 p-3 rounded-lg ${bubbleStyle}`}>
                <div className="flex items-center mb-1">
                    {isUser ? <User size={16} className="mr-1" /> : <Bot size={16} className="mr-1" />}
                    <span className="text-xs font-semibold">
                        {isUser ? 'You' : 'AI Agent'}
                    </span>
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message}
                </ReactMarkdown>
            </div>
        </div>
    );
};

const ChatInterface = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState("general");
    const [conversationId, setConversationId] = useState(null);

    const agentTypes = [
        { value: "general", label: "General Assistant" },
        { value: "coding", label: "Coding Assistant" },
        { value: "creative", label: "Creative Writer" },
        { value: "analytical", label: "Analytical Assistant" }
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            const userMessage = { text: input, isUser: true };
            setMessages(prev => [...prev, userMessage]);
            setInput("");
            setLoading(true);

            try {
                const response = await fetch(`/api/chat/${selectedAgent}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        message: input,
                        conversationId: conversationId,
                        agentType: selectedAgent
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(prev => [...prev, { text: data.response, isUser: false }]);
                    if (data.conversationId && !conversationId) {
                        setConversationId(data.conversationId);
                    }
                } else {
                    setMessages(prev => [...prev, { 
                        text: "Sorry, I encountered an error. Please try again.", 
                        isUser: false 
                    }]);
                }
            } catch (error) {
                setMessages(prev => [...prev, { 
                    text: "Network error. Please check your connection.", 
                    isUser: false 
                }]);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-900">AI Agent Chat</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Welcome, {user.username}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Agent Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select AI Agent Type:
                    </label>
                    <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {agentTypes.map(agent => (
                            <option key={agent.value} value={agent.value}>
                                {agent.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chat Messages */}
                <div className="bg-white rounded-lg shadow-sm border h-96 overflow-y-auto p-4 mb-4">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message.text}
                            isUser={message.isUser}
                        />
                    ))}
                    {loading && (
                        <div className="flex justify-start my-2">
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <div className="flex items-center">
                                    <Bot size={16} className="mr-1" />
                                    <span className="text-xs font-semibold mr-2">AI Agent</span>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
