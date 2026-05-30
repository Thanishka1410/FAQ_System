import React, { useState } from 'react';
import { faqService } from '../services/api.js';
import { ChevronDown, ChevronUp, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

const CATEGORY_COLORS = {
  'Offer Letter': 'bg-blue-50 text-blue-700 border-blue-100',
  'Selection Confirmation': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Login Issues': 'bg-amber-50 text-amber-700 border-amber-100',
  'Certificate': 'bg-purple-50 text-purple-700 border-purple-100',
  'Internship Process': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Technical Issues': 'bg-rose-50 text-rose-700 border-rose-100',
  'General Queries': 'bg-slate-50 text-slate-700 border-slate-100',
};

const FAQCard = ({ faq, onVoteUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(null); // 'helpful' or 'not-helpful'
  const [viewRecorded, setViewRecorded] = useState(false);
  
  const [views, setViews] = useState(faq.views);
  const [helpfulCount, setHelpfulCount] = useState(faq.helpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(faq.notHelpfulCount);

  const toggleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    // Automatically record a view when the user expands the card for the first time in this session
    if (nextState && !viewRecorded) {
      try {
        setViewRecorded(true);
        const res = await faqService.recordView(faq._id);
        if (res.success) {
          setViews(res.data.views);
        }
      } catch (err) {
        console.error('Failed to increment FAQ views:', err.message);
      }
    }
  };

  const handleVote = async (type) => {
    if (hasVoted) return; // Prevent double voting
    
    try {
      setHasVoted(type);
      if (type === 'helpful') {
        setHelpfulCount(prev => prev + 1);
        const res = await faqService.markHelpful(faq._id);
        if (res.success && onVoteUpdate) onVoteUpdate(res.data);
      } else {
        setNotHelpfulCount(prev => prev + 1);
        const res = await faqService.markNotHelpful(faq._id);
        if (res.success && onVoteUpdate) onVoteUpdate(res.data);
      }
    } catch (err) {
      console.error('Failed to record feedback vote:', err.message);
      setHasVoted(null); // Reset on error
    }
  };

  const categoryStyle = CATEGORY_COLORS[faq.category] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <div 
      className={`glass-panel rounded-2xl border transition-all duration-300 ${
        isOpen 
          ? 'ring-1 ring-brand-400 border-brand-300 shadow-md bg-white' 
          : 'border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Header (Question Toggle) */}
      <button
        onClick={toggleOpen}
        className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-start justify-between space-x-4 focus:outline-none"
      >
        <div className="space-y-2">
          {/* Category Tag */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle}`}>
            {faq.category}
          </span>
          <h3 className={`text-base sm:text-lg font-bold tracking-tight text-slate-800 transition-colors ${
            isOpen ? 'text-brand-700' : 'hover:text-slate-900'
          }`}>
            {faq.question}
          </h3>
        </div>
        
        <div className="flex-shrink-0 mt-6 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          {isOpen ? <ChevronUp className="h-5 w-5 text-brand-600" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {/* Answer Block (Expandable) */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-5 bg-slate-50/50">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {faq.answer}
          </p>

          {/* Footer Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-4 gap-4 text-xs text-slate-400">
            {/* View Counter */}
            <div className="flex items-center space-x-1.5">
              <Eye className="h-4 w-4 text-slate-400" />
              <span>{views} views</span>
            </div>

            {/* Feedback actions */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-slate-500">Was this helpful?</span>
              <div className="flex items-center space-x-2">
                {/* Helpful button */}
                <button
                  onClick={() => handleVote('helpful')}
                  disabled={hasVoted !== null}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${
                    hasVoted === 'helpful'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : hasVoted !== null
                      ? 'opacity-40 border-slate-100 bg-slate-50 text-slate-300'
                      : 'border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:scale-95'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">{helpfulCount}</span>
                </button>

                {/* Not Helpful button */}
                <button
                  onClick={() => handleVote('not-helpful')}
                  disabled={hasVoted !== null}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${
                    hasVoted === 'not-helpful'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : hasVoted !== null
                      ? 'opacity-40 border-slate-100 bg-slate-50 text-slate-300'
                      : 'border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95'
                  }`}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">{notHelpfulCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQCard;
