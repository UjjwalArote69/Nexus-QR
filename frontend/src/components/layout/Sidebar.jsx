import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../../store/authStore';
import {
  QrCode, BarChart2, LayoutTemplate,
  HelpCircle, Phone, Settings, PanelLeftClose, PanelLeftOpen,
  Plus, X, Home, LogOut, FolderOpen,
} from 'lucide-react';

// Tooltip that appears on hover when sidebar is collapsed
const Tooltip = ({ children, label, show }) => {
  if (!show) return children;
  return (
    <div className="relative group/tip">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-[60]">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900 dark:border-r-white" />
      </div>
    </div>
  );
};

// Keyboard shortcut badge
const Kbd = ({ children }) => (
  <kbd className="ml-auto text-[10px] font-medium text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-px leading-none select-none">
    {children}
  </kbd>
);

const Sidebar = ({ activeNav, setActiveNav, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Persist collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut: Ctrl+/
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapse]);

  const mainNav = [
    { name: 'Home', icon: Home },
    { name: 'My QR Codes', icon: FolderOpen },
    { name: 'Statistics', icon: BarChart2 },
    { name: 'Templates', icon: LayoutTemplate },
  ];

  const bottomNav = [
    { name: 'Help Center', icon: HelpCircle },
    { name: 'Contact', icon: Phone },
    { name: 'Settings', icon: Settings },
  ];

  const handleNavClick = (name) => {
    setActiveNav(name);
    setIsMobileMenuOpen(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const NavItem = ({ item }) => {
    const isActive = activeNav === item.name;
    return (
      <Tooltip label={item.name} show={isCollapsed}>
        <button
          onClick={() => handleNavClick(item.name)}
          className={`
            group relative w-full flex items-center gap-3 rounded-lg text-[13px] font-medium
            transition-all duration-150 outline-none
            ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
            ${isActive
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }
          `}
        >
          <item.icon
            className={`w-[18px] h-[18px] shrink-0 ${
              isActive
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            }`}
            strokeWidth={isActive ? 2 : 1.7}
          />
          {!isCollapsed && <span className="truncate">{item.name}</span>}
        </button>
      </Tooltip>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50 h-screen
          ${isCollapsed ? 'md:w-[68px]' : 'md:w-[248px]'} w-[280px]
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          bg-white dark:bg-slate-950
          border-r border-slate-200 dark:border-slate-800
          flex flex-col shrink-0 overflow-hidden
          transition-all duration-200
        `}
      >
        {/* ── Header ── */}
        <div className={`h-14 flex items-center shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} border-b border-slate-200 dark:border-slate-800`}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
              <QrCode className="w-3.5 h-3.5 text-white dark:text-slate-900" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Klink</span>
            )}
          </div>

          {/* Mobile close */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Collapse sidebar (Ctrl+/)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Create button ── */}
        <div className={`shrink-0 ${isCollapsed ? 'px-2.5 pt-3 pb-1' : 'px-3 pt-3 pb-1'}`}>
          <Tooltip label="New QR Code" show={isCollapsed}>
            <button
              onClick={() => handleNavClick('Create QR')}
              className={`
                group w-full flex items-center gap-2.5 rounded-lg font-medium
                transition-all duration-150 active:scale-[0.97] border
                ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
                ${activeNav === 'Create QR'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                }
              `}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                activeNav === 'Create QR'
                  ? 'bg-white/20 dark:bg-slate-900/20'
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
              }`}>
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              {!isCollapsed && <span className="text-[13px]">New QR Code</span>}
            </button>
          </Tooltip>
        </div>

        {/* ── Expand button (collapsed state) ── */}
        {isCollapsed && (
          <div className="hidden md:flex justify-center shrink-0 pt-2 pb-1">
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Expand sidebar (Ctrl+/)"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Main nav ── */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2.5' : 'px-3'} pt-3 space-y-0.5`}>
          {!isCollapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 select-none">
              Navigation
            </p>
          )}
          {mainNav.map((item) => <NavItem key={item.name} item={item} />)}
        </nav>

        {/* ── Bottom section ── */}
        <div className={`shrink-0 ${isCollapsed ? 'px-2.5' : 'px-3'} pb-3`}>
          {/* Divider */}
          <div className="mb-2 border-t border-slate-200 dark:border-slate-800" />

          {!isCollapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 select-none">
              Support
            </p>
          )}
          <div className="space-y-0.5">
            {bottomNav.map((item) => <NavItem key={item.name} item={item} />)}
          </div>

          {/* Collapse shortcut hint (expanded only) */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-full items-center gap-2.5 px-3 py-2 mt-3 rounded-lg text-[12px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
              <span>Collapse</span>
              <Kbd>Ctrl /</Kbd>
            </button>
          )}

          {/* ── User section ── */}
          <div className={`mt-2 pt-2 border-t border-slate-200 dark:border-slate-800`}>
            <Tooltip label={user?.name || 'Profile'} show={isCollapsed}>
              <button
                onClick={() => handleNavClick('User Profile')}
                className={`
                  w-full flex items-center gap-2.5 rounded-lg transition-colors duration-150
                  ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
                  ${activeNav === 'User Profile'
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-none">{initials}</span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-medium text-slate-900 dark:text-white truncate leading-tight">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">{user?.email || ''}</p>
                  </div>
                )}
              </button>
            </Tooltip>

            <Tooltip label="Sign out" show={isCollapsed}>
              <button
                onClick={() => { logout(); window.location.href = '/login'; }}
                className={`
                  w-full flex items-center gap-2.5 rounded-lg text-[12px] font-medium
                  text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150
                  ${isCollapsed ? 'justify-center p-2.5 mt-0.5' : 'px-3 py-1.5 mt-0.5'}
                `}
              >
                <LogOut className="w-4 h-4" strokeWidth={1.7} />
                {!isCollapsed && <span>Sign out</span>}
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
