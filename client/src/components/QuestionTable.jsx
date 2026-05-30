import React from 'react';
import { Calendar, User, Mail, MessageSquare, ClipboardCopy, Trash2, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const STATUS_PILLS = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Answered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Duplicate': 'bg-violet-50 text-violet-700 border-violet-200',
  'AddedToFAQ': 'bg-blue-50 text-brand-700 border-brand-200',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
};

const QuestionTable = ({ questions, onOpenAnswer, onUpdateStatus, onDelete }) => {
  const formatDate = (dateStr) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h4 className="font-bold text-slate-800 text-lg">No questions found</h4>
        <p className="text-slate-400 text-sm mt-1">
          Everything is resolved. High five! 🙌
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-200 text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-4">Asked By</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4 w-1/3">Question Title & Details</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {questions.map((q) => {
              const statusPill = STATUS_PILLS[q.status] || 'bg-slate-50 text-slate-700 border-slate-200';
              return (
                <tr key={q._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Asked By */}
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 leading-tight">{q.name}</div>
                    <div className="text-xs text-slate-400 font-medium flex items-center space-x-1 mt-0.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{q.email}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-1 font-semibold">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(q.createdAt)}</span>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {q.category}
                    </span>
                  </td>
                  {/* Title & Description */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 leading-snug">{q.title}</div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{q.description}</p>
                      
                      {/* Attached Screenshot link if exists */}
                      {q.screenshotUrl && (
                        <a 
                          href={q.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 mt-1 hover:underline bg-brand-50 px-2 py-0.5 rounded-md"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>View Screenshot</span>
                        </a>
                      )}

                      {/* Display matched suggestions badge */}
                      {q.matchedFAQIds && q.matchedFAQIds.length > 0 && (
                        <div className="text-[10px] text-slate-400 font-medium pt-1">
                          Matched suggestion: <span className="font-bold text-slate-500">{q.matchedFAQIds.length} existing FAQ(s)</span>
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusPill}`}>
                      {q.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {q.status === 'Pending' && (
                        <button
                          onClick={() => onOpenAnswer(q)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                        >
                          Answer
                        </button>
                      )}
                      
                      {q.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(q._id, 'Duplicate')}
                            className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 border border-transparent hover:border-violet-100 transition-all active:scale-95"
                            title="Mark as Duplicate"
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => onUpdateStatus(q._id, 'Rejected')}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all active:scale-95"
                            title="Reject Question"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => onDelete(q._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {questions.map((q) => {
          const statusPill = STATUS_PILLS[q.status] || 'bg-slate-50 text-slate-700 border-slate-200';
          return (
            <div key={q._id} className="glass-panel border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              {/* Header: User & Status */}
              <div className="flex items-start justify-between space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase text-xs">
                    {q.name[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm leading-tight">{q.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">{formatDate(q.createdAt)}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusPill}`}>
                  {q.status}
                </span>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 mb-1">
                  {q.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{q.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{q.description}</p>
                
                {q.screenshotUrl && (
                  <a 
                    href={q.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[10px] font-semibold text-brand-600 hover:underline bg-brand-50 px-2 py-0.5 rounded mt-1.5"
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>View Screenshot</span>
                  </a>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[130px]">{q.email}</span>
                
                <div className="flex items-center space-x-1.5">
                  {q.status === 'Pending' && (
                    <button
                      onClick={() => onOpenAnswer(q)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-sm"
                    >
                      Answer
                    </button>
                  )}
                  
                  {q.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(q._id, 'Duplicate')}
                        className="p-1.5 bg-slate-50 rounded-lg text-violet-600 border border-slate-200"
                        title="Mark as Duplicate"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" />
                      </button>
                      
                      <button
                        onClick={() => onUpdateStatus(q._id, 'Rejected')}
                        className="p-1.5 bg-slate-50 rounded-lg text-rose-600 border border-slate-200"
                        title="Reject"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => onDelete(q._id)}
                    className="p-1.5 bg-slate-50 rounded-lg text-slate-400 border border-slate-200"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionTable;
