import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { faqService } from '../services/api.js';
import FAQCard from '../components/FAQCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { HelpCircle, ChevronRight, Sparkles, MessageSquare } from 'lucide-react';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [trendingFaqs, setTrendingFaqs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Debounced search trigger
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        let res;
        if (searchQuery.trim()) {
          res = await faqService.search(searchQuery.trim(), selectedCategory);
        } else {
          res = await faqService.getAll(selectedCategory);
        }
        if (res.success) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchFaqs();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory]);

  // Fetch trending FAQs once on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // We call all FAQs sorted by trending
        const res = await faqService.getAll('All', 'trending');
        if (res.success) {
          setTrendingFaqs(res.data.slice(0, 5)); // Keep top 5 trending
        }
      } catch (err) {
        console.error('Failed to load trending FAQs:', err.message);
      }
    };
    fetchTrending();
  }, []);

  const handleVoteUpdate = (updatedFaq) => {
    // Proactively update FAQ entry in local state list
    setFaqs(prev => prev.map(f => f._id === updatedFaq._id ? updatedFaq : f));
  };

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero Search Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-600 to-indigo-800 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/20 via-slate-900/40 to-slate-900 opacity-60 pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto space-y-6 animate-slide-up">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="h-4 w-4 text-brand-300" />
            <span>Intelligent Crowd-Sourced FAQ System</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            How can we help you <span className="underline decoration-brand-400 decoration-wavy underline-offset-8">succeed</span>?
          </h2>
          
          <p className="text-slate-200 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-medium opacity-90 leading-relaxed">
            Search answers for the Samagama Internship Program under VLED Lab, IIT Ropar. Reduce redundant tickets by viewing crowd-sourced resolutions instantly!
          </p>

          <div className="pt-2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search offer letters, certificates, login errors..."
            />
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FAQ browse section (Left Col) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 flex items-center space-x-2">
              <span>Browse Categories</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Showing {faqs.length} answer{faqs.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Quick Filters */}
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Card list */}
          {loading ? (
            <LoadingSpinner size="medium" />
          ) : faqs.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h4 className="font-bold text-slate-800 text-lg">No FAQs found</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1 leading-relaxed">
                We couldn't find any FAQs matching your query or selected category.
              </p>
              <div className="mt-6">
                <Link to="/ask" className="btn-primary py-2 px-5 text-sm">
                  Ask a new question
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <FAQCard 
                  key={faq._id} 
                  faq={faq} 
                  onVoteUpdate={handleVoteUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar widgets (Right Col) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Ask Question Call to Action */}
          <div className="glass-panel border border-brand-200 bg-brand-50/40 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-100">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base sm:text-lg">
                Didn't find your answer?
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-normal">
                Submit a question directly to the VLED Lab IIT Ropar coordinating team! We will resolve it and publish the answer shortly.
              </p>
            </div>
            <Link 
              to="/ask"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 shadow transition-all active:scale-98"
            >
              <span>Ask a Question</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Trending FAQs panel */}
          <div className="glass-panel border border-slate-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <h4 className="font-bold text-slate-800 text-sm sm:text-base uppercase tracking-wide">
                Trending Questions
              </h4>
            </div>

            {trendingFaqs.length === 0 ? (
              <p className="text-xs text-slate-400">Loading hot topics...</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {trendingFaqs.map((faq, index) => (
                  <li key={faq._id} className="py-2.5 first:pt-0 last:pb-0">
                    <button
                      onClick={() => {
                        // Triggers open in main view or just shows details
                        setSelectedCategory('All');
                        setSearchQuery(faq.question);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors line-clamp-2 pr-2"
                    >
                      <span className="text-brand-500 font-bold mr-1.5">{index + 1}.</span>
                      {faq.question}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
};

export default FAQPage;
