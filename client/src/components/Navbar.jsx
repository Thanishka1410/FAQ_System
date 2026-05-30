import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HelpCircle, LogOut, Shield, LayoutDashboard, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-200 transition-transform group-hover:scale-105">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                Samagama <span className="text-brand-600">FAQ Portal</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                VLED Lab, IIT Ropar
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Browse FAQs
            </Link>
            
            <Link
              to="/ask"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/ask')
                  ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Ask Question</span>
              <span className="sm:hidden">Ask</span>
            </Link>

            <span className="h-5 w-px bg-slate-200 mx-2" />

            {admin ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin')
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Admin Dashboard</span>
                  <span className="md:hidden">Console</span>
                </Link>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all active:scale-95"
                  title="Logout Admin"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/login')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
