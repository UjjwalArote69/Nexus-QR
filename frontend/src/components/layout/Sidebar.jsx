import React, { useState } from 'react';
import {
  QrCode, BarChart2, LayoutTemplate, CreditCard, User,
  HelpCircle, Phone, Settings, PanelLeftClose, PanelLeftOpen,
  PlusSquare, X, Home
} from 'lucide-react';

const Sidebar = ({ activeNav, setActiveNav, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNav = [
    { name: 'Home', icon: Home },
    { name: 'Create QR', icon: PlusSquare },
    { name: 'My QR Codes', icon: QrCode },
    { name: 'Statistics', icon: BarChart2 },
    { name: 'Templates', icon: LayoutTemplate },
    { name: 'Plans & Payments', icon: CreditCard },
    { name: 'User Profile', icon: User },
  ];

  const bottomNav = [
    { name: 'Help Center', icon: HelpCircle },
    { name: 'Contact', icon: Phone },
    { name: 'Settings', icon: Settings },
  ];

  const handleNavClick = (name) => {
    setActiveNav(name);
    setIsMobileMenuOpen(false); // Auto-close on mobile after selection
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-50 h-screen
          ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out
        `}
      >
        <div>
          {/* Header & Controls */}
          <div className={`h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 transition-all duration-300`}>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden md:block p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          {/* Main Nav */}
          <nav className="p-4 space-y-2">
            {mainNav.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                title={isCollapsed ? item.name : ""}
                className={`w-full flex items-center ${isCollapsed ? 'md:justify-center px-3 md:px-0' : 'space-x-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeNav === item.name
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${activeNav === item.name ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Nav */}
        <div className="p-4 space-y-2 mb-4">
          {bottomNav.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.name)} 
              title={isCollapsed ? item.name : ""}
              className={`w-full flex items-center ${isCollapsed ? 'md:justify-center px-3 md:px-0' : 'space-x-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === item.name
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeNav === item.name ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.name}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;