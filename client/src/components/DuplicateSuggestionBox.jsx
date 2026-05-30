import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, CheckCircle, ExternalLink } from 'lucide-react';

const DuplicateSuggestionBox = ({ matches, hasHighMatch }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!matches || matches.length === 0) return null;

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Alert Header */}
      <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
        hasHighMatch 
          ? 'bg-rose-50 border-rose-200 text-rose-800' 
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm sm:text-base">
            {hasHighMatch 
              ? 'Similar Question Detected (Duplicate Blocked)' 
              : 'Possible Matching Answers Found'}
          </h4>
          <p className="text-xs sm:text-sm leading-normal opacity-90">
            {hasHighMatch 
              ? 'Our system detected an existing FAQ that is extremely similar to your query. To prevent cluttering the coordinator queue, submitting this question is blocked. Please read the matched answer below.'
              : 'We found some existing FAQs that might answer your question. Please review them. If they do not resolve your query, you are still free to submit.'}
          </p>
        </div>
      </div>

      {/* Suggested Matching Cards */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white divide-y divide-slate-100">
        <div className="bg-slate-50/80 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Suggested Answers
        </div>
        {matches.map((match) => {
          const isExpanded = expandedId === match._id;
          const scoreColor = 
            match.score >= 80 
              ? 'text-rose-600 bg-rose-50 border-rose-100' 
              : match.score >= 50 
              ? 'text-amber-600 bg-amber-50 border-amber-100' 
              : 'text-brand-600 bg-brand-50 border-brand-100';

          return (
            <div key={match._id} className="transition-colors hover:bg-slate-50/30">
              <button
                type="button"
                onClick={() => toggleExpand(match._id)}
                className="w-full text-left px-4 py-4 flex items-center justify-between space-x-3 focus:outline-none"
              >
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreColor}`}>
                      {match.score}% Match
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 capitalize">
                      {match.category}
                    </span>
                  </div>
                  <h5 className="font-semibold text-sm sm:text-base text-slate-800 truncate pr-4">
                    {match.question}
                  </h5>
                </div>
                
                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-brand-600" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 animate-fade-in">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    <div className="font-bold text-slate-700 text-xs uppercase mb-1 flex items-center space-x-1">
                      <CheckCircle className="h-3.5 w-3.5 text-brand-500" />
                      <span>Answer:</span>
                    </div>
                    {match.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DuplicateSuggestionBox;
