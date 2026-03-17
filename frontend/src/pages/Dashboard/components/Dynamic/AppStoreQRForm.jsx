/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useContext, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore'; // <-- Added import
import { BuilderContext } from '../../Dashboard'; 
import { 
  ArrowLeft, Smartphone, AlertCircle, 
  Settings2, Palette, ChevronDown, Check,
  Apple, Play, Globe, Box
} from 'lucide-react';
import TemplatePicker from '../TemplatePicker';

const AppStoreQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
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
  const [appData, setAppData] = useState({
    appName: '',
    developer: '',
    description: '',
    iosLink: '',
    androidLink: '',
    websiteLink: ''
  });
  
  const [openSection, setOpenSection] = useState('content');

  useEffect(() => {
    if (builderStep === 2) setOpenSection('content');
    if (builderStep === 3) setOpenSection('design');
  }, [builderStep]);

  // Sync Live Preview upwards
  useEffect(() => {
    if (onLiveUpdate) {
      onLiveUpdate({ 
        url: 'https://nexusqr.com/preview-app', 
        fgColor, 
        bgColor, 
        title 
      });
    }
  }, [appData, fgColor, bgColor, title]);

  const handleSectionToggle = (sectionName, stepNumber) => {
    setOpenSection(sectionName);
    setBuilderStep(stepNumber);
  };

  const handleChange = (e) => {
    setAppData({ ...appData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!appData.appName) {
      setError("App Name is required.");
      handleSectionToggle('content', 2);
      return;
    }

    if (!appData.iosLink && !appData.androidLink) {
      setError("Please provide at least one store link (iOS or Android).");
      handleSectionToggle('content', 2);
      return;
    }

    // 3. Call the store's action to save it to the backend
    const result = await createQRCode({
      title: title || `${appData.appName} App`,
      qrType: 'App Store', 
      content: appData, 
    });

    if (result.success) {
      // For Dynamic QRs, we pass the tracking link to the generator
      onGenerated(result.qrLink);
    }
  };
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-medium">
            <Smartphone className="w-5 h-5 text-teal-500" />
            App Store Links
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
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'content' ? 'border-teal-500 shadow-md ring-1 ring-teal-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('content', 2)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'content' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">1. App Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter app info and links</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'content' ? 'rotate-180 text-teal-500' : ''}`} />
          </button>
          
          {openSection === 'content' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">App Name <span className="text-teal-500">*</span></label>
                  <div className="relative">
                    <Box className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="text" name="appName" value={appData.appName} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Developer / Company Name</label>
                  <input type="text" name="developer" value={appData.developer} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
                  <textarea name="description" value={appData.description} onChange={handleChange} rows="2" placeholder="What does your app do?" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Store Links</h4>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Apple App Store URL</label>
                  <div className="relative">
                    <Apple className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="url" name="iosLink" value={appData.iosLink} onChange={handleChange} placeholder="https://apps.apple.com/..." className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Google Play Store URL</label>
                  <div className="relative">
                    <Play className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="url" name="androidLink" value={appData.androidLink} onChange={handleChange} placeholder="https://play.google.com/..." className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Website URL (Fallback)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="url" name="websiteLink" value={appData.websiteLink} onChange={handleChange} placeholder="https://" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2 & 3: DESIGN & SETTINGS */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'design' ? 'border-teal-500 shadow-md ring-1 ring-teal-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('design', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'design' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">2. Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize colors</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'design' ? 'rotate-180 text-teal-500' : ''}`} />
          </button>
          {openSection === 'design' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <TemplatePicker />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'settings' ? 'border-teal-500 shadow-md ring-1 ring-teal-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('settings', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'settings' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">3. Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name your campaign</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'settings' ? 'rotate-180 text-teal-500' : ''}`} />
          </button>
          {openSection === 'settings' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Code Name</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Spring App Promo" className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm" />
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !appData.appName || (!appData.iosLink && !appData.androidLink)}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isLoading ? 'Generating...' : <><Check className="w-5 h-5" /> Complete setup</>}
        </button>
      </div>
    </div>
  );
};

export default AppStoreQRForm;