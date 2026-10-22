import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export const FeedbackView: React.FC = () => {
  const [category, setCategory] = useState<'ROUTE' | 'LOCATION' | 'ACCESSIBILITY' | 'GENERAL'>('ROUTE');
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setRating(5);
    setIsSubmitted(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
            <MessageSquare size={14} />
            <span>Campus Community Feedback</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Feedback & Suggestions</h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1">
            Help improve campus navigation accuracy, report closed pathways or construction, or request missing classroom locations.
          </p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-slate-200/90 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-black text-slate-800">Thank You for Your Feedback!</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Your report has been submitted to the Campus Cartography & Facilities Team. Verified edits will appear in the live 3D map.
          </p>
          <button
            onClick={handleReset}
            className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Submit Another Feedback
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { id: 'ROUTE', label: 'Route Accuracy' },
                  { id: 'LOCATION', label: 'Missing Location' },
                  { id: 'ACCESSIBILITY', label: 'Wheelchair / Ramp' },
                  { id: 'GENERAL', label: 'General Idea' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      category === cat.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      size={24}
                      className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-500 ml-2">
                  {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
                </span>
              </div>
            </div>

            {/* Subject / Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Title / Topic
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Pedestrian walkway near Library is closed for paving"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Details & Suggested Correction
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what needs adjustment, building name, floor level, or route issue..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 transition transform active:scale-95"
              >
                <Send size={15} />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
