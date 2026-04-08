import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, ChevronRight, Sun, Moon, LogIn } from 'lucide-react';
import CreateQRView from './Dashboard/views/CreateQRView';
import useTheme from '../hooks/useTheme';
import useAuthStore from '../store/authStore';
import useQRStore from '../store/qrStore';
import BuilderContext from '../context/BuilderContext';

const PublicCreatePage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const resetStore = useQRStore((s) => s.resetStore);
  const navigate = useNavigate();

  // Mirror the builder state from Dashboard
  const [builderStep, setBuilderStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);

  const getBreadcrumb = () => {
    if (!selectedType) return null;
    return (
      <div className="flex items-center space-x-1 text-[13px] sm:text-sm">
        <button
          onClick={() => { resetStore(); setBuilderStep(1); setSelectedType(null); }}
          className={`flex items-center px-2 sm:px-3 py-1.5 rounded-md font-medium transition-all ${builderStep === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <span className="hidden sm:inline mr-1">1.</span> Type
        </button>
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
        <button
          onClick={() => selectedType && setBuilderStep(2)}
          disabled={!selectedType}
          className={`flex items-center px-2 sm:px-3 py-1.5 rounded-md font-medium transition-all ${builderStep === 2 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : selectedType ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' : 'text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed'}`}
        >
          <span className="hidden sm:inline mr-1">2.</span> Content
        </button>
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
        <button
          onClick={() => selectedType && setBuilderStep(3)}
          disabled={!selectedType}
          className={`flex items-center px-2 sm:px-3 py-1.5 rounded-md font-medium transition-all ${builderStep === 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : selectedType ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' : 'text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed'}`}
        >
          <span className="hidden sm:inline mr-1">3.</span> Design
        </button>
      </div>
    );
  };

  return (
    <BuilderContext.Provider value={{ builderStep, setBuilderStep, selectedType, setSelectedType }}>
      <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-950/80 backdrop-blur-sm shrink-0 transition-colors duration-300">
          {/* Left: Logo + Breadcrumb */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white transition-colors">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white hidden sm:inline transition-colors">
                Klink
              </span>
            </Link>

            {/* Breadcrumb when a type is selected */}
            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
              {selectedType ? getBreadcrumb() : (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Create QR Code</span>
              )}
            </div>
          </div>

          {/* Right: Theme toggle + Auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
              >
                Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile breadcrumb (below header when type is selected) */}
        {selectedType && (
          <div className="sm:hidden px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {getBreadcrumb()}
          </div>
        )}

        {/* Main Content: CreateQRView fills the rest */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CreateQRView />
        </main>
      </div>
    </BuilderContext.Provider>
  );
};

export default PublicCreatePage;