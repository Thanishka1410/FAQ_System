import React from 'react';

const CATEGORIES = [
  'All',
  'Offer Letter',
  'Selection Confirmation',
  'Login Issues',
  'Certificate',
  'Internship Process',
  'Technical Issues',
  'General Queries'
];

const CategoryFilter = ({ selectedCategory, onSelect }) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide border transition-all duration-200 active:scale-95 ${
                active
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-100 hover:bg-brand-700'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
export { CATEGORIES };
