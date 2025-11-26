import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const Chatbot = () => {
    // Simple markdown renderer for chatbot messages
    const renderMarkdown = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\* /g, '• ') // Bullet points
            .replace(/\n/g, '<br/>'); // Line breaks
    };
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your medication assistant powered by Gemini AI. How can I help you today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: messages.length + 1,
            text: inputText,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await API.post('/api/chat/medical', {
                prompt: inputText
            });

            const botResponse = {
                id: messages.length + 2,
                text: response.data.response,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error getting chatbot response:', error);
            toast.error('Failed to get response from chatbot. Please try again.');
            const errorMessage = {
                id: messages.length + 2,
                text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50 flex items-center gap-2"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium hidden md:inline">Chat Assistant</span>
            </button>
        );
    }

    return (
        <div
            className={`fixed right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 flex flex-col
        ${isMinimized
                    ? 'bottom-4 w-72 h-14'
                    : 'bottom-4 w-[90vw] md:w-96 h-[80vh] md:h-[600px]'
                }`}
        >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Medication Assistant</h3>
                        {!isMinimized && <p className="text-xs text-blue-100">Powered by Gemini AI</p>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
                            </div >
                        )}
<div ref={messagesEndRef} />
                    </div >

    {/* Input Area */ }
    < div className = "p-4 bg-white border-t border-gray-100 shrink-0" >
        <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
                    </div >
                </>
            )}
        </div >
    );
};

export default Chatbot;
