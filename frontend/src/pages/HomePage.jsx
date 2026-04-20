/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ChevronRight, Sun, Moon, LogIn, LayoutDashboard,
  Zap, Shield, Menu, X, Check,
} from 'lucide-react';
import CreateQRView from './Dashboard/views/CreateQRView';
import QRGridSection from './Dashboard/components/QRGridSection';
import PhoneMockup from './Dashboard/components/PhoneMockup';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import BuilderContext from '../context/BuilderContext';
import usePageTitle from '../hooks/usePageTitle';
import { dynamicTypes, staticTypes } from '../data/qrTypes';

// Breadcrumb step config
const STEPS = [
  { num: 1, label: 'Type', key: 1 },
  { num: 2, label: 'Content', key: 2 },
  { num: 3, label: 'Design', key: 3 },
];

const HomePage = () => {
  usePageTitle('QR Code Generator');
  const { isDark, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [builderStep, setBuilderStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isFormMode = !!selectedType;

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setBuilderStep(2);
    setHoveredType(null);
  };

  const handleStepClick = (stepKey) => {
    if (stepKey === 1) { setBuilderStep(1); setSelectedType(null); }
    else if (selectedType) setBuilderStep(stepKey);
  };

  // ── Breadcrumb (form mode only) ──
  const Breadcrumb = () => (
    <nav className="flex items-center gap-1" aria-label="Builder steps">
      {STEPS.map((step, i) => {
        const isCurrent = builderStep === step.key;
        const isDone = builderStep > step.key;
        return (
          <React.Fragment key={step.key}>
            {i > 0 && <div className={`w-4 sm:w-6 h-px mx-0.5 ${isDone ? 'bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            <button
              onClick={() => handleStepClick(step.key)}
              disabled={step.key > 1 && !selectedType}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isCurrent
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : isDone
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    : selectedType
                      ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isCurrent ? 'bg-white/20 dark:bg-black/10' : isDone ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : step.num}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );

  return (
    <BuilderContext.Provider value={{ builderStep, setBuilderStep, selectedType, setSelectedType }}>
      <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">

        {/* ─── NAVBAR ─── */}
        <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shrink-0 z-40">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-slate-900 dark:bg-white p-1.5 rounded-lg text-white dark:text-slate-900 group-hover:scale-105 transition-transform">
                <QrCode className="w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white hidden sm:inline">Klink</span>
            </Link>

            {/* Breadcrumb or nav links */}
            <div className="hidden md:flex items-center ml-1 border-l border-slate-200 dark:border-slate-800 pl-4">
              {isFormMode ? (
                <Breadcrumb />
              ) : (
                <Link to="/about" className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Platform
                </Link>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile breadcrumb */}
        {isFormMode && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 shrink-0">
            <Breadcrumb />
          </div>
        )}

        {/* ─── CONTENT ─── */}
        {!isFormMode ? (
          /* ═══ MODE 1: Type Selection — full page scroll ═══ */
          <div className="flex-1 overflow-y-auto">

            {/* Hero */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/50">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  {[
                    { icon: null, label: 'Free — No signup', dot: true },
                    { icon: Zap, label: 'Dynamic & trackable' },
                    { icon: Shield, label: 'Enterprise ready', hideOnMobile: true },
                  ].map(({ icon: Icon, label, dot, hideOnMobile }) => (
                    <span key={label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold ${hideOnMobile ? 'hidden sm:inline-flex' : ''}`}>
                      {dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {Icon && <Icon className="w-3 h-3" />}
                      {label}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                  Create your QR code
                  <br className="hidden sm:block" />
                  <span className="text-slate-400 dark:text-slate-500"> in seconds</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-5">
                  Pick a type below. Update content anytime, track every scan, export in any format.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {['Real-time analytics', 'Custom branding', 'Export PNG, SVG, PDF', 'Unlimited scans'].map((f, i) => (
                    <span key={f} className={`flex items-center gap-1.5 ${i === 3 ? 'hidden sm:flex' : ''}`}>
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Type grid + phone mockup */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <div className="flex gap-8 items-start">

                {/* Left: Grid */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                    Select a QR type
                  </h2>

                  <QRGridSection
                    title="Dynamic QR"
                    badge="with tracking"
                    badgeColor="emerald"
                    subtitle="Update content in real time, without changing your code"
                    items={dynamicTypes}
                    selectedType={hoveredType}
                    onSelectType={handleTypeSelect}
                    onHoverType={setHoveredType}
                  />
                  <QRGridSection
                    title="Static QR"
                    badge="fixed content"
                    badgeColor="slate"
                    subtitle="Content is embedded directly — cannot be changed after printing"
                    items={staticTypes}
                    selectedType={hoveredType}
                    onSelectType={handleTypeSelect}
                    onHoverType={setHoveredType}
                  />
                </div>

                {/* Right: Phone mockup (desktop only) */}
                <div className="hidden lg:block w-[320px] shrink-0 sticky top-8">
                  <PhoneMockup activeType={hoveredType} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3">
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3 h-3" /> &copy; {new Date().getFullYear()} Klink
                </span>
                <nav className="flex items-center gap-4">
                  <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Platform</Link>
                  {!user && <Link to="/register" className="hover:text-slate-900 dark:hover:text-white transition-colors">Create Account</Link>}
                  {user && <button onClick={() => navigate('/dashboard')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</button>}
                </nav>
              </div>
            </footer>
          </div>
        ) : (
          /* ═══ MODE 2: Builder — full viewport takeover ═══ */
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <CreateQRView />
          </main>
        )}

      </div>
    </BuilderContext.Provider>
  );
};

export default HomePage;
