import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import YakshaMiniChat from './components/YakshaMiniChat.jsx';

// Pages
import FAQPage from './pages/FAQPage.jsx';
import AskQuestionPage from './pages/AskQuestionPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased">
          {/* Main Shared Navigation bar */}
          <Navbar />
          
          {/* Viewport content */}
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<FAQPage />} />
              <Route path="/ask" element={<AskQuestionPage />} />
              <Route path="/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* Fallback to Browse FAQs */}
              <Route path="*" element={<FAQPage />} />
            </Routes>
          </div>
          
          {/* Main Portal Footer */}
          <footer className="w-full py-6 mt-12 bg-white border-t border-slate-200 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>&copy; {new Date().getFullYear()} VLED Lab, IIT Ropar. All rights reserved.</span>
          </footer>

          {/* Glowing Yaksha Mini RAG Assistant */}
          <YakshaMiniChat />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
