import React, { useState, useEffect } from 'react';
import { X, CheckSquare, PlusCircle, HelpCircle, MessageSquare } from 'lucide-react';

const AnswerModal = ({ isOpen, question, onClose, onSubmit }) => {
  const [answer, setAnswer] = useState('');
  const [addToFAQ, setAddToFAQ] = useState(true); // Default checked for faster promotion
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (question) {
      setAnswer(question.answer || '');
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setSubmitting(true);
    await onSubmit(question._id, answer, addToFAQ);
    setSubmitting(false);
    setAnswer('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-brand-400" />
            <h3 className="font-bold text-sm sm:text-base tracking-wide">
              Resolve Pending Question
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
          {/* Question Details preview */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-100">
                {question.category}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Submitted by {question.name} ({question.email})
              </span>
            </div>
            
            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
              {question.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {question.description}
            </p>
            {question.screenshotUrl && (
              <a 
                href={question.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[10px] font-bold text-brand-600 hover:underline"
              >
                View attached screenshot URL &rarr;
              </a>
            )}
          </div>

          {/* Answer Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Write Resolution Answer
            </label>
            <textarea
              required
              rows="5"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a clear, detailed, and helpful answer for this query..."
              className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 leading-relaxed shadow-sm transition-all"
            />
          </div>

          {/* Promote checkbox */}
          <div className="flex items-start space-x-3 bg-brand-50/60 p-4 border border-brand-100 rounded-xl">
            <input
              type="checkbox"
              id="addToFAQ"
              checked={addToFAQ}
              onChange={(e) => setAddToFAQ(e.target.checked)}
              className="mt-1 h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <label htmlFor="addToFAQ" className="text-xs sm:text-sm text-slate-700 leading-snug cursor-pointer select-none">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <PlusCircle className="h-4 w-4 text-brand-600 inline mr-1" />
                Add directly to public FAQs list
              </span>
              If checked, this question and answer will immediately be promoted to the public FAQ card grid, automatically generating search keywords.
            </label>
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary px-4 py-2 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="btn-primary px-5 py-2 text-xs sm:text-sm flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span>{submitting ? 'Saving...' : 'Submit Resolution'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnswerModal;
