/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore'; // <-- Added store import
import { BuilderContext } from '../../Dashboard'; 
import { 
  ArrowLeft, AlignJustify, AlertCircle, 
  Settings2, Palette, ChevronDown, Check,
  Plus, Trash2, Link as LinkIcon, User
} from 'lucide-react';
import TemplatePicker from '../TemplatePicker';

const LinksQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  const { builderStep, setBuilderStep } = useContext(BuilderContext);
  
  // 1. Pull common state and actions from the store
  const { 
    title, setTitle, 
    fgColor, setFgColor, 
    bgColor, setBgColor, 
    isLoading, error, setError,
    createQRCode 
  } = useQRStore();

  // 2. Keep ONLY type-specific state local
  const [profile, setProfile] = useState({ name: '', bio: '' });
  const [links, setLinks] = useState([
    { id: 1, title: 'My Website', url: '' }
  ]);
  const [openSection, setOpenSection] = useState('content');

  useEffect(() => {
    if (builderStep === 2) setOpenSection('content');
    if (builderStep === 3) setOpenSection('design');
  }, [builderStep]);

  // Sync Live Preview upwards
  useEffect(() => {
    if (onLiveUpdate) {
      onLiveUpdate({ 
        url: 'https://nexusqr.com/preview-links', 
        fgColor, 
        bgColor, 
        title 
      });
    }
  }, [profile, links, fgColor, bgColor, title]);

  const handleSectionToggle = (sectionName, stepNumber) => {
    setOpenSection(sectionName);
    setBuilderStep(stepNumber);
  };

  // Dynamic Link Handlers
  const addLink = () => {
    setLinks([...links, { id: Date.now(), title: '', url: '' }]);
  };

  const removeLink = (id) => {
    if (links.length > 1) {
      setLinks(links.filter(link => link.id !== id));
    }
  };

  const updateLink = (id, field, value) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile.name) {
      setError("Please enter a profile name.");
      handleSectionToggle('content', 2);
      return;
    }
    
    const invalidLinks = links.some(l => !l.url || !l.title);
    if (invalidLinks) {
      setError("Please ensure all your links have a title and URL.");
      handleSectionToggle('content', 2);
      return;
    }

    // 3. Call the store's action to save it to the backend
    const result = await createQRCode({
      title: title || `${profile.name}'s Links`,
      qrType: 'List of links',
      content: { profile, links }, 
    });

    if (result.success) {
      // Pass the tracking link to the generator
      onGenerated(result.qrLink);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-medium">
            <AlignJustify className="w-5 h-5 text-fuchsia-500" />
            List of Links
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-4 bg-slate-50 dark:bg-slate-950/50">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* SECTION 1: CONTENT */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'content' ? 'border-fuchsia-500 shadow-md ring-1 ring-fuchsia-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('content', 2)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'content' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <AlignJustify className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">1. Content</h3>
                <p className="text-xs text-slate-500 mt-0.5">Setup your Link-in-Bio</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'content' ? 'rotate-180 text-fuchsia-500' : ''}`} />
          </button>
          
          {openSection === 'content' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-6 animate-in slide-in-from-top-2 duration-200">
              
              {/* Profile Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Profile Header</h4>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Page Name <span className="text-fuchsia-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="e.g., NexusQR Official" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Short Bio / Description</label>
                  <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} placeholder="Welcome to my links!" rows="2" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500 outline-none resize-none"></textarea>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Dynamic Links List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Your Links</h4>
                  <button type="button" onClick={addLink} className="flex items-center gap-1 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 transition-colors bg-fuchsia-50 dark:bg-fuchsia-900/20 px-2 py-1 rounded">
                    <Plus className="w-3 h-3" /> Add Link
                  </button>
                </div>

                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={link.id} className="flex gap-2 items-start p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                      <div className="flex-1 space-y-2.5">
                        <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} placeholder="Link Title (e.g., Instagram)" className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-fuchsia-500 rounded text-sm text-slate-900 dark:text-white outline-none transition-colors" />
                        <div className="relative">
                          <LinkIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                          <input type="url" value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} placeholder="https://" className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-fuchsia-500 rounded text-sm text-slate-900 dark:text-white outline-none transition-colors" />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeLink(link.id)} disabled={links.length === 1} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2 & 3: DESIGN & SETTINGS (Same as before) */}
        {/* ... Paste the Design and Settings accordions from VCardQRForm here, just changing the accent colors to fuchsia-500 ... */}
        
        {/* SECTION 2: DESIGN */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'design' ? 'border-fuchsia-500 shadow-md ring-1 ring-fuchsia-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('design', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'design' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">2. Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize colors</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'design' ? 'rotate-180 text-fuchsia-500' : ''}`} />
          </button>
          {openSection === 'design' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <TemplatePicker />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
                    <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: SETTINGS */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'settings' ? 'border-fuchsia-500 shadow-md ring-1 ring-fuchsia-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('settings', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'settings' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">3. Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name your campaign</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'settings' ? 'rotate-180 text-fuchsia-500' : ''}`} />
          </button>
          {openSection === 'settings' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Code Name</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., My Social Hub" className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all shadow-sm" />
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !profile.name}
          className="flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-8 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isLoading ? (
             <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <Check className="w-5 h-5" />
          )}
          {isLoading ? 'Generating...' : 'Complete setup'}
        </button>
      </div>
    </div>
  );
};

export default LinksQRForm;