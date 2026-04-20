import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { fetchTemplates, applyTemplate } from '../../../api/template.api';
import useQRStore from '../../../store/qrStore';

const presets = [
  { id: 'p-classic', name: 'Classic', fgColor: '#000000', bgColor: '#ffffff' },
  { id: 'p-midnight', name: 'Midnight', fgColor: '#1e293b', bgColor: '#f1f5f9' },
  { id: 'p-charcoal', name: 'Charcoal', fgColor: '#374151', bgColor: '#f9fafb' },
  { id: 'p-ocean', name: 'Ocean Blue', fgColor: '#1e3a5f', bgColor: '#e8f4fd' },
  { id: 'p-navy', name: 'Navy', fgColor: '#1e3a8a', bgColor: '#eff6ff' },
  { id: 'p-teal', name: 'Teal', fgColor: '#115e59', bgColor: '#f0fdfa' },
  { id: 'p-forest', name: 'Forest', fgColor: '#14532d', bgColor: '#f0fdf4' },
  { id: 'p-royal', name: 'Purple', fgColor: '#4c1d95', bgColor: '#f5f3ff' },
  { id: 'p-ruby', name: 'Ruby', fgColor: '#991b1b', bgColor: '#fef2f2' },
  { id: 'p-sunset', name: 'Sunset', fgColor: '#9a3412', bgColor: '#fff7ed' },
  { id: 'p-rose', name: 'Rose', fgColor: '#881337', bgColor: '#fff1f2' },
  { id: 'p-golden', name: 'Golden', fgColor: '#78350f', bgColor: '#fffbeb' },
  { id: 'p-ink', name: 'Ink', fgColor: '#0f172a', bgColor: '#e2e8f0' },
  { id: 'p-inverted', name: 'Inverted', fgColor: '#ffffff', bgColor: '#0f172a' },
  { id: 'p-electric', name: 'Electric', fgColor: '#7c3aed', bgColor: '#faf5ff' },
  { id: 'p-coral', name: 'Coral', fgColor: '#be123c', bgColor: '#ffe4e6' },
];

const TemplatePicker = () => {
  const [userTemplates, setUserTemplates] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const { setFgColor, setBgColor } = useQRStore();

  useEffect(() => {
    fetchTemplates()
      .then(res => { if (res.success) setUserTemplates(res.data); })
      .catch(() => {});
  }, []);

  const handleApply = async (template) => {
    setActiveId(template.id);
    setFgColor(template.fgColor);
    setBgColor(template.bgColor);
    // Only call the API for user templates (not presets)
    if (!template.id.startsWith('p-')) {
      const token = localStorage.getItem('token');
      if (token) {
        try { await applyTemplate(template.id); } catch {}
      }
    }
  };

  const Swatch = ({ t }) => (
    <button
      key={t.id}
      type="button"
      onClick={() => handleApply(t)}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
        activeId === t.id
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
      title={`Apply ${t.name}`}
    >
      <div className="flex gap-0.5">
        <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-600" style={{ backgroundColor: t.fgColor }} />
        <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-600" style={{ backgroundColor: t.bgColor }} />
      </div>
      <span className="truncate max-w-[64px]">{t.name}</span>
      {activeId === t.id && <Check className="w-3 h-3 text-blue-500 shrink-0" />}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Presets</label>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {presets.map(t => <Swatch key={t.id} t={t} />)}
        </div>
      </div>

      {/* User templates */}
      {userTemplates.length > 0 && (
        <div>
          <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">My Templates</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {userTemplates.map(t => <Swatch key={t.id} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePicker;
