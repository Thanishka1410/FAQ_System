import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { questionService, faqService, analyticsService, yakshaService } from '../services/api.js';
import AdminSidebar from '../components/AdminSidebar.jsx';
import QuestionTable from '../components/QuestionTable.jsx';
import AnswerModal from '../components/AnswerModal.jsx';
import AnalyticsCards from '../components/AnalyticsCards.jsx';
import Toast from '../components/Toast.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { 
  FileSpreadsheet, Sparkles, Plus, AlertCircle, Edit, Trash2, 
  HelpCircle, Eye, ThumbsUp, ThumbsDown, Check, TrendingUp, RefreshCw,
  LayoutGrid, List, Search, ListFilter, ArrowUpDown, AlertTriangle
} from 'lucide-react';
import { CATEGORIES } from '../components/CategoryFilter.jsx';

const CATEGORY_COLORS = {
  'Offer Letter': 'bg-blue-50 text-blue-700 border-blue-100',
  'Selection Confirmation': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Login Issues': 'bg-amber-50 text-amber-700 border-amber-100',
  'Certificate': 'bg-purple-50 text-purple-700 border-purple-100',
  'Internship Process': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Technical Issues': 'bg-rose-50 text-rose-700 border-rose-100',
  'General Queries': 'bg-slate-50 text-slate-700 border-slate-100',
};

const AdminDashboard = () => {
  const { admin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Tab and loading states
  const [activeTab, setActiveTab] = useState('resolve');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Data States
  const [questions, setQuestions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Yaksha States
  const [yakshaStatus, setYakshaStatus] = useState(null);
  const [yakshaQuery, setYakshaQuery] = useState('');
  const [yakshaChat, setYakshaChat] = useState([
    { role: 'assistant', text: "Hello! I am Yaksha Mini, your AI coordinator assistant. Ask me anything about the Vicharanashala internship policies, NOC processes, offer letters, or Rosetta journals!" }
  ]);
  const [yakshaChatLoading, setYakshaChatLoading] = useState(false);

  // Modal and Form States
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isCreateFaqOpen, setIsCreateFaqOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  // FAQ directory interactive console states
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqSelectedCategory, setFaqSelectedCategory] = useState('All');
  const [faqSortBy, setFaqSortBy] = useState('newest');
  const [faqViewMode, setFaqViewMode] = useState('grid');

  // New FAQ form values
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState(CATEGORIES.filter(c => c !== 'All')[0]);
  const [faqKeywords, setFaqKeywords] = useState('');

  // Filters for resolving questions
  const [resolveCategory, setResolveCategory] = useState('All');
  const [resolveStatus, setResolveStatus] = useState('Pending');

  // Verify authentication
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate('/login');
    }
  }, [admin, authLoading, navigate]);

  // Load all dashboard content
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pending and general questions
      const questionRes = await questionService.getAll(resolveCategory, resolveStatus);
      if (questionRes.success) {
        setQuestions(questionRes.data);
        setRecommendations(questionRes.recommendations || []);
      }

      // 2. Fetch FAQs
      const faqRes = await faqService.getAll();
      if (faqRes.success) {
        setFaqs(faqRes.data);
      }

      // 3. Fetch Analytics
      const analyticsRes = await analyticsService.getSummary();
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }

      // 4. Fetch Yaksha status
      try {
        const yakshaRes = await yakshaService.getStatus();
        if (yakshaRes.success) {
          setYakshaStatus(yakshaRes.data);
        }
      } catch (err) {
        console.error('Yaksha status failed:', err.message);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err.message);
      setToast({ type: 'error', message: 'Failed to fetch dashboard reports. Check server connection.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadDashboardData();
    }
  }, [admin, resolveCategory, resolveStatus]);

  // Handle answering questions
  const handleOpenAnswerModal = (question) => {
    setSelectedQuestion(question);
    setIsAnswerModalOpen(true);
  };

  const handleCloseAnswerModal = () => {
    setSelectedQuestion(null);
    setIsAnswerModalOpen(false);
  };

  const handleSubmitResolution = async (id, answerText, addToFAQ) => {
    try {
      const res = await questionService.answer(id, answerText, addToFAQ);
      if (res.success) {
        setToast({ 
          type: 'success', 
          message: addToFAQ ? 'Question resolved and pushed directly to FAQs!' : 'Question answered.' 
        });
        handleCloseAnswerModal();
        loadDashboardData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to resolve question.' });
    }
  };

  // Update question status (Duplicate, Reject)
  const handleUpdateQuestionStatus = async (id, status) => {
    try {
      const res = await questionService.updateStatus(id, status);
      if (res.success) {
        setToast({ type: 'success', message: `Question status updated to ${status}.` });
        loadDashboardData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update status.' });
    }
  };

  // Delete a question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This cannot be undone.')) return;
    try {
      const res = await questionService.delete(id);
      if (res.success) {
        setToast({ type: 'success', message: 'Question deleted successfully.' });
        loadDashboardData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete question.' });
    }
  };

  // Handle FAQ form submit (Create or Edit)
  const handleFAQSubmit = async (e) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer || !faqCategory) {
      setToast({ type: 'error', message: 'Please fill in all required FAQ fields.' });
      return;
    }

    const keywordArray = faqKeywords
      ? faqKeywords.split(',').map(kw => kw.trim()).filter(Boolean)
      : [];

    try {
      if (editingFaq) {
        // Edit flow
        const res = await faqService.update(editingFaq._id, {
          question: faqQuestion,
          answer: faqAnswer,
          category: faqCategory,
          keywords: keywordArray
        });
        if (res.success) {
          setToast({ type: 'success', message: 'FAQ updated successfully!' });
          setEditingFaq(null);
          setIsCreateFaqOpen(false);
          resetFaqForm();
          loadDashboardData();
        }
      } else {
        // Create flow
        const res = await faqService.create({
          question: faqQuestion,
          answer: faqAnswer,
          category: faqCategory,
          keywords: keywordArray
        });
        if (res.success) {
          setToast({ type: 'success', message: 'New FAQ added to directory!' });
          setIsCreateFaqOpen(false);
          resetFaqForm();
          loadDashboardData();
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save FAQ.' });
    }
  };

  // Delete a FAQ
  const handleDeleteFAQ = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ card? This cannot be undone.')) return;
    try {
      const res = await faqService.delete(id);
      if (res.success) {
        setToast({ type: 'success', message: 'FAQ card removed.' });
        loadDashboardData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete FAQ.' });
    }
  };

  // Sync FAQs from local placed file (RAG-ready)
  const handleSyncFAQFile = async () => {
    setLoading(true);
    try {
      const res = await faqService.syncLocalFile();
      if (res.success) {
        setToast({ 
          type: 'success', 
          message: res.message || 'Successfully synchronized FAQs from local file!' 
        });
        loadDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sync FAQs from local file. Make sure faqs.json or faqs.txt exists in the project/server folder.';
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Handle Yaksha Mini RAG Queries
  const handleSendToYaksha = async (e) => {
    e.preventDefault();
    if (!yakshaQuery.trim()) return;
    
    const userMsg = yakshaQuery;
    setYakshaChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setYakshaQuery('');
    setYakshaChatLoading(true);
    
    try {
      const res = await yakshaService.query(userMsg);
      if (res.success) {
        setYakshaChat(prev => [...prev, {
          role: 'assistant',
          text: res.data.answer,
          category: res.data.category,
          confidence: res.data.confidence,
          matches: res.data.matches
        }]);
      } else {
        setToast({ type: 'error', message: 'Failed to query Yaksha.' });
      }
    } catch (err) {
      setYakshaChat(prev => [...prev, { role: 'assistant', text: "Sorry, I ran into an error trying to process that." }]);
    } finally {
      setYakshaChatLoading(false);
    }
  };


  // Set values for edit
  const handleOpenEditFAQ = (faq) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category);
    setFaqKeywords(faq.keywords ? faq.keywords.join(', ') : '');
    setIsCreateFaqOpen(true);
  };

  const resetFaqForm = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory(CATEGORIES.filter(c => c !== 'All')[0]);
    setFaqKeywords('');
  };

  // Filter, search, and sort FAQs locally
  const filteredFaqs = faqs
    .filter(faq => {
      const matchesCategory = faqSelectedCategory === 'All' || faq.category === faqSelectedCategory;
      
      const qText = faq.question ? faq.question.toLowerCase() : '';
      const aText = faq.answer ? faq.answer.toLowerCase() : '';
      const kwText = faq.keywords ? faq.keywords.join(' ').toLowerCase() : '';
      const searchLower = faqSearchQuery.toLowerCase();
      
      const matchesSearch = qText.includes(searchLower) || aText.includes(searchLower) || kwText.includes(searchLower);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (faqSortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      if (faqSortBy === 'helpful') {
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      }
      if (faqSortBy === 'confusion') {
        return (b.confusionScore || 0) - (a.confusionScore || 0);
      }
      // 'newest'
      return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
    });

  // Calculate local FAQ-specific metrics
  const totalFaqViews = faqs.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalHelpfulVotes = faqs.reduce((acc, curr) => acc + (curr.helpfulCount || 0), 0);
  const totalNotHelpfulVotes = faqs.reduce((acc, curr) => acc + (curr.notHelpfulCount || 0), 0);
  const avgHelpfulPercentage = totalHelpfulVotes + totalNotHelpfulVotes > 0
    ? Math.round((totalHelpfulVotes / (totalHelpfulVotes + totalNotHelpfulVotes)) * 100)
    : 100;
  const highConfusionFaqsCount = faqs.filter(faq => (faq.confusionScore || 0) >= 5).length;

  if (authLoading || !admin) {
    return <LoadingSpinner size="large" fullPage={true} />;
  }

  const pendingCount = analytics?.summary?.pendingQuestions || 0;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      
      {/* Toast Alert */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
      />

      {/* Main Console Section */}
      <main className="flex-1 space-y-6">
        
        {/* Title Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 p-5 rounded-2xl gap-4 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 capitalize">
              {activeTab === 'resolve' ? 'Resolution Desk' : activeTab === 'faqs' ? 'FAQ Catalog' : 'Analytics & Performance'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Samagama Internship Program Management Console
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-600 shadow-sm active:scale-95 disabled:opacity-55"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Portal</span>
          </button>
        </div>

        {/* Dynamic Panels */}
        {loading ? (
          <LoadingSpinner size="medium" />
        ) : (
          <>
            {/* RESOLVE QUESTIONS PANEL */}
            {activeTab === 'resolve' && (
              <div className="space-y-6">
                
                {/* Auto FAQ Recommendation widget */}
                {recommendations && recommendations.length > 0 && (
                  <div className="p-5 bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-indigo-500/10 border border-brand-200/80 rounded-2xl space-y-3 shadow-sm animate-pulse-subtle">
                    <div className="flex items-center space-x-2 text-brand-700">
                      <Sparkles className="h-5 w-5 animate-bounce" />
                      <h4 className="font-extrabold text-sm sm:text-base">
                        System Recommendation: Frequent Queries Detected
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      Our similarity matching clustering has detected <span className="font-bold text-brand-700">{recommendations.length} new group(s)</span> of highly recurring pending questions. Consider making them a formal FAQ card:
                    </p>
                    
                    <div className="space-y-2">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="bg-white/95 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-2 py-0.5 border border-brand-100 rounded">
                              {rec.category}
                            </span>
                            <h5 className="font-bold text-slate-800 text-xs sm:text-sm truncate mt-1 leading-snug">
                              Suggested: "{rec.representativeQuestion}"
                            </h5>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
                              Reason: {rec.reason}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => {
                              // Prep AnswerModal pre-filled
                              const pseudoQ = {
                                _id: rec.questionIds[0],
                                category: rec.category,
                                title: rec.representativeQuestion,
                                description: `Frequently asked details regarding ${rec.representativeQuestion}`,
                                name: 'Samagama Interns Cluster',
                                email: 'multiple-queries'
                              };
                              handleOpenAnswerModal(pseudoQ);
                            }}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex-shrink-0"
                          >
                            Create FAQ
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters Row */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  {/* Category select */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Category:
                    </label>
                    <select
                      value={resolveCategory}
                      onChange={(e) => setResolveCategory(e.target.value)}
                      className="block w-full sm:w-auto px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status select */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status Queue:
                    </label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-0.5">
                      {['Pending', 'Answered', 'Duplicate', 'Rejected', 'All'].map(status => (
                        <button
                          key={status}
                          onClick={() => setResolveStatus(status)}
                          className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold tracking-wide transition-all ${
                            resolveStatus === status
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table display */}
                <QuestionTable
                  questions={questions}
                  onOpenAnswer={handleOpenAnswerModal}
                  onUpdateStatus={handleUpdateQuestionStatus}
                  onDelete={handleDeleteQuestion}
                />
              </div>
            )}
            {/* MANAGE FAQS PANEL */}
            {activeTab === 'faqs' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* FAQ Dashboard Metrics Ribbon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Stat 1: Total FAQs */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog FAQs</span>
                      <span className="text-2xl font-black text-slate-900">{faqs.length}</span>
                      <span className="text-[10px] font-medium text-slate-400 block">Curated formal database</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* Stat 2: Total Views */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative FAQ Views</span>
                      <span className="text-2xl font-black text-slate-900">{totalFaqViews}</span>
                      <span className="text-[10px] font-medium text-slate-400 block">Total intern reads logged</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Stat 3: Avg Helpfulness */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Helpful Ratio</span>
                      <span className="text-2xl font-black text-slate-900">{avgHelpfulPercentage}%</span>
                      <span className="text-[10px] font-medium text-slate-400 block font-bold text-emerald-600">User satisfaction benchmark</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <ThumbsUp className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Stat 4: High Confusion Alerts */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FAQs Needing Update</span>
                      <span className={`text-2xl font-black ${highConfusionFaqsCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>{highConfusionFaqsCount}</span>
                      <span className="text-[10px] font-medium text-slate-400 block">Confusion score &ge; 5</span>
                    </div>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                      highConfusionFaqsCount > 0 
                        ? 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Interactive Controls Row */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-grow max-w-xl">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={faqSearchQuery}
                        onChange={(e) => setFaqSearchQuery(e.target.value)}
                        placeholder="Search through curated FAQ questions, answers, and keywords..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                      {faqSearchQuery && (
                        <button
                          onClick={() => setFaqSearchQuery('')}
                          type="button"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick controls: Sort and View mode switcher, Sync file, Create FAQ */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Sort selector */}
                      <div className="flex items-center space-x-1.5">
                        <ListFilter className="h-4 w-4 text-slate-400" />
                        <select
                          value={faqSortBy}
                          onChange={(e) => setFaqSortBy(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none text-slate-700 font-bold"
                        >
                          <option value="newest">Sort: Newest</option>
                          <option value="views">Sort: Views/Traffic</option>
                          <option value="helpful">Sort: Helpfulness</option>
                          <option value="confusion">Sort: Confusion Score</option>
                        </select>
                      </div>

                      {/* View Mode Toggle (Grid vs Table) */}
                      <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setFaqViewMode('grid')}
                          className={`p-1.5 rounded-lg transition-all ${
                            faqViewMode === 'grid'
                              ? 'bg-white text-brand-600 shadow-sm border border-slate-100'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Grid View"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFaqViewMode('table')}
                          className={`p-1.5 rounded-lg transition-all ${
                            faqViewMode === 'table'
                              ? 'bg-white text-brand-600 shadow-sm border border-slate-100'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title="Compact Table View"
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Action buttons */}
                      <button
                        type="button"
                        onClick={handleSyncFAQFile}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm active:scale-95 transition-all"
                        title="Sync from local file (faqs.json or faqs.txt)"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        <span>Sync File</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          resetFaqForm();
                          setIsCreateFaqOpen(true);
                        }}
                        className="btn-primary py-2 px-3 text-xs flex items-center justify-center space-x-1 font-bold"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create FAQ</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal category filtering chips */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block shrink-0">Category:</span>
                    <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-h-24 scrollbar-thin">
                      {CATEGORIES.map(cat => {
                        const isActive = faqSelectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFaqSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border active:scale-95 shrink-0 ${
                              isActive
                                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* FAQ Creation/Edit Form overlays / inline details */}
                {isCreateFaqOpen && (
                  <form 
                    onSubmit={handleFAQSubmit}
                    className="p-5 sm:p-6 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4 shadow-sm animate-slide-up"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center space-x-1.5">
                        <FileSpreadsheet className="h-5 w-5 text-brand-600" />
                        <span>{editingFaq ? 'Edit FAQ Card' : 'Create New FAQ Card'}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateFaqOpen(false);
                          resetFaqForm();
                        }}
                        className="text-slate-400 hover:text-slate-600 font-extrabold text-sm"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          FAQ Question Text
                        </label>
                        <input
                          type="text"
                          required
                          value={faqQuestion}
                          onChange={(e) => setFaqQuestion(e.target.value)}
                          placeholder="e.g. When will I receive my offer letter?"
                          className="block w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          FAQ Category
                        </label>
                        <select
                          value={faqCategory}
                          onChange={(e) => setFaqCategory(e.target.value)}
                          className="block w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                        >
                          {CATEGORIES.filter(c => c !== 'All').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        FAQ Answer
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        placeholder="Provide the accurate resolution text..."
                        className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>FAQ Search Keywords</span>
                        <span className="text-[10px] text-slate-400 capitalize font-medium">Separate keywords with commas</span>
                      </label>
                      <input
                        type="text"
                        value={faqKeywords}
                        onChange={(e) => setFaqKeywords(e.target.value)}
                        placeholder="e.g. offer, letter, receive, batch, delay"
                        className="block w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                      />
                      {/* Live Keyword Tag Chips Preview */}
                      {faqKeywords.trim() && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {faqKeywords.split(',').map(kw => kw.trim()).filter(Boolean).map((kw, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded bg-brand-50 border border-brand-100 text-[10px] font-bold text-brand-600 animate-slide-up">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 border-t border-slate-200 pt-3 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateFaqOpen(false);
                          resetFaqForm();
                        }}
                        className="btn-secondary py-2 px-3 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary py-2 px-4 text-xs font-bold bg-brand-600"
                      >
                        {editingFaq ? 'Update FAQ Card' : 'Save FAQ Card'}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of existing FAQ cards in Grid or Table view */}
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="font-bold text-slate-800 text-lg">No FAQs found</h4>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1 leading-relaxed">
                      We couldn't find any formal FAQs matching search <strong>"{faqSearchQuery}"</strong> under category <strong>"{faqSelectedCategory}"</strong>.
                    </p>
                    <button
                      onClick={() => {
                        setFaqSearchQuery('');
                        setFaqSelectedCategory('All');
                      }}
                      type="button"
                      className="mt-6 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl"
                    >
                      Reset Filters & Search
                    </button>
                  </div>
                ) : faqViewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFaqs.map((faq) => {
                      const categoryStyle = CATEGORY_COLORS[faq.category] || 'bg-slate-100 text-slate-800 border-slate-200';
                      return (
                        <div 
                          key={faq._id}
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${categoryStyle}`}>
                                {faq.category}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                                <Eye className="h-3 w-3 inline mr-0.5" />
                                <span>{faq.views} views</span>
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 pr-4">
                              {faq.question}
                            </h4>
                            <p className="text-xs text-slate-500 leading-normal line-clamp-3">
                              {faq.answer}
                            </p>
                            {/* Render small tag badges if keywords exist */}
                            {faq.keywords && faq.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1.5">
                                {faq.keywords.slice(0, 4).map((kw, i) => (
                                  <span key={i} className="text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.2 border border-slate-100 rounded">
                                    #{kw}
                                  </span>
                                ))}
                                {faq.keywords.length > 4 && (
                                  <span className="text-[9px] font-medium text-slate-400">+{faq.keywords.length - 4} more</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Card actions */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] sm:text-xs">
                            <div className="flex items-center space-x-2 text-slate-400">
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded">+{faq.helpfulCount} helpful</span>
                              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 border border-rose-100 rounded">-{faq.notHelpfulCount} confusion</span>
                            </div>
                            
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleOpenEditFAQ(faq)}
                                type="button"
                                className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-brand-600 hover:text-brand-700 transition-colors border border-slate-200"
                                title="Edit FAQ"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteFAQ(faq._id)}
                                type="button"
                                className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-rose-600 hover:text-rose-700 transition-colors border border-slate-200"
                                title="Delete FAQ"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Compact Tabular Database View */
                  <div className="overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-200 text-xs font-semibold uppercase tracking-wider">
                            <th className="px-5 py-4 w-5/12 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setFaqSortBy('newest')}>
                              <div className="flex items-center space-x-1.5">
                                <span>Question & Answer</span>
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                              </div>
                            </th>
                            <th className="px-5 py-4">Category</th>
                            <th className="px-5 py-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setFaqSortBy('views')}>
                              <div className="flex items-center space-x-1.5">
                                <span>Views</span>
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                              </div>
                            </th>
                            <th className="px-5 py-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setFaqSortBy('helpful')}>
                              <div className="flex items-center space-x-1.5">
                                <span>Helpful</span>
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                              </div>
                            </th>
                            <th className="px-5 py-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setFaqSortBy('confusion')}>
                              <div className="flex items-center space-x-1.5">
                                <span>Confusion</span>
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                              </div>
                            </th>
                            <th className="px-5 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                          {filteredFaqs.map((faq) => {
                            const categoryStyle = CATEGORY_COLORS[faq.category] || 'bg-slate-100 text-slate-800 border-slate-200';
                            return (
                              <tr key={faq._id} className="hover:bg-slate-50/50 transition-colors animate-fade-in">
                                {/* Question & Answer */}
                                <td className="px-5 py-4">
                                  <div className="font-bold text-slate-900 leading-snug">{faq.question}</div>
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">{faq.answer}</p>
                                  {faq.keywords && faq.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1.5">
                                      {faq.keywords.map((kw, i) => (
                                        <span key={i} className="text-[9px] font-semibold text-slate-400">#{kw}</span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                
                                {/* Category */}
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${categoryStyle}`}>
                                    {faq.category}
                                  </span>
                                </td>

                                {/* Views */}
                                <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-500">
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-3.5 w-3.5 text-slate-400 mr-1" />
                                    <span>{faq.views}</span>
                                  </div>
                                </td>

                                {/* Helpful */}
                                <td className="px-5 py-4 whitespace-nowrap font-semibold text-emerald-600">
                                  <span>+{faq.helpfulCount}</span>
                                </td>

                                {/* Confusion Score */}
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    faq.confusionScore >= 5
                                      ? 'bg-rose-50 border-rose-100 text-rose-600'
                                      : faq.confusionScore >= 1
                                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                                        : 'bg-slate-50 border-slate-100 text-slate-400'
                                  }`}>
                                    {faq.confusionScore}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      onClick={() => handleOpenEditFAQ(faq)}
                                      type="button"
                                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-brand-600 hover:text-brand-700 transition-colors border border-slate-200 rounded-lg"
                                      title="Edit FAQ"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDeleteFAQ(faq._id)}
                                      type="button"
                                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-rose-600 hover:text-rose-700 transition-colors border border-slate-200 rounded-lg"
                                      title="Delete FAQ"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS PANEL */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6 animate-fade-in">
                
                {/* primary metric cards */}
                <AnalyticsCards summary={analytics.summary} />

                {/* Secondary Aggregation Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Category distributions */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2 flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-brand-600" />
                      <span>Most Repeated Categories</span>
                    </h3>
                    
                    <div className="space-y-3.5 pt-2">
                      {analytics.categoryDistribution.map((dist, idx) => {
                        const total = analytics.summary.totalQuestions || 1;
                        const percent = Math.round((dist.count / total) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                              <span>{dist.category}</span>
                              <span className="text-slate-400 font-bold">{dist.count} ({percent}%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hot Topics (Most viewed FAQs) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-brand-600" />
                      <span>Most Viewed FAQ Topics</span>
                    </h3>
                    
                    <div className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold">
                      {analytics.mostViewedFAQs.map((faq, idx) => (
                        <div key={idx} className="py-3 flex justify-between items-center gap-3">
                          <span className="text-slate-600 leading-tight truncate max-w-[280px]">
                            {faq.question}
                          </span>
                          <span className="text-xs font-bold text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {faq.views} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Confusion Scores and helpful ranks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Confusion Scores card */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2 flex items-center space-x-2 text-amber-700">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>Highest Confusion Score FAQs</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                      Confusion = NotHelpful + DuplicateMatch - Helpful. High scores mean the FAQ card's text needs review or revision by coordinators.
                    </p>
                    
                    <div className="space-y-3.5 pt-2">
                      {analytics.highConfusionFAQs.map((faq, idx) => {
                        const rankColors = 
                          faq.confusionScore >= 10 
                            ? 'text-rose-600 font-bold bg-rose-50 border-rose-100' 
                            : 'text-amber-600 font-bold bg-amber-50 border-amber-100';
                        return (
                          <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex justify-between items-center gap-3">
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-700 text-xs truncate leading-snug">{faq.question}</h5>
                              <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-1 font-semibold">
                                <span>+{faq.helpfulCount} H</span>
                                <span>•</span>
                                <span>-{faq.notHelpfulCount} NH</span>
                                <span>•</span>
                                <span>{faq.duplicateMatchCount} Dup matches</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 text-xs rounded-lg border ${rankColors}`}>
                              Score: {faq.confusionScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Most Helpful FAQs card */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2 flex items-center space-x-2 text-emerald-700">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>Top Helpful FAQ Cards</span>
                    </h3>
                    
                    <div className="space-y-3.5 pt-2">
                      {analytics.mostHelpfulFAQs.map((faq, idx) => (
                        <div key={idx} className="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3 flex justify-between items-center gap-3">
                          <div className="min-w-0 text-slate-700 font-semibold text-xs leading-normal">
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-0.5">{faq.category}</span>
                            {faq.question}
                          </div>
                          <span className="px-2 py-1 text-xs rounded-lg font-bold bg-emerald-600 text-white shadow-sm shrink-0">
                            +{faq.helpfulCount} votes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* YAKSHA RAG CONSOLE PANEL */}
            {activeTab === 'yaksha' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                
                {/* Left Columns - Status & Documents */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Status Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2 flex items-center space-x-2">
                      <FileSpreadsheet className="h-5 w-5 text-brand-600" />
                      <span>RAG Index Status</span>
                    </h3>
                    
                    {yakshaStatus?.isIndexed ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl text-xs">
                          <span className="font-bold text-slate-700">Database Engine</span>
                          <span className="font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">ACTIVE & READY</span>
                        </div>
                        <div className="space-y-2 text-xs font-semibold text-slate-600 p-1">
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400">Source Document:</span>
                            <span>{yakshaStatus.fileName}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-400">Total RAG Nodes:</span>
                            <span className="font-bold text-slate-800">{yakshaStatus.totalSegments} Q/As</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-400">Format:</span>
                            <span>Vicharanashala Structured (.txt)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <span>No RAG file (FAQ_info.txt) located in project root. Place it there to index.</span>
                      </div>
                    )}
                  </div>

                  {/* Categories Breakdown */}
                  {yakshaStatus?.isIndexed && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-2 flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-brand-600" />
                        <span>Knowledge Clusters</span>
                      </h3>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {yakshaStatus.categories.map((cat, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-colors">
                            <span className="truncate max-w-[180px]">{cat.name}</span>
                            <span className="bg-brand-50 border border-brand-100 text-brand-600 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              {cat.count} nodes
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Columns - Interactive Chat Interface */}
                <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm h-[600px] overflow-hidden">
                  
                  {/* Chat Header */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-900/40">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm tracking-wide">Yaksha Mini</h4>
                        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none mt-0.5">VLED AI Coordinator RAG</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
                      <span>Connected</span>
                    </span>
                  </div>

                  {/* Message Streams */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
                    {yakshaChat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-brand-600 text-white font-medium rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-3'
                        }`}>
                          <p>{msg.text}</p>
                          
                          {/* AI Meta Details */}
                          {msg.role === 'assistant' && msg.confidence !== undefined && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 mt-2 text-[10px] font-bold text-slate-400">
                              <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 uppercase">{msg.category}</span>
                              <span className={`px-2 py-0.5 rounded border ${
                                msg.confidence >= 50 
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                  : msg.confidence >= 25 
                                    ? 'bg-amber-50 border-amber-100 text-amber-600' 
                                    : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}>
                                Match: {msg.confidence}%
                              </span>
                            </div>
                          )}

                          {/* Related suggestions */}
                          {msg.role === 'assistant' && msg.matches && msg.matches.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 mt-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Related questions you can click to ask:</p>
                              <div className="flex flex-col gap-1.5">
                                {msg.matches.map((m, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setYakshaQuery(m.question);
                                    }}
                                    className="text-left text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50/50 hover:bg-brand-50 border border-brand-100/50 px-2.5 py-1.5 rounded-lg transition-all"
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

                    {yakshaChatLoading && (
                      <div className="flex justify-start animate-pulse">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm text-xs font-semibold text-slate-400 flex items-center space-x-2">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                          </span>
                          <span>Yaksha Mini is matching RAG nodes...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendToYaksha} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                    <input
                      type="text"
                      value={yakshaQuery}
                      onChange={(e) => setYakshaQuery(e.target.value)}
                      placeholder="Type a policy or FAQ question..."
                      disabled={yakshaChatLoading}
                      className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:outline-none focus:bg-white transition-all disabled:opacity-55"
                    />
                    <button
                      type="submit"
                      disabled={yakshaChatLoading || !yakshaQuery.trim()}
                      className="px-5 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md active:scale-95 transition-all text-xs sm:text-sm disabled:opacity-55"
                    >
                      Ask Yaksha
                    </button>
                  </form>

                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* Answer Modal popup overlays */}
      <AnswerModal
        isOpen={isAnswerModalOpen}
        question={selectedQuestion}
        onClose={handleCloseAnswerModal}
        onSubmit={handleSubmitResolution}
      />
    </div>
  );
};

export default AdminDashboard;
