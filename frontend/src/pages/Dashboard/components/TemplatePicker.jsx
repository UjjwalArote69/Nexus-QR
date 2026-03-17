import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Check } from 'lucide-react';
import { fetchTemplates, applyTemplate } from '../../../api/template.api';
import useQRStore from '../../../store/qrStore';

const TemplatePicker = () => {
  const [templates, setTemplates] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const { setFgColor, setBgColor } = useQRStore();

  useEffect(() => {
    fetchTemplates()
      .then(res => { if (res.success) setTemplates(res.data); })
      .catch(() => {});
  }, []);

  if (templates.length === 0) return null;

  const handleApply = async (template) => {
    setActiveId(template.id);
    setFgColor(template.fgColor);
    setBgColor(template.bgColor);
    try { await applyTemplate(template.id); } catch {}
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <LayoutTemplate className="w-4 h-4 text-slate-400" />
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Apply Template</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleApply(t)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
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
            <span className="truncate max-w-[80px]">{t.name}</span>
            {activeId === t.id && <Check className="w-3 h-3 text-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplatePicker;
