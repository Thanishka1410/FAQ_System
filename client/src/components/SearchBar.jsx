import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear, placeholder = "Search FAQs by keywords..." }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto shadow-sm rounded-xl">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-11 pr-10 py-3.5 sm:py-4 bg-white border border-slate-200/90 rounded-2xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm sm:text-base transition-all shadow-sm focus:shadow-md"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
        >
          <X className="h-5 w-5 bg-slate-100 hover:bg-slate-200 p-0.5 rounded-full" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
