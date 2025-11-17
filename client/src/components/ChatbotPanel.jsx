import React, { useState } from 'react';
import API from '../services/api';

const ChatbotPanel = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newUserMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await API.post('/api/chat/medical', { prompt: input });
      const newBotMessage = { sender: 'bot', text: res.data.response };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (err) {
      console.error('Error sending message to chatbot:', err);
      setError(err.response?.data?.message || 'Failed to get response from chatbot.');
      const errorMessage = { sender: 'bot', text: 'Sorry, I could not process your request at this moment.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold">Medical Chatbot (Gemini)</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-300 text-gray-800">
              <div className="dot-flashing"></div>
            </div>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <div className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything about your medication..."
          className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="px-6 py-2 text-white bg-blue-600 rounded-r-lg hover:bg-blue-900 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotPanel;
