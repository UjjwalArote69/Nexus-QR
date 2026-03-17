/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QRGridSection = ({ title, badge, description, items, onSelectType }) => {
  // State to manage whether the grid is open or collapsed
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-12">
      {/* Section Header - Now a clickable toggle */}
      <div 
        className="mb-4 cursor-pointer group select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
            {/* The chevron rotates based on the isOpen state */}
            <ChevronRight 
              className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} 
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 ml-9">
          {description}
        </p>
      </div>

      {/* Grid - Animated Collapse with Framer Motion */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Added a little padding-top (pt-2) so the focus rings don't get cut off during animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-2">
              {items.map((type) => (
                <button
                  key={type.name}
                  onClick={() => onSelectType && onSelectType(type)}
                  className="flex items-start p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 text-left transition-all group"
                >
                  <div className="mr-4 mt-0.5">
                    <type.icon
                      className="w-6 h-6 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {type.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {type.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRGridSection;