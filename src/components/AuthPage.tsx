import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Compass,
  Users,
  Building,
  GraduationCap,
} from 'lucide-react';
import { UserSession } from '../types/campus';
import { signInWithGoogle, signInWithCredentials, registerUser, sendPasswordRecovery } from '../services/firebaseAuth';

interface AuthPageProps {
  onLoginSuccess: (user: UserSession) => void;
  onBrowseAsGuest: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// Complete bilingual dictionaries for English and Tamil
const TRANSLATIONS = {
  English: {
    welcome: 'Welcome Back',
    subtitle: 'Sign in to continue to Campus Navigator AI',
    googleSignIn: 'Continue with Google',
    or: 'or',
    usernameOrEmail: 'Username or Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot Password?',
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    noAccount: "Don't have an account?",
    createAccount: 'Create Account',
    guestExplore: 'Explore as Guest Student →',
    adminLogin: 'Admin Login',
    createHeading: 'Create Account',
    createSubtitle: 'Join Campus Navigator AI to explore your campus',
    username: 'Username (e.g. sridharan)',
    email: 'Email address',
    passwordPlaceholder: 'Password (min 6 characters)',
    confirmPassword: 'Confirm password',
    creatingAccount: 'Creating Account...',
    haveAccount: 'Already have an account?',
    resetHeading: 'Reset Password',
    resetSubtitle: 'Enter your registered email address and we will send you a recovery link',
    sendReset: 'Send Recovery Link',
    sendingLink: 'Sending Link...',
    backToSignIn: 'Back to Sign In',
    returnToSignIn: 'Return to Sign In',
    tagline: 'Campus Navigator AI',
    badge3D: 'Interactive 3D Campus Map',
    badgePath: 'Shortest Path Navigation',
    badgeAi: 'AI Assistant & Voice Guidance',
    photoBadge: 'Verified Campus Blueprint & Live Navigation',
    quote: 'Navigate smarter, explore faster, make the most of your campus.',
    cardGetDirections: 'Get Directions',
    cardGetDirectionsSub: 'Find shortest routes anywhere',
    cardExplore: 'Explore Buildings',
    cardExploreSub: 'Discover all campus facilities',
    cardAi: 'AI Assistant',
    cardAiSub: 'Ask questions and get help',
    typing: [
      'Find your way effortlessly across campus with live Google Maps navigation.',
      'Discover classrooms, laboratories, libraries & auditoriums in seconds.',
      'Fastest walking routes powered by Dijkstra algorithm & AI.',
      'Turn-by-turn walking guidance, live GPS positioning & step-free paths.',
    ],
  },
  தமிழ்: {
    welcome: 'மீண்டும் வருக',
    subtitle: 'Campus Navigator AI-ல் தொடர உள்நுழைக',
    googleSignIn: 'கூகுள் மூலம் தொடரவும்',
    or: 'அல்லது',
    usernameOrEmail: 'பயனர் பெயர் அல்லது மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    rememberMe: 'என்னை நினைவில் கொள்க',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    signIn: 'உள்நுழைக',
    signingIn: 'உள்நுழைகிறது...',
    noAccount: 'கணக்கு இல்லையா?',
    createAccount: 'புதிய கணக்கை உருவாக்குக',
    guestExplore: 'விருந்தினர் மாணவராக தொடரவும் →',
    adminLogin: 'நிர்வாகி உள்நுழைவு',
    createHeading: 'கணக்கு உருவாக்குக',
    createSubtitle: 'வளாகத்தை ஆராய புதிய கணக்கைப் பதிவு செய்யவும்',
    username: 'பயனர் பெயர்',
    email: 'மின்னஞ்சல் முகவரி',
    passwordPlaceholder: 'கடவுச்சொல் (குறைந்தது 6 எழுத்துக்கள்)',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்துக',
    creatingAccount: 'கணக்கு உருவாக்கப்படுகிறது...',
    haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    resetHeading: 'கடவுச்சொல்லை மீட்டமைக்க',
    resetSubtitle: 'மீட்டமைப்பு இணைப்பைப் பெற உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சலை உள்ளிடவும்',
    sendReset: 'மீட்டமைப்பு இணைப்பை அனுப்புக',
    sendingLink: 'இணைப்பு அனுப்பப்படுகிறது...',
    backToSignIn: 'மீண்டும் உள்நுழைவுக்குச் செல்லவும்',
    returnToSignIn: 'உள்நுழைவுக்குத் திரும்பு',
    tagline: 'Campus Navigator AI',
    badge3D: 'ஊடாடும் 3D வளாக வரைபடம்',
    badgePath: 'குறுகிய வழித்தட வழிகாட்டல்',
    badgeAi: 'AI உதவி மற்றும் குரல் வழிகாட்டல்',
    photoBadge: 'சரிபார்க்கப்பட்ட வளாக ப்ளூபிரிண்ட் & நேரடி வரைபடம்',
    quote: 'புத்திசாலித்தனமாக வழியறிந்து உங்கள் வளாகத்தை எளிதாக ஆராயுங்கள்.',
    cardGetDirections: 'வழிகளைப் பெறுக',
    cardGetDirectionsSub: 'குறுகிய வழிகளைக் கண்டறியவும்',
    cardExplore: 'கட்டிடங்களை ஆராய்க',
    cardExploreSub: 'அனைத்து வசதிகளையும் காண்க',
    cardAi: 'AI உதவியாளர்',
    cardAiSub: 'கேள்விகளைக் கேட்டு உதவி பெறுக',
    typing: [
      'Google Maps வழிகாட்டலுடன் வளாகத்தில் எளிதாக வழியறியுங்கள்.',
      'வகுப்பறைகள், ஆய்வகங்கள், நூலகங்கள் மற்றும் அரங்குகளை நொடிகளில் கண்டறியுங்கள்.',
      'Dijkstra AI மூலம் கணக்கிடப்பட்ட மிக வேகமான நடைபாதை வழித்தடங்கள்.',
      'நேரடி திருப்ப வழிகாட்டல், லைவ் ஜிபிஎஸ் மற்றும் படிக்கட்டுகளற்ற பாதைகள்.',
    ],
  },
};

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

  // Active translation dictionary
  const T = TRANSLATIONS[language];

  // Dynamic typing effect for subtitle with active language support
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset typed text when language changes
  useEffect(() => {
    setTypedText('');
    setPhraseIndex(0);
    setIsDeleting(false);
  }, [language]);

  useEffect(() => {
    const phrases = T.typing;
    const currentPhrase = phrases[phraseIndex % phrases.length];
    const typingSpeed = isDeleting ? 25 : 55;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentPhrase.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIndex, language, T.typing]);

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
      setErrorMessage(language === 'தமிழ்' ? 'பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter both username/email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      // Dedicated Administrator Verification (admin / admin@123)
      if (usernameOrEmail.trim().toLowerCase() === 'admin' && password === 'admin@123') {
        onLoginSuccess({
          id: 'USR-ADMIN-01',
          name: 'Campus Administrator',
          email: 'admin@campus.edu',
          role: 'ADMIN',
          photoUrl: undefined,
          isGoogleAuth: false,
          department: 'Campus Cartography & Spatial Operations',
        });
        return;
      }

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
        setErrorMessage(language === 'தமிழ்' ? 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல். தயவுசெய்து சரிபார்க்கவும்.' : 'Invalid username/email or password. Please check your credentials.');
      } else {
        setErrorMessage(err.message || (language === 'தமிழ்' ? 'உள்நுழைவு தோல்வியடைந்தது.' : 'Authentication failed. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create Account / Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername.trim() || !registerEmail.trim() || !password) {
      setErrorMessage(language === 'தமிழ்' ? 'அனைத்து விவரங்களையும் நிரப்பவும்.' : 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(language === 'தமிழ்' ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(language === 'தமிழ்' ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்.' : 'Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const firebaseUser = await registerUser(registerEmail, password, registerUsername);
      if (firebaseUser) {
        onLoginSuccess({
          id: firebaseUser.uid,
          name: registerUsername,
          email: registerEmail,
          role: 'STUDENT',
          photoUrl: undefined,
          isGoogleAuth: false,
          department: 'Academic Campus',
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage(language === 'தமிழ்' ? 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.' : 'This email address is already registered. Please sign in instead.');
      } else {
        setErrorMessage(err.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage(language === 'தமிழ்' ? 'உங்கள் மின்னஞ்சலை உள்ளிடவும்.' : 'Please enter your registered email address.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      await sendPasswordRecovery(forgotEmail);
      setSuccessMessage(language === 'தமிழ்' ? `${forgotEmail} முகவரிக்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது.` : `A password recovery link has been sent to ${forgotEmail}. Please check your inbox.`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row antialiased transition-colors duration-300 ${
        isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* LEFT SIDE: Campus Graphic & Presentation (55-60% width) */}
      <div
        className={`lg:w-7/12 relative flex flex-col justify-between p-6 md:p-10 lg:p-12 overflow-hidden transition-colors duration-300 ${
          isDarkMode
            ? 'bg-slate-950 border-r border-slate-800'
            : 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100/60 border-r border-slate-200/80'
        }`}
      >
        {/* Background Radial Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Navigation size={26} className="transform -rotate-45" fill="white" />
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Campus <span className="text-blue-500">Navigator</span> AI
              </h1>
              <div className="h-10 mt-1 flex items-center">
                <p className={`text-xs md:text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {typedText}
                  <span className="inline-block w-0.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
                </p>
              </div>
            </div>
          </div>

          {/* 3 Top Feature Badges in a Row */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <div
              className={`px-3.5 py-2 rounded-xl shadow-xs border flex items-center gap-2 text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 text-slate-100'
                  : 'bg-white/95 border-white/60 text-slate-800'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                <MapIcon size={14} />
              </div>
              <span>{T.badge3D}</span>
            </div>

            <div
              className={`px-3.5 py-2 rounded-xl shadow-xs border flex items-center gap-2 text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 text-slate-100'
                  : 'bg-white/95 border-white/60 text-slate-800'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <Compass size={14} />
              </div>
              <span>{T.badgePath}</span>
            </div>

            <div
              className={`px-3.5 py-2 rounded-xl shadow-xs border flex items-center gap-2 text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 text-slate-100'
                  : 'bg-white/95 border-white/60 text-slate-800'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <span>{T.badgeAi}</span>
            </div>
          </div>
        </div>

        {/* Center: High-Resolution Campus Graphic */}
        <div className="relative z-10 my-6 flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-xl aspect-16/10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 group">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
              alt="Campus 3D View"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            {/* Clean, Non-Faded Verified Status Pill */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-white flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{T.photoBadge}</span>
            </div>
          </div>
        </div>

        {/* Bottom Floating Glass Pill */}
        <div
          className={`relative z-10 p-3.5 px-5 rounded-2xl shadow-md border flex items-center justify-between transition-colors ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-200'
              : 'bg-white/80 border-white/60 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <p className="text-xs md:text-sm font-semibold">{T.quote}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-2 rounded-full bg-blue-600" />
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form (40-45% width) */}
      <div
        className={`lg:w-5/12 flex flex-col justify-between p-6 md:p-10 lg:p-12 overflow-y-auto transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        }`}
      >
        {/* Top Controls: Admin auto-fill, Dark mode, Language selection */}
        <div className="flex items-center justify-end gap-2.5 mb-6">
          <button
            onClick={() => {
              setUsernameOrEmail('admin');
              setPassword('admin@123');
              setAuthMode('signin');
            }}
            title="Auto-fill Administrator Credentials (admin / admin@123)"
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 border border-slate-700"
          >
            <ShieldCheck size={14} className="text-amber-400" />
            <span>{T.adminLogin}</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* High-Contrast Language Dropdown (NO FADED TEXT) */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                  : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Globe size={15} className="text-blue-500" />
              <span>{language}</span>
              <ChevronDown size={14} className="opacity-70" />
            </button>

            {isLangDropdownOpen && (
              <div
                className={`absolute right-0 top-10 mt-1 w-32 rounded-xl shadow-2xl border p-1 z-50 text-xs font-bold ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <button
                  onClick={() => {
                    setLanguage('English');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-bold transition flex items-center justify-between ${
                    language === 'English'
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'text-slate-100 hover:bg-slate-700'
                      : 'text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>English</span>
                  {language === 'English' && <CheckCircle2 size={13} />}
                </button>
                <button
                  onClick={() => {
                    setLanguage('தமிழ்');
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-bold transition flex items-center justify-between ${
                    language === 'தமிழ்'
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'text-slate-100 hover:bg-slate-700'
                      : 'text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>தமிழ்</span>
                  {language === 'தமிழ்' && <CheckCircle2 size={13} />}
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
                <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {T.welcome}
                </h2>
                <p className={`text-xs md:text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {T.subtitle}
                </p>
              </div>

              {/* Primary Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full py-3 px-4 border rounded-2xl font-bold text-xs md:text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition transform active:scale-[0.99] disabled:opacity-50 ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{T.googleSignIn}</span>
              </button>

              {/* Divider: or */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                </div>
                <span
                  className={`relative px-3 text-xs font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'
                  }`}
                >
                  {T.or}
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 font-semibold flex items-start gap-2">
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
                      placeholder={T.usernameOrEmail}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-750'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                      }`}
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
                      placeholder={T.password}
                      className={`w-full border rounded-xl pl-10 pr-11 py-2.5 text-xs md:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-750'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-blue-500 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className={`flex items-center gap-2 cursor-pointer select-none font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-400"
                    />
                    <span>{T.rememberMe}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage('');
                    }}
                    className="text-blue-500 font-bold hover:underline"
                  >
                    {T.forgotPassword}
                  </button>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? T.signingIn : T.signIn}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Create Account Link */}
              <div className={`text-center mt-5 text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {T.noAccount}{' '}
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  className="text-blue-500 font-bold hover:underline"
                >
                  {T.createAccount}
                </button>
              </div>

              {/* Skip / Guest Browsing Link */}
              <div className="text-center mt-3">
                <button
                  onClick={onBrowseAsGuest}
                  className={`text-xs font-bold transition hover:text-blue-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {T.guestExplore}
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: CREATE ACCOUNT / REGISTER */}
          {authMode === 'register' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {T.createHeading}
                </h2>
                <p className={`text-xs md:text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {T.createSubtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full py-3 px-4 border rounded-2xl font-bold text-xs md:text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition transform active:scale-[0.99] disabled:opacity-50 ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{T.googleSignIn}</span>
              </button>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                </div>
                <span className={`relative px-3 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}`}>
                  {T.or}
                </span>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 font-semibold flex items-start gap-2">
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
                    placeholder={T.username}
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-750'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                    required
                  />
                </div>

                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder={T.email}
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-750'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                    required
                  />
                </div>

                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={T.passwordPlaceholder}
                    className={`w-full border rounded-xl pl-10 pr-11 py-2.5 text-xs md:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-750'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-blue-500 transition"
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
                    placeholder={T.confirmPassword}
                    className={`w-full border rounded-xl pl-10 pr-11 py-2.5 text-xs md:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-750'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-blue-500 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? T.creatingAccount : T.createAccount}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className={`text-center mt-5 text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {T.haveAccount}{' '}
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage('');
                  }}
                  className="text-blue-500 font-bold hover:underline"
                >
                  {T.signIn}
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {T.resetHeading}
                </h2>
                <p className={`text-xs md:text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {T.resetSubtitle}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage ? (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 space-y-3 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                  <p className="font-bold">{successMessage}</p>
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setSuccessMessage('');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                  >
                    {T.returnToSignIn}
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
                      placeholder={T.email}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-750'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                      }`}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <span>{isLoading ? T.sendingLink : T.sendReset}</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                      }}
                      className="text-xs font-bold text-blue-500 hover:underline"
                    >
                      {T.backToSignIn}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom 3 Quick Feature Cards (NO FADED TEXT) */}
        <div className={`grid grid-cols-3 gap-2.5 pt-6 border-t mt-6 transition-colors ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div
            className={`p-3 rounded-2xl border text-center transition-colors ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center mx-auto mb-1.5 font-bold">
              <Navigation size={16} />
            </div>
            <h4 className={`font-bold text-[11px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{T.cardGetDirections}</h4>
            <p className={`text-[10px] leading-tight mt-0.5 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {T.cardGetDirectionsSub}
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center transition-colors ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center mx-auto mb-1.5 font-bold">
              <Building size={16} />
            </div>
            <h4 className={`font-bold text-[11px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{T.cardExplore}</h4>
            <p className={`text-[10px] leading-tight mt-0.5 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {T.cardExploreSub}
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center transition-colors ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-1.5 font-bold">
              <GraduationCap size={16} />
            </div>
            <h4 className={`font-bold text-[11px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{T.cardAi}</h4>
            <p className={`text-[10px] leading-tight mt-0.5 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {T.cardAiSub}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
