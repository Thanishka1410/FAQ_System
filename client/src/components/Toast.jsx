import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgClasses = {
    success: 'bg-emerald-600 text-white shadow-emerald-950/20',
    error: 'bg-rose-600 text-white shadow-rose-950/20',
    warning: 'bg-amber-500 text-white shadow-amber-950/20',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 flex-shrink-0 text-white animate-bounce" />,
    error: <AlertCircle className="h-5 w-5 flex-shrink-0 text-white animate-pulse-subtle" />,
    warning: <AlertCircle className="h-5 w-5 flex-shrink-0 text-white" />,
  };

  return (
    <div className={`fixed bottom-5 right-5 z-[100] flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border border-white/10 animate-slide-up ${bgClasses[type]}`}>
      {icons[type]}
      <span className="text-xs sm:text-sm font-semibold tracking-wide">{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-slate-100 p-0.5 rounded-full hover:bg-white/15 transition-colors active:scale-90"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
