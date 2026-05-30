import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionService } from '../services/api.js';
import DuplicateSuggestionBox from '../components/DuplicateSuggestionBox.jsx';
import Toast from '../components/Toast.jsx';
import { MessageSquare, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../components/CategoryFilter.jsx';

// Exclude 'All' from categories list for submission
const SUBMIT_CATEGORIES = CATEGORIES.filter(cat => cat !== 'All');

const AskQuestionPage = () => {
  const navigate = useNavigate();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(SUBMIT_CATEGORIES[0] || 'Offer Letter');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // Duplicate Check States
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [hasHighMatch, setHasHighMatch] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // UI Feedback States
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Debounced duplicate detection on Title + Description change
  useEffect(() => {
    if (!title.trim() || title.trim().length < 5) {
      setDuplicateMatches([]);
      setHasHighMatch(false);
      return;
    }

    const checkDuplicates = async () => {
      setCheckingDuplicates(true);
      try {
        const res = await questionService.checkDuplicate(title, description, category);
        if (res.success) {
          setDuplicateMatches(res.matches);
          setHasHighMatch(res.hasHighMatch);
        }
      } catch (err) {
        console.error('Failed to run duplicate detection:', err.message);
      } finally {
        setCheckingDuplicates(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      checkDuplicates();
    }, 600); // 600ms debounce to avoid rapid API calls while typing

    return () => clearTimeout(delayDebounce);
  }, [title, description, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !category || !title || !description) {
      setToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    if (hasHighMatch) {
      setToast({ type: 'error', message: 'Submission blocked. This question matches an existing FAQ. Please read the suggested answers.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await questionService.submit({
        name,
        email,
        category,
        title,
        description,
        screenshotUrl
      });
      if (res.success) {
        setToast({ 
          type: 'success', 
          message: 'Question submitted! A coordinator will review and answer it shortly.' 
        });
        
        // Reset form fields
        setName('');
        setEmail('');
        setCategory(SUBMIT_CATEGORIES[0]);
        setTitle('');
        setDescription('');
        setScreenshotUrl('');
        setDuplicateMatches([]);
        setHasHighMatch(false);

        // Redirect to FAQs page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit question. Please try again.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast feedback */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to FAQs</span>
      </button>

      {/* Hero header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span>Submit a Question</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-normal max-w-xl">
          Ask us anything about the Samagama Internship Program. Our system will check for duplicates in real-time to save you and our lab coordinators time!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form panel (Left/Top) */}
        <form 
          onSubmit={handleSubmit}
          className="lg:col-span-7 glass-panel border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm"
        >
          {/* Section tag */}
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold text-brand-600 uppercase tracking-widest pb-2 border-b border-slate-100">
            <Sparkles className="h-4 w-4" />
            <span>Interactive Form</span>
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 shadow-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Question Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm shadow-sm bg-white"
            >
              {SUBMIT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Question Title <span className="text-rose-500">*</span></span>
              {checkingDuplicates && <span className="text-[10px] font-semibold text-brand-600 animate-pulse">Running live scan...</span>}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. When will I receive my offer letter?"
              className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Explain Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide enough details so that our coordinators can easily resolve your issue..."
              className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 leading-relaxed shadow-sm transition-all"
            />
          </div>

          {/* Optional Screenshot Url */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Screenshot URL <span className="text-slate-400 font-semibold">(Optional)</span></span>
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="e.g. https://imgur.com/your-error-screenshot.png"
              className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting || hasHighMatch}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-extrabold text-sm tracking-wide shadow-md transition-all active:scale-98 ${
              hasHighMatch
                ? 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed shadow-none'
                : submitting
                ? 'bg-brand-500/80 text-white/90 shadow-none'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-700 hover:to-indigo-700 hover:shadow-lg shadow-brand-100'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? 'Submitting Question...' : hasHighMatch ? 'Submission Blocked' : 'Submit Ticket'}</span>
          </button>
        </form>

        {/* Live Duplicate Scan panel (Right/Bottom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel border border-slate-200/90 rounded-3xl p-5 bg-white shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2 uppercase tracking-wide">
              Live Similarity Checker
            </h3>
            
            {title.trim().length < 5 ? (
              <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                Start typing your question title to activate real-time duplicate checks.
              </div>
            ) : checkingDuplicates && duplicateMatches.length === 0 ? (
              <div className="text-center py-10 text-brand-600 text-xs sm:text-sm font-semibold animate-pulse">
                Scanning VLED Lab FAQ database...
              </div>
            ) : duplicateMatches.length === 0 ? (
              <div className="text-center py-10 text-emerald-600 text-xs sm:text-sm font-semibold">
                No matching FAQs found. You are good to submit!
              </div>
            ) : (
              <DuplicateSuggestionBox 
                matches={duplicateMatches}
                hasHighMatch={hasHighMatch}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AskQuestionPage;
