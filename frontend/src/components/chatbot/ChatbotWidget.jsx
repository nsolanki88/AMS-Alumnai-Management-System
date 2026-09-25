import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Building, Briefcase, GraduationCap } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.fullName ? user.fullName.split(' ')[0] : 'there'}! I am the AMS+ AI Assistant. How can I help you navigate alumni, mentorship, workshops, or departments today?`,
      data: null
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const samplePrompts = user?.role === 'COUNCIL' || user?.role === 'ADMIN'
    ? [
        "Find alumni working in Google",
        "Which alumni can conduct a workshop?",
        "Show CSE alumni from batch 2022",
        "Find potential profiles for unregistered alumni"
      ]
    : [
        "Find alumni working in Google",
        "Find mentors for machine learning",
        "Which alumni can conduct a workshop?",
        "Show CSE alumni from batch 2022"
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/query', { query: textToSend });
      if (res.data?.success) {
        const { reply, data } = res.data.data;
        setMessages(prev => [...prev, { sender: 'bot', text: reply, data }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: res.data?.message || 'Sorry, I could not process that query.' }]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: err.response?.data?.message || 'An error occurred while communicating with the AI service.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3.5 rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all transform hover:scale-105"
        title="AMS+ AI Assistant"
      >
        <Bot className="w-6 h-6" />
        <span className="hidden sm:inline text-sm font-semibold pr-1">AMS+ AI</span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[92vw] sm:w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">AMS+ AI Assistant</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  NLP & RBAC-Aware Engine
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] font-medium bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Structured data cards if returned by AI */}
                  {m.data && Array.isArray(m.data) && m.data.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-100">
                      {m.data.map((item, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] flex flex-col gap-0.5">
                          <span className="font-semibold text-blue-700">{item.name || item.fullName}</span>
                          {item.role && (
                            <span className="text-slate-600 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              {item.role} {item.company ? `at ${item.company}` : ''}
                            </span>
                          )}
                          {item.batch && (
                            <span className="text-slate-500 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-slate-400" />
                              Batch of {item.batch} ({item.branch || 'Engineering'})
                            </span>
                          )}
                          {item.topics && (
                            <span className="text-slate-500">
                              Workshop Topics: {item.topics.join(', ')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></span>
                  <span className="ml-1 text-[11px]">Analyzing institutional data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about alumni, workshops, mentors..."
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
