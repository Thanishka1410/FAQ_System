import React from 'react';
import { FileSpreadsheet, HelpCircle, AlertCircle, CheckCircle, Copy, AlertTriangle } from 'lucide-react';

const AnalyticsCards = ({ summary }) => {
  const {
    totalFAQs = 0,
    totalQuestions = 0,
    pendingQuestions = 0,
    answeredQuestions = 0,
    duplicateQuestions = 0,
    rejectedQuestions = 0,
  } = summary || {};

  const cards = [
    {
      title: 'Total Active FAQs',
      value: totalFAQs,
      icon: FileSpreadsheet,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-200/50',
      label: 'Publicly browsable answers'
    },
    {
      title: 'Pending Questions',
      value: pendingQuestions,
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-200/50',
      label: 'Awaiting resolution'
    },
    {
      title: 'Resolved Questions',
      value: answeredQuestions,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200/50',
      label: 'Answered & promoted'
    },
    {
      title: 'Total Submissions',
      value: totalQuestions,
      icon: HelpCircle,
      color: 'from-slate-700 to-slate-800',
      shadow: 'shadow-slate-200/50',
      label: 'Crowd-sourced tickets'
    },
  ];

  const subStats = [
    { name: 'Duplicates Blocked/Flagged', count: duplicateQuestions, icon: Copy, textColor: 'text-violet-600', bgColor: 'bg-violet-50 border-violet-100' },
    { name: 'Irrelevant/Rejected', count: rejectedQuestions, icon: AlertTriangle, textColor: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`relative overflow-hidden bg-gradient-to-br ${card.color} text-white p-5 rounded-2xl shadow-lg ${card.shadow} transform transition-all duration-300 hover:scale-102 hover:-translate-y-0.5`}
            >
              {/* Glow Accent */}
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <Icon className="h-28 w-28" />
              </div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                    {card.title}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-white/80 font-medium mt-4">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sub Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className={`flex items-center justify-between p-4 rounded-xl border ${stat.bgColor}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 ${stat.textColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700">{stat.name}</span>
              </div>
              <span className={`text-lg sm:text-xl font-extrabold ${stat.textColor}`}>
                {stat.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsCards;
