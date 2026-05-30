import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-3',
    large: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`animate-spin rounded-full border-t-brand-600 border-slate-200 ${sizeClasses[size]}`} />
      <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wider animate-pulse-subtle">
        Loading...
      </span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50/70 backdrop-blur-sm flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{spinner}</div>;
};

export default LoadingSpinner;
