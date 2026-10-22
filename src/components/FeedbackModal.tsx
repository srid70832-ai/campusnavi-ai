import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState<'ROUTE' | 'FACILITY' | 'ACCESSIBILITY' | 'GENERAL'>('ROUTE');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Campus Navigator Feedback</h3>
              <p className="text-[11px] text-slate-400">Report Obstacles or Request New Rooms</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={28} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Thank You for Your Feedback!</h4>
              <p className="text-xs text-slate-500">
                Your report has been dispatched to campus facilities and navigation administration.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Feedback Topic</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCategory('ROUTE')}
                    className={`py-2 px-3 rounded-xl font-semibold border transition ${
                      category === 'ROUTE'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pathway / Closure
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('ACCESSIBILITY')}
                    className={`py-2 px-3 rounded-xl font-semibold border transition ${
                      category === 'ACCESSIBILITY'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Wheelchair Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('FACILITY')}
                    className={`py-2 px-3 rounded-xl font-semibold border transition ${
                      category === 'FACILITY'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Room / Facility
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('GENERAL')}
                    className={`py-2 px-3 rounded-xl font-semibold border transition ${
                      category === 'GENERAL'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    General Suggestion
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Message</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe any corridor maintenance, missing signboards, or suggestions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
              >
                <Send size={15} />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
