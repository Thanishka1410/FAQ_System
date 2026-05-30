import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, MessageSquare, CornerDownLeft } from 'lucide-react';
import { yakshaService } from '../services/api.js';

const YakshaMiniChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', text: "Hello! I am Yaksha Mini, your AI coordinator assistant. Ask me anything about the Vicharanashala internship policies, NOC processes, offer letters, or Rosetta journals!" }
  ]);
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await yakshaService.query(userMsg);
      if (res.success) {
        setChat(prev => [...prev, {
          role: 'assistant',
          text: res.data.answer,
          category: res.data.category,
          confidence: res.data.confidence,
          matches: res.data.matches
        }]);
      } else {
        setChat(prev => [...prev, { role: 'assistant', text: "I'm having trouble matching that with the FAQ right now. Please try again later or escalate to a coordinator using #escalate." }]);
      }
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', text: "I ran into a connection error. Please make sure the backend is active." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Overlay */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-wide">Yaksha Mini</h4>
                <p className="text-[9px] text-slate-400 font-semibold uppercase leading-none mt-0.5">AI Internship Policy RAG</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-xs leading-normal ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-2 font-medium'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  
                  {msg.role === 'assistant' && msg.confidence !== undefined && (
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 mt-1.5 text-[9px] font-bold text-slate-400">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{msg.category}</span>
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded">Match: {msg.confidence}%</span>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.matches && msg.matches.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-slate-100 mt-1.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Suggested Queries:</p>
                      <div className="flex flex-col gap-1">
                        {msg.matches.map((m, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setQuery(m.question)}
                            className="text-left text-[10px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50/30 border border-brand-100/30 px-2 py-1 rounded transition-colors"
                          >
                            "{m.question}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-500"></span>
                  </span>
                  <span>Yaksha Mini is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me a question about VINS..."
              disabled={loading}
              className="flex-grow px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:bg-white transition-all disabled:opacity-55"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow active:scale-95 transition-transform disabled:opacity-55"
            >
              <CornerDownLeft className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Glow Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-brand-900/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group relative border border-white/10"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
        {isOpen ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <MessageSquare className="h-6 w-6 relative z-10 animate-pulse-subtle" />
        )}
      </button>
    </div>
  );
};

export default YakshaMiniChat;
