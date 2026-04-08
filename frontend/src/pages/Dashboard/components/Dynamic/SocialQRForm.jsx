/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore'; // <-- Added store import
import { BuilderContext } from '../../Dashboard'; 
import { 
  ArrowLeft, Share2, AlertCircle, 
  Settings2, Palette, ChevronDown, Check, User,
  Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Globe
} from 'lucide-react';
import TemplatePicker from '../TemplatePicker';

const SocialQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
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
  const [profile, setProfile] = useState({ name: '', headline: '' });
  const [socials, setSocials] = useState({
    instagram: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    github: '',
    website: ''
  });
  
  const [openSections, setOpenSections] = useState({ content: true, design: false, settings: false });

  useEffect(() => {
    if (builderStep === 2) setOpenSections(prev => ({ ...prev, content: true }));
    if (builderStep === 3) setOpenSections(prev => ({ ...prev, design: true }));
  }, [builderStep]);

  // Sync Live Preview upwards
  useEffect(() => {
    if (onLiveUpdate) {
      onLiveUpdate({ 
        url: 'https://klink.com/preview-social', 
        fgColor, 
        bgColor, 
        title 
      });
    }
  }, [profile, socials, fgColor, bgColor, title]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSocialChange = (e) => {
    setSocials({ ...socials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!profile.name) {
      setError("Please enter a profile name.");
      setOpenSections(prev => ({ ...prev, content: true }));
      return;
    }

    const cleanedSocials = Object.fromEntries(
      Object.entries(socials).filter(([_, v]) => v.trim() !== '')
    );

    if (Object.keys(cleanedSocials).length === 0) {
      setError("Please add at least one social media link.");
      setOpenSections(prev => ({ ...prev, content: true }));
      return;
    }

    const result = await createQRCode({
      title: title || `${profile.name}'s Socials`,
      qrType: 'Social Media',
      content: { profile, socials: cleanedSocials },
    });

    if (result.success) {
      setProfile({ name: '', headline: '' });
      setSocials({ instagram: '', twitter: '', facebook: '', linkedin: '', youtube: '', github: '', website: '' });
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
            <Share2 className="w-5 h-5 text-sky-500" />
            Social Media
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 space-y-4 bg-slate-50 dark:bg-slate-950/50">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* SECTION 1: CONTENT */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSections.content ? 'border-sky-500 shadow-md ring-1 ring-sky-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => toggleSection('content')} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSections.content ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">1. Content</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add your profiles</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSections.content ? 'rotate-180 text-sky-500' : ''}`} />
          </button>
          
          {openSections.content && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-6 animate-in slide-in-from-top-2 duration-200">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Name <span className="text-sky-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="Your Name or Brand" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Headline (Optional)</label>
                  <input type="text" value={profile.headline} onChange={(e) => setProfile({...profile, headline: e.target.value})} placeholder="Content Creator & Developer" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Social Links</h4>
                
                {[
                  { name: 'instagram', icon: Instagram, color: 'text-pink-500', placeholder: 'Instagram URL' },
                  { name: 'twitter', icon: Twitter, color: 'text-sky-500', placeholder: 'Twitter/X URL' },
                  { name: 'linkedin', icon: Linkedin, color: 'text-blue-600', placeholder: 'LinkedIn URL' },
                  { name: 'youtube', icon: Youtube, color: 'text-red-500', placeholder: 'YouTube Channel URL' },
                  { name: 'facebook', icon: Facebook, color: 'text-blue-500', placeholder: 'Facebook URL' },
                  { name: 'github', icon: Github, color: 'text-slate-800 dark:text-white', placeholder: 'GitHub Profile URL' },
                  { name: 'website', icon: Globe, color: 'text-emerald-500', placeholder: 'Personal Website URL' },
                ].map((platform) => (
                  <div key={platform.name} className="relative flex items-center">
                    <div className="absolute left-3 flex items-center justify-center">
                      <platform.icon className={`h-5 w-5 ${platform.color}`} />
                    </div>
                    <input 
                      type="url" 
                      name={platform.name}
                      value={socials[platform.name]} 
                      onChange={handleSocialChange} 
                      placeholder={platform.placeholder} 
                      className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition-all shadow-sm" 
                    />
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2 & 3: DESIGN & SETTINGS */}
        {/* Same layout as the others, just update the colors to sky-500 if you'd like! */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSections.design ? 'border-sky-500 shadow-md ring-1 ring-sky-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => toggleSection('design')} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSections.design ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">2. Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize colors</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSections.design ? 'rotate-180 text-sky-500' : ''}`} />
          </button>
          {openSections.design && (
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

        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSections.settings ? 'border-sky-500 shadow-md ring-1 ring-sky-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => toggleSection('settings')} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSections.settings ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">3. Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name your campaign</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSections.settings ? 'rotate-180 text-sky-500' : ''}`} />
          </button>
          {openSections.settings && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Code Name</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="e.g., Creator Socials" className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-sm" />
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !profile.name}
          className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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

export default SocialQRForm;