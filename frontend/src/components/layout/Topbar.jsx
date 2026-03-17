import { Search, Sun, Moon, Menu } from 'lucide-react';
import useTheme  from '../../hooks/useTheme';

const Topbar = ({ leftContent, toggleMobileMenu }) => {
 const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-sm shrink-0 transition-colors duration-300">
        
      {/* Dynamic Left Content Zone with Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>
        {leftContent}
      </div>

      {/* Right Controls: Search & Theme Toggle */}
      <div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
        <div className="relative w-48 md:w-72 hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 sm:text-sm transition-colors"
            placeholder="Search for anything ..."
          />
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-all border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 flex items-center justify-center group"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Topbar;