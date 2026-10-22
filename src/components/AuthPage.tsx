import React, { useState } from 'react';
import {
  Navigation,
  Map as MapIcon,
  Bot,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Globe,
  ArrowRight,
  Building,
  GraduationCap,
  Users,
  Compass,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { UserSession } from '../types/campus';
import {
  signInWithGoogle,
  signInWithCredentials,
  registerUser,
  sendPasswordRecovery,
} from '../services/firebaseAuth';

interface AuthPageProps {
  onLoginSuccess: (user: UserSession) => void;
  onBrowseAsGuest: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  onBrowseAsGuest,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'forgot'>('signin');

  // Form Fields
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [language, setLanguage] = useState<'English' | 'தமிழ்'>('English');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const firebaseUser = await signInWithGoogle(rememberMe);
      if (firebaseUser) {
        onLoginSuccess({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google Student',
          email: firebaseUser.email || 'student@campus.edu',
          role: 'STUDENT',
          photoUrl: firebaseUser.photoURL || undefined,
          isGoogleAuth: true,
          department: 'Academic Campus',
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to sign in with Google. Please verify popup permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Username + Password Sign-In
  const handleCredentialSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const firebaseUser = await signInWithCredentials(usernameOrEmail, password, rememberMe);
      if (firebaseUser) {
        onLoginSuccess({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || usernameOrEmail.split('@')[0],
          email: firebaseUser.email || `${usernameOrEmail}@campus.edu`,
          role: 'STUDENT',
          photoUrl: firebaseUser.photoURL || undefined,
          isGoogleAuth: false,
          department: 'Academic Campus',
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage('Invalid username/email or password. Please check your credentials.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create Account / Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!registerUsername.trim() || registerUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!registerEmail.includes('@') || !registerEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const firebaseUser = await registerUser(registerUsername, registerEmail, password);
      if (firebaseUser) {
        onLoginSuccess({
          id: firebaseUser.uid,
          name: registerUsername.trim(),
          email: registerEmail.trim(),
          role: 'STUDENT',
          isGoogleAuth: false,
          department: 'Academic Campus',
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email address already exists. Please Sign In.');
      } else {
        setErrorMessage(err.message || 'Registration failed. Please check your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Recovery
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      await sendPasswordRecovery(forgotEmail);
      setSuccessMessage('If an account exists for this email, a password recovery link has been dispatched.');
    } catch (err: any) {
      // Neutral response to protect user privacy
      setSuccessMessage('If an account exists for this email, a password recovery link has been dispatched.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row antialiased ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* LEFT SIDE: Campus 3D Graphic & Product Presentation (55-60% width) */}
      <div className="lg:w-7/12 relative flex flex-col justify-between p-6 md:p-10 lg:p-12 overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100/60 border-r border-slate-200/80">
        {/* Background Radial Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Navigation size={26} className="transform -rotate-45" fill="white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Campus <span className="text-blue-600">Navigator</span> AI
              </h1>
              <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
                Find Your Way. Explore Your Campus.
              </p>
            </div>
          </div>

          {/* 3 Top Feature Badges in a Row (Matching Screenshot) */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-white/60 flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapIcon size={14} />
              </div>
              <span>Interactive 3D Campus Map</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-white/60 flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Compass size={14} />
              </div>
              <span>Shortest Path Navigation</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-white/60 flex items-center gap-2 text-xs font-bold text-slate-800">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <span>AI Assistant &amp; Voice Guidance</span>
            </div>
          </div>
        </div>

        {/* Center: Campus 3D Illustration Graphic (Matching Reference Image) */}
        <div className="relative z-10 my-6 flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-xl aspect-16/10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 group">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
              alt="Campus 3D View"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

            {/* Simulated 3D Building Badges (Matching Screenshot Pins) */}
            <div className="absolute top-8 left-10 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 animate-bounce [animation-duration:3s]">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Hostel
            </div>

            <div className="absolute top-16 left-36 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Cafeteria
            </div>

            <div className="absolute bottom-16 left-12 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              CSE Block
            </div>

            <div className="absolute top-20 right-28 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border-2 border-blue-500 text-xs font-bold text-slate-900 flex items-center gap-1.5 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Library
            </div>

            <div className="absolute bottom-12 right-24 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Auditorium
            </div>

            {/* Glowing animated path line overlay */}
            <div className="absolute bottom-20 left-28 right-36 h-1.5 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 rounded-full shadow-lg shadow-blue-500/80" />
          </div>
        </div>

        {/* Bottom Floating Glass Pill (Matching Screenshot) */}
        <div className="relative z-10 bg-white/80 backdrop-blur-md p-3.5 px-5 rounded-2xl shadow-md border border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-800">
              Navigate smarter, explore faster, make the most of your campus.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-2 rounded-full bg-blue-600" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form (40-45% width, Matching Screenshot) */}
      <div className="lg:w-5/12 flex flex-col justify-between p-6 md:p-10 lg:p-12 bg-white overflow-y-auto">
        {/* Top Bar: Theme switcher & Language selection */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition"
          >
            {isDarkMode ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <Globe size={15} className="text-slate-500" />
              <span>{language}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 top-10 mt-1 w-28 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-50 text-xs font-semibold">
                <button
                  onClick={() => {
                    setLanguage('English');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                    language === 'English' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('தமிழ்');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                    language === 'தமிழ்' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Central Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          {/* VIEW 1: SIGN IN */}
          {authMode === 'signin' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Sign in to continue to Campus Navigator AI
                </p>
              </div>

              {/* Primary Google Sign-In Button (Matching Screenshot) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs md:text-sm text-slate-700 shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition transform active:scale-[0.99] disabled:opacity-50"
              >
                {/* Official Colorful Google "G" SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider: or */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">or</span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Username/Email & Password Form */}
              <form onSubmit={handleCredentialSignIn} className="space-y-3.5">
                <div>
                  <div className="relative flex items-center">
                    <User size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="Username or Email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage('');
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Sign In Button (Matching Screenshot) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Create Account Link */}
              <div className="text-center mt-5 text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Create Account
                </button>
              </div>

              {/* Skip / Guest Browsing Link */}
              <div className="text-center mt-3">
                <button
                  onClick={onBrowseAsGuest}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition"
                >
                  Explore as Guest Student &rarr;
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: CREATE ACCOUNT / REGISTER */}
          {authMode === 'register' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Join Campus Navigator AI to explore your campus
                </p>
              </div>

              {/* Primary Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs md:text-sm text-slate-700 shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition transform active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">or</span>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative flex items-center">
                  <User size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Username (e.g. sridharan)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>

                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>

                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="text-center mt-5 text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage('');
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Reset Password
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Enter your registered email address and we&apos;ll send you a password recovery link
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage ? (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-3 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                  <p className="font-semibold">{successMessage}</p>
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setSuccessMessage('');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative flex items-center">
                    <Mail size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your registered email address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <span>{isLoading ? 'Sending Link...' : 'Send Recovery Link'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Back to <span className="text-blue-600 font-bold">Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom 3 Quick Feature Cards (Matching Screenshot) */}
        <div className="grid grid-cols-3 gap-2.5 pt-6 border-t border-slate-100 mt-6">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1.5">
              <Navigation size={16} />
            </div>
            <h4 className="font-bold text-[11px] text-slate-800">Get Directions</h4>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Find shortest routes anywhere
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-1.5">
              <Building size={16} />
            </div>
            <h4 className="font-bold text-[11px] text-slate-800">Explore Buildings</h4>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Discover all campus facilities
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
              <GraduationCap size={16} />
            </div>
            <h4 className="font-bold text-[11px] text-slate-800">AI Assistant</h4>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Ask questions and get help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
