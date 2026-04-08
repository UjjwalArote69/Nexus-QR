/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ChevronRight, Sun, Moon, LogIn, LayoutDashboard,
  Sparkles, Zap, Shield, BarChart3, Menu, X, ArrowRight, Globe,
  Check,
} from 'lucide-react';
import CreateQRView from './Dashboard/views/CreateQRView';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import BuilderContext from '../context/BuilderContext';
import usePageTitle from '../hooks/usePageTitle';

// --- PERFORMANCE OPTIMIZATION ---
const BREADCRUMB_STEPS = [
  { num: 1, label: 'Type', key: 1 },
  { num: 2, label: 'Content', key: 2 },
  { num: 3, label: 'Design', key: 3 },
];

const HomePage = () => {
  usePageTitle('QR Code Generator');
  const { isDark, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Builder state (shared via BuilderContext)
  const [builderStep, setBuilderStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStepClick = (stepKey) => {
    if (stepKey === 1) { 
      setBuilderStep(1); 
      setSelectedType(null); 
    }
    else if (selectedType) {
      setBuilderStep(stepKey);
    }
  };

  const getBreadcrumb = () => {
    if (!selectedType) return null;
    
    return (
      <nav className="flex items-center gap-1" aria-label="Breadcrumb">
        {BREADCRUMB_STEPS.map((step, i) => {
          const isCurrent = builderStep === step.key;
          const isCompleted = builderStep > step.key;
          const isDisabled = step.key > 1 && !selectedType;

          // Monochromatic breadcrumb styling
          const buttonClasses = `flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
            isCurrent
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : isCompleted
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                : selectedType
                  ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`;

          const iconClasses = `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            isCurrent
              ? 'bg-white/20 dark:bg-black/10 text-current'
              : isCompleted
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`;

          return (
            <React.Fragment key={step.key}>
              {i > 0 && (
                <div 
                  aria-hidden="true"
                  className={`w-4 sm:w-6 h-px mx-0.5 transition-colors duration-300 ${
                    isCompleted ? 'bg-slate-400 dark:bg-slate-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} 
                />
              )}
              <button
                onClick={() => handleStepClick(step.key)}
                disabled={isDisabled}
                aria-current={isCurrent ? 'step' : undefined}
                className={buttonClasses}
              >
                <span className={iconClasses}>
                  {isCompleted ? <Check className="w-3 h-3" /> : step.num}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  return (
    <BuilderContext.Provider value={{ builderStep, setBuilderStep, selectedType, setSelectedType }}>
      <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">

        {/* ─────────────────────── NAVBAR ─────────────────────── */}
        <header className="h-14 sm:h-16 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shrink-0 transition-colors duration-300 z-40 relative">

          {/* Left zone */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Klink Home">
              <div className="relative">
                <div className="bg-slate-900 dark:bg-white p-1.5 rounded-lg text-white dark:text-slate-900 transition-colors group-hover:scale-105 duration-200">
                  <QrCode className="w-5 h-5" />
                </div>
                {/* Monochrome indicator dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full border-2 border-white dark:border-slate-950 transition-colors" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white hidden sm:inline transition-colors">
                Klink
              </span>
            </Link>

            {/* Desktop: Breadcrumb OR nav links */}
            <div className="hidden md:flex items-center ml-1 border-l border-slate-200 dark:border-slate-800 pl-4">
              <AnimatePresence mode="wait">
                {selectedType ? (
                  <motion.div
                    key="breadcrumb"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getBreadcrumb()}
                  </motion.div>
                ) : (
                  <motion.div
                    key="navlinks"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    <Link
                      to="/about"
                      className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      Platform
                    </Link>
                    <Link
                      to="/about#pricing"
                      className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      Pricing
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right zone */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center justify-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {user ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </motion.button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </header>

        {/* ─────────────────── MOBILE MENU ─────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden z-30 relative"
            >
              <nav className="px-4 py-3 space-y-1" aria-label="Mobile Navigation">
                {selectedType && (
                  <div className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                    {getBreadcrumb()}
                  </div>
                )}
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  Platform
                </Link>
                <Link
                  to="/about#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  Pricing
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────────── HERO BANNER (type-selection only) ─────────────── */}
        <AnimatePresence>
          {!selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="shrink-0 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500"
            >
              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="text-center">
                  {/* Monochromatic Trust badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4"
                  >
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-slate-400 animate-pulse" />
                      Free — No signup
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-semibold">
                      <Zap className="w-3 h-3" aria-hidden="true" />
                      Dynamic &amp; trackable
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-semibold">
                      <Shield className="w-3 h-3" aria-hidden="true" />
                      Enterprise ready
                    </span>
                  </motion.div>

                  {/* Monochromatic Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2.5 tracking-tight leading-tight transition-colors"
                  >
                    Create your QR code{' '}
                    <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4">
                      in seconds
                    </span>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto transition-colors"
                  >
                    Pick a type below. Update content anytime, track every scan, export in any format.
                  </motion.p>

                  {/* Feature checklist */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-3.5 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" aria-hidden="true" /> Real-time analytics
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" aria-hidden="true" /> Custom branding
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" aria-hidden="true" /> Export PNG, SVG, PDF
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" aria-hidden="true" /> Unlimited scans
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Monochromatic Bottom gradient edge */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none transition-colors duration-300" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────── MOBILE BREADCRUMB (when type selected) ─────────── */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 overflow-hidden"
            >
              <div className="px-4 py-2.5">
                {getBreadcrumb()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────────── MAIN CONTENT: QR BUILDER ─────────────── */}
        {/* WIDTH FIX: Added `max-w-6xl mx-auto w-full` to prevent horizontal stretching */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden max-w-6xl mx-auto w-full">
          <CreateQRView />
        </main>

        {/* ─────────────── FOOTER (type-selection only) ─────────────── */}
        <AnimatePresence>
          {!selectedType && (
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 transition-colors duration-300"
            >
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3 h-3" aria-hidden="true" />
                  &copy; {new Date().getFullYear()} Klink
                </span>
                <nav className="flex items-center gap-4" aria-label="Footer Navigation">
                  <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Platform
                  </Link>
                  <Link to="/about#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    Pricing
                  </Link>
                  {!user && (
                    <Link to="/register" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                      Create Account
                    </Link>
                  )}
                  {user && (
                    <button onClick={() => navigate('/dashboard')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                      Dashboard
                    </button>
                  )}
                </nav>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>

      </div>
    </BuilderContext.Provider>
  );
};

export default HomePage;