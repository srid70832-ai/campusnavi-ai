import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { UserSession } from '../types/campus';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (adminUser: UserSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Verified administrator credentials
    if (username.trim() === 'admin' && password === 'admin@123') {
      setIsSuccess(true);
      setTimeout(() => {
        onAdminLoginSuccess({
          id: 'USR-ADMIN-01',
          name: 'Campus Administrator',
          role: 'ADMIN',
          email: 'admin@campus.edu',
          department: 'Campus Cartography & Spatial Operations',
          isGoogleAuth: false,
        });
        setIsSuccess(false);
        setPassword('');
        onClose();
      }, 600);
    } else {
      setErrorMsg('Invalid administrator credentials. Username: admin, Password: admin@123');
    }
  };

  const handleQuickDemoFill = () => {
    setUsername('admin');
    setPassword('admin@123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={18} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-3">
            <ShieldCheck size={26} className="text-blue-400" />
          </div>

          <h2 className="text-xl font-black">Administrator Authentication</h2>
          <p className="text-xs text-slate-300 mt-1">
            Access Campus Blueprint Manager, verify spatial nodes, and publish live navigation maps.
          </p>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>Admin credentials verified! Loading Administrator Portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin@123"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Quick Demo Fill Pill */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-500">
                Credentials: <strong className="text-slate-700">admin</strong> / <strong className="text-slate-700">admin@123</strong>
              </span>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg transition"
              >
                Auto-fill
              </button>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              <ShieldCheck size={16} />
              <span>Sign In as Administrator</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
