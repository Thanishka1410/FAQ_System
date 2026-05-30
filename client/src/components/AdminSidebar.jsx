import React from 'react';
import { HelpCircle, BarChart3, ListTodo, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const AdminSidebar = ({ activeTab, onTabChange, pendingCount }) => {
  const { admin } = useAuth();

  const menuItems = [
    {
      id: 'resolve',
      name: 'Resolve Questions',
      icon: ListTodo,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'faqs',
      name: 'Manage FAQs',
      icon: FileSpreadsheet,
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      icon: BarChart3,
    },
    {
      id: 'yaksha',
      name: 'Yaksha RAG Console',
      icon: HelpCircle,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col shadow-xl">
      {/* Admin Profile */}
      <div className="flex items-center space-x-3 pb-6 mb-6 border-b border-slate-800">
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-900/45 uppercase">
          {admin?.name ? admin.name[0] : 'A'}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-slate-100 truncate text-sm sm:text-base leading-snug">
            {admin?.name || 'Administrator'}
          </h4>
          <p className="text-slate-500 text-[10px] sm:text-xs tracking-wider font-semibold uppercase leading-none mt-0.5">
            Role: {admin?.role || 'Admin'}
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all group active:scale-98 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-900/30'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'
                }`} />
                <span>{item.name}</span>
              </div>
              
              {item.badge !== null && (
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive 
                    ? 'bg-slate-900 text-brand-400' 
                    : 'bg-brand-600 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Lab footer tag */}
      <div className="pt-6 mt-6 border-t border-slate-800 text-center lg:text-left">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          IIT Ropar FAQ Admin
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
