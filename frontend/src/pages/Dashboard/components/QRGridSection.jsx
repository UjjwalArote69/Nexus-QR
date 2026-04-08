/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TypeCard = ({ type, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const color = type.color || '#64748b';

  return (
    <button
      onClick={() => onSelect && onSelect(type)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left transition-all duration-150 active:scale-[0.98]"
      style={{
        borderColor: hovered ? `${color}35` : undefined,
        backgroundColor: hovered ? `${color}06` : undefined,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 bg-slate-50 dark:bg-slate-800/60"
        style={hovered ? {
          backgroundColor: color,
          boxShadow: `0 4px 14px ${color}30`,
        } : undefined}
      >
        <type.icon
          className="w-5 h-5 text-slate-400 dark:text-slate-500 transition-colors duration-150"
          style={hovered ? { color: '#fff' } : undefined}
          strokeWidth={1.6}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {type.name}
        </p>
        <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">{type.desc}</p>
      </div>
    </button>
  );
};

const QRGridSection = ({ title, badge, items, onSelectType }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-10">
      <button
        type="button"
        className="w-full flex items-center gap-2.5 mb-5 group select-none text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {badge && (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">· {badge}</span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((type) => (
                <TypeCard key={type.name} type={type} onSelect={onSelectType} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRGridSection;
