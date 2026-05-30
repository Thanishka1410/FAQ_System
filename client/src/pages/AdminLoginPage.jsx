import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { Shield, Key, Mail, Sparkles, ArrowRight } from 'lucide-react';

const AdminLoginPage = () => {
  const { admin, login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (admin) {
      navigate('/admin');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setToast({ type: 'success', message: 'Login successful! Welcome VLED Admin.' });
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Something went wrong. Please check your credentials.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden bg-slate-50/50">
      
      {/* Toast alert */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center login card */}
      <div className="w-full max-w-md glass-panel border border-slate-200/90 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
        
        {/* Brand details */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-100">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Coordinator Portal
            </h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider leading-none">
              VLED Lab, IIT Ropar
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@samagama.iitr.ac.in"
                className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* Seed helper note (extremely helpful for demo) */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start space-x-2 text-[10px] sm:text-xs text-slate-400 leading-normal">
            <Sparkles className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-600 block">Default Seed Credentials:</span>
              <span>Email: <code className="bg-slate-200 px-1 py-0.5 rounded select-all font-mono font-semibold text-slate-600">admin@samagama.iitr.ac.in</code></span>
              <br />
              <span>Pass: <code className="bg-slate-200 px-1 py-0.5 rounded select-all font-mono font-semibold text-slate-600">Admin@Samagama2026</code></span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full btn-primary py-2.5 rounded-xl font-extrabold text-sm tracking-wide shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In Securely'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
