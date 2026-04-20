import { Check } from 'lucide-react';

const MiniPreview = ({ children, selected, bgColor }) => (
  <div className={`w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${selected ? 'border-emerald-500 shadow-md shadow-emerald-500/15' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
    <div className="w-full h-full relative text-[5px] leading-tight" style={{ backgroundColor: bgColor || '#ffffff' }}>
      {children}
    </div>
  </div>
);

const Dot = ({ bg, className = '' }) => <div className={`rounded-full ${className}`} style={bg ? { backgroundColor: bg } : undefined} />;
const Bar = ({ bg, className = '' }) => <div className={`rounded-sm ${className}`} style={bg ? { backgroundColor: bg } : undefined} />;
const Btn = ({ bg, className = '' }) => <div className={`rounded ${className}`} style={bg ? { backgroundColor: bg } : undefined} />;

const templates = [
  {
    id: 'default',
    name: 'Default',
    preview: (sel) => (
      <MiniPreview selected={sel}>
        <div className="flex flex-col items-center pt-5 px-3">
          <Dot bg="#dbeafe" className="w-8 h-8 mb-2" />
          <Bar bg="#bfdbfe" className="w-10 h-1 mb-1" />
          <Bar bg="#1e293b" className="w-14 h-1.5 mb-1" />
          <Bar bg="#e2e8f0" className="w-12 h-1 mb-2" />
          <Btn bg="#3b82f6" className="w-14 h-3 mb-2" />
          <div className="flex gap-1.5 mt-1">
            <Dot bg="#eff6ff" className="w-3 h-3" />
            <Dot bg="#eff6ff" className="w-3 h-3" />
            <Dot bg="#eff6ff" className="w-3 h-3" />
          </div>
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'gradient',
    name: 'Gradient',
    preview: (sel) => (
      <MiniPreview selected={sel}>
        <div className="h-[40%] relative" style={{ background: 'linear-gradient(135deg, #a855f7, #d946ef)' }}>
          <Dot bg="#ffffff" className="w-8 h-8 border-2 border-white absolute -bottom-4 left-1/2 -translate-x-1/2 shadow-sm" />
        </div>
        <div className="flex flex-col items-center pt-6 px-3">
          <Bar bg="#e9d5ff" className="w-10 h-1 mb-1" />
          <Bar bg="#1e293b" className="w-14 h-1.5 mb-1" />
          <Bar bg="#cbd5e1" className="w-12 h-1 mb-2" />
          <Btn bg="#a855f7" className="w-14 h-3" />
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'modern',
    name: 'Modern',
    preview: (sel) => (
      <MiniPreview selected={sel}>
        <div className="h-[42%] flex items-center justify-center" style={{ backgroundColor: '#ecfdf5' }}>
          <Dot bg="#d1fae5" className="w-10 h-10" />
        </div>
        <div className="flex flex-col items-start px-3 pt-3">
          <Bar bg="#1e293b" className="w-14 h-1.5 mb-1" />
          <Bar bg="#34d399" className="w-10 h-1 mb-2.5" />
          <div className="flex gap-1 w-full">
            <Btn bg="#10b981" className="flex-1 h-3" />
            <Btn className="w-4 h-3 border border-slate-200" bg="#f1f5f9" />
            <Btn className="w-4 h-3 border border-slate-200" bg="#f1f5f9" />
          </div>
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'bold',
    name: 'Bold',
    preview: (sel) => (
      <MiniPreview selected={sel}>
        <div className="h-[45%] flex flex-col items-start justify-end pb-2 px-3 relative" style={{ backgroundColor: '#1e293b' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundColor: '#94a3b8' }} />
          <Bar bg="#ffffff" className="w-14 h-1.5 mb-1 relative z-10" />
          <Bar bg="#34d399" className="w-10 h-1 relative z-10" />
        </div>
        <div className="flex flex-col items-center pt-3 px-3">
          <Btn bg="#10b981" className="w-16 h-3 mb-2" />
          <div className="flex gap-1.5">
            <Dot bg="#ecfdf5" className="w-3 h-3" />
            <Dot bg="#ecfdf5" className="w-3 h-3" />
            <Dot bg="#ecfdf5" className="w-3 h-3" />
          </div>
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'elegant',
    name: 'Elegant',
    preview: (sel) => (
      <MiniPreview selected={sel} bgColor="#fdfbf8">
        <div className="flex flex-col items-center pt-4 px-3">
          <div className="w-9 h-9 rounded-full p-0.5 mb-2" style={{ background: 'linear-gradient(135deg, #fde68a, #fdba74)' }}>
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#ffffff' }} />
          </div>
          <Bar bg="#1e293b" className="w-14 h-1.5 mb-1" />
          <Bar bg="#fbbf24" className="w-10 h-1 mb-0.5" />
          <Bar bg="#e2e8f0" className="w-8 h-1 mb-2" />
          <Btn bg="#92400e" className="w-14 h-3" />
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'corporate',
    name: 'Corporate',
    preview: (sel) => (
      <MiniPreview selected={sel}>
        <div className="h-1" style={{ backgroundColor: '#6366f1' }} />
        <div className="flex items-center gap-1.5 px-3 pt-3 mb-2.5">
          <Dot bg="#e0e7ff" className="w-7 h-7 shrink-0" />
          <div>
            <Bar bg="#1e293b" className="w-10 h-1.5 mb-0.5" />
            <Bar bg="#818cf8" className="w-8 h-1" />
          </div>
        </div>
        <div className="flex gap-1 px-3 mb-2">
          <Btn bg="#6366f1" className="flex-1 h-3" />
          <Btn className="w-4 h-3 border border-slate-200" bg="#f1f5f9" />
          <Btn className="w-4 h-3 border border-slate-200" bg="#f1f5f9" />
        </div>
        <div className="px-3 space-y-1">
          <Bar bg="#eef2ff" className="w-14 h-1" />
          <Bar bg="#eef2ff" className="w-12 h-1" />
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'dark',
    name: 'Dark',
    preview: (sel) => (
      <MiniPreview selected={sel} bgColor="#020617">
        <div className="flex flex-col items-center pt-5 px-3">
          <Dot bg="#334155" className="w-8 h-8 mb-2" />
          <Bar bg="#2dd4bf" className="w-10 h-1 mb-1" />
          <Bar bg="#ffffff" className="w-14 h-1.5 mb-1" />
          <Bar bg="#475569" className="w-12 h-1 mb-2" />
          <Btn bg="#14b8a6" className="w-14 h-3 mb-2" />
          <div className="flex gap-1.5 mt-1">
            <Dot bg="#1e293b" className="w-3 h-3" />
            <Dot bg="#1e293b" className="w-3 h-3" />
            <Dot bg="#1e293b" className="w-3 h-3" />
          </div>
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'rose',
    name: 'Rose',
    preview: (sel) => (
      <MiniPreview selected={sel} bgColor="#fefbfb">
        <div className="flex flex-col items-center pt-5 px-3">
          <div className="w-9 h-9 rounded-full p-0.5 mb-2" style={{ background: 'linear-gradient(135deg, #fecdd3, #fbcfe8)' }}>
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#ffffff' }} />
          </div>
          <Bar bg="#1e293b" className="w-14 h-1.5 mb-1" />
          <Bar bg="#fb7185" className="w-10 h-1 mb-0.5" />
          <Bar bg="#e2e8f0" className="w-8 h-1 mb-2" />
          <Btn bg="#f43f5e" className="w-14 h-3" />
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    preview: (sel) => (
      <MiniPreview selected={sel}>
        <div className="h-[45%] flex flex-col items-center justify-center px-3" style={{ backgroundColor: '#0d9488' }}>
          <Dot className="w-7 h-7 mb-1" bg="rgba(255,255,255,0.3)" />
          <Bar bg="#ffffff" className="w-12 h-1.5 mb-0.5" />
          <Bar bg="#99f6e4" className="w-8 h-1" />
        </div>
        <div className="flex flex-col items-center pt-3 px-3">
          <Btn bg="#0d9488" className="w-16 h-3 mb-2" />
          <div className="flex gap-1.5">
            <Dot bg="#f0fdfa" className="w-3 h-3" />
            <Dot bg="#f0fdfa" className="w-3 h-3" />
            <Dot bg="#f0fdfa" className="w-3 h-3" />
          </div>
        </div>
      </MiniPreview>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    preview: (sel) => (
      <MiniPreview selected={sel}>
        <div className="flex items-center gap-1.5 px-3 pt-4 mb-3">
          <Dot bg="#e2e8f0" className="w-6 h-6 shrink-0" />
          <div>
            <Bar bg="#1e293b" className="w-10 h-1.5 mb-0.5" />
            <Bar bg="#cbd5e1" className="w-14 h-1" />
          </div>
        </div>
        <div className="px-3">
          <Btn bg="#1e293b" className="w-16 h-3 mb-3" />
          <div className="space-y-1.5">
            <Bar bg="#f1f5f9" className="w-14 h-1" />
            <Bar bg="#f1f5f9" className="w-12 h-1" />
            <Bar bg="#f1f5f9" className="w-16 h-1" />
          </div>
        </div>
      </MiniPreview>
    ),
  },
];

const VCardTemplatePicker = ({ value = 'default', onChange }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {templates.map((t) => {
        const isSelected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="flex flex-col items-center gap-1.5 group relative"
          >
            {t.preview(isSelected)}
            <span className={`text-[11px] font-medium transition-colors ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {t.name}
            </span>
            {isSelected && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default VCardTemplatePicker;
export { templates };
