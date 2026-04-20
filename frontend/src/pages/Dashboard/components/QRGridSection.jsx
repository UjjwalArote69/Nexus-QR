/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TypeCard = ({ type, isSelected, onSelect, onHover }) => {
  const color = type.color || '#3b82f6';

  return (
    <button
      onClick={() => onSelect && onSelect(type)}
      onMouseEnter={() => onHover && onHover(type)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`
        group relative flex items-center gap-5 px-5 py-5 rounded-2xl border-2 border-dashed text-left
        transition-all duration-200 active:scale-[0.98] hover:shadow-md hover:border-2 hover:border-gray-700 hover:border-solid
        ${isSelected
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-400 shadow-sm'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
        }
      `}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
        style={{
          backgroundColor: isSelected ? `${color}15` : `${color}10`,
          border: `1.5px solid ${isSelected ? color : `${color}30`}`,
        }}
      >
        <type.icon
          className="w-7 h-7 transition-colors duration-200"
          style={{ color }}
          strokeWidth={1.5}
        />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] font-semibold transition-colors ${
          isSelected
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
        }`}>
          {type.name}
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{type.desc}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        </div>
      )}
    </button>
  );
};

const QRGridSection = ({ title, badge, badgeColor = 'emerald', subtitle, items, selectedType, onSelectType, onHoverType }) => {
  const [isOpen, setIsOpen] = useState(true);

  const badgeColors = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="mb-8">
      {/* Section header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 mb-2 group select-none text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Checkmark circle */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <CheckCircle className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>

        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${badgeColors[badgeColor] || badgeColors.slate}`}>
            {badge}
          </span>
        )}

        <ChevronDown className={`w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
      </button>

      {subtitle && (
        <p className="text-sm text-slate-400 dark:text-slate-500 ml-11 mb-5">{subtitle}</p>
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((type) => (
                <TypeCard
                  key={type.name}
                  type={type}
                  isSelected={selectedType?.name === type.name}
                  onSelect={onSelectType}
                  onHover={onHoverType}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRGridSection;
