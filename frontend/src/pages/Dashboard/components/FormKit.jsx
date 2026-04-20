/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, AlertCircle, Palette, Settings2, Check, Loader2 } from 'lucide-react';
import { BuilderContext } from '../Dashboard';
import useQRStore from '../../../store/qrStore';
import TemplatePicker from './TemplatePicker';

// ─── Accent color lookup (Tailwind needs full class strings at build time) ───
const accentStyles = {
  blue: {
    sectionOpen: 'border-blue-400/50 dark:border-blue-500/30',
    iconActive: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    chipActive: 'border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    focusRing: 'focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30',
  },
  emerald: {
    sectionOpen: 'border-emerald-400/50 dark:border-emerald-500/30',
    iconActive: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    chipActive: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    focusRing: 'focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30',
  },
  red: {
    sectionOpen: 'border-red-400/50 dark:border-red-500/30',
    iconActive: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    btnBg: 'bg-red-600 hover:bg-red-700',
    chipActive: 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    focusRing: 'focus:border-red-400 focus:ring-1 focus:ring-red-400/30',
  },
  indigo: {
    sectionOpen: 'border-indigo-400/50 dark:border-indigo-500/30',
    iconActive: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    btnBg: 'bg-indigo-600 hover:bg-indigo-700',
    chipActive: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    focusRing: 'focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30',
  },
  rose: {
    sectionOpen: 'border-rose-400/50 dark:border-rose-500/30',
    iconActive: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    btnBg: 'bg-rose-600 hover:bg-rose-700',
    chipActive: 'border-rose-400 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    focusRing: 'focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30',
  },
  fuchsia: {
    sectionOpen: 'border-fuchsia-400/50 dark:border-fuchsia-500/30',
    iconActive: 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400',
    btnBg: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    chipActive: 'border-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400',
    focusRing: 'focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/30',
  },
  sky: {
    sectionOpen: 'border-sky-400/50 dark:border-sky-500/30',
    iconActive: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    btnBg: 'bg-sky-600 hover:bg-sky-700',
    chipActive: 'border-sky-400 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    focusRing: 'focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30',
  },
  amber: {
    sectionOpen: 'border-amber-400/50 dark:border-amber-500/30',
    iconActive: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    btnBg: 'bg-amber-600 hover:bg-amber-700',
    chipActive: 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    focusRing: 'focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30',
  },
  orange: {
    sectionOpen: 'border-orange-400/50 dark:border-orange-500/30',
    iconActive: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    btnBg: 'bg-orange-600 hover:bg-orange-700',
    chipActive: 'border-orange-400 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    focusRing: 'focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30',
  },
  teal: {
    sectionOpen: 'border-teal-400/50 dark:border-teal-500/30',
    iconActive: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    btnBg: 'bg-teal-600 hover:bg-teal-700',
    chipActive: 'border-teal-400 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    focusRing: 'focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30',
  },
  green: {
    sectionOpen: 'border-green-400/50 dark:border-green-500/30',
    iconActive: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    btnBg: 'bg-green-600 hover:bg-green-700',
    chipActive: 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    focusRing: 'focus:border-green-400 focus:ring-1 focus:ring-green-400/30',
  },
};

const getAccent = (color) => accentStyles[color] || accentStyles.blue;

// ─── Form wrapper: header + scrollable body + sticky submit bar ───
export const FormShell = ({ icon: Icon, iconColor = 'text-blue-500', label, accentColor = 'blue', onBack, onSubmit, isLoading, disabled, error, children }) => {
  const a = getAccent(accentColor);
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
        <button onClick={onBack} className="p-1.5 -ml-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
          {label}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-4 bg-white dark:bg-slate-950">
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {children}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 py-3.5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isLoading || disabled}
          className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none shadow-sm ${a.btnBg}`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isLoading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </div>
    </div>
  );
};

// ─── Collapsible section ───
export const Section = ({ icon: Icon, title, subtitle, isOpen, onToggle, accentColor = 'blue', children }) => {
  const a = getAccent(accentColor);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 bg-white dark:bg-slate-900 ${isOpen ? a.sectionOpen : 'border-slate-200 dark:border-slate-800'}`}>
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOpen ? a.iconActive : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-300 dark:text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Input field ───
export const Field = ({ label, required, hint, icon: Icon, children, className = '' }) => (
  <div className={className}>
    {label && (
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    {Icon ? (
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {children}
      </div>
    ) : children}
    {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

// Base input classes — uses lookup instead of template literals
export const inputClass = (accent = 'blue') => {
  const a = getAccent(accent);
  return `w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none ${a.focusRing} transition-colors`;
};

export const inputWithIconClass = (accent = 'blue') => {
  const a = getAccent(accent);
  return `w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none ${a.focusRing} transition-colors`;
};

// ─── Design section (shared across all forms) ───
export const DesignSection = ({ isOpen, onToggle, accentColor = 'blue' }) => {
  const { fgColor, setFgColor, bgColor, setBgColor, dotStyle, setDotStyle, cornerSquareStyle, setCornerSquareStyle, logoDataUrl, setLogo } = useQRStore();
  const a = getAccent(accentColor);

  return (
    <Section icon={Palette} title="Design" subtitle="Colors, shapes & logo" isOpen={isOpen} onToggle={onToggle} accentColor={accentColor}>
      <TemplatePicker />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">QR Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0 bg-transparent" />
            <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase text-xs font-mono" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Background</label>
          <div className="flex items-center gap-2">
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0 bg-transparent" />
            <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase text-xs font-mono" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Dot Shape</label>
        <div className="flex flex-wrap gap-1.5">
          {['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'].map(s => (
            <button key={s} type="button" onClick={() => setDotStyle(s)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all capitalize ${dotStyle === s ? a.chipActive : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}>
              {s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Corner Shape</label>
        <div className="flex flex-wrap gap-1.5">
          {['square', 'dot', 'extra-rounded'].map(s => (
            <button key={s} type="button" onClick={() => setCornerSquareStyle(s)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all capitalize ${cornerSquareStyle === s ? a.chipActive : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}>
              {s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Center Logo</label>
        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors text-xs text-slate-500">
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
            {logoDataUrl ? 'Change logo' : 'Upload logo'}
          </label>
          {logoDataUrl && (
            <div className="relative">
              <img src={logoDataUrl} alt="Logo" className="w-8 h-8 rounded-md object-contain border border-slate-200 dark:border-slate-700" />
              <button type="button" onClick={() => setLogo(null)} className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center leading-none">x</button>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

// ─── Settings section (shared across dynamic forms) ───
export const SettingsSection = ({ isOpen, onToggle, accentColor = 'blue', description, setDescription, expiresAt, setExpiresAt, maxScans, setMaxScans }) => {
  const { title, setTitle } = useQRStore();

  return (
    <Section icon={Settings2} title="Settings" subtitle="Name, limits & scheduling" isOpen={isOpen} onToggle={onToggle} accentColor={accentColor}>
      <Field label="QR Code Name" hint="Used to identify this QR in your dashboard.">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="e.g., Summer Campaign" className={inputClass(accentColor)} />
      </Field>

      {setDescription && (
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes..." rows={2} className={`${inputClass(accentColor)} resize-none`} />
        </Field>
      )}

      {(setExpiresAt || setMaxScans) && (
        <div className="grid grid-cols-2 gap-3">
          {setExpiresAt && (
            <Field label="Expiry Date" hint="Leave empty for no expiry.">
              <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} className={inputClass(accentColor)} />
            </Field>
          )}
          {setMaxScans && (
            <Field label="Max Scans" hint="Leave empty for unlimited.">
              <input type="number" value={maxScans} onChange={(e) => setMaxScans(e.target.value)} placeholder="Unlimited" min="1" className={inputClass(accentColor)} />
            </Field>
          )}
        </div>
      )}
    </Section>
  );
};

// ─── Hook: syncs accordion open state to topbar builder step ───
export const useFormSections = (initialOpen = { content: true, design: false, settings: false }) => {
  const { builderStep } = useContext(BuilderContext);
  const [openSections, setOpenSections] = useState(initialOpen);

  useEffect(() => {
    if (builderStep === 2) setOpenSections(prev => ({ ...prev, content: true }));
    if (builderStep === 3) setOpenSections(prev => ({ ...prev, design: true }));
  }, [builderStep]);

  const toggle = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  return { openSections, toggle };
};
