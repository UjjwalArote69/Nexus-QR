/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore'; // <-- Added store import
import { BuilderContext } from '../../Dashboard'; 
import { 
  ArrowLeft, Contact, AlertCircle, 
  Settings2, Palette, ChevronDown, Check,
  User, Building2, Phone, Mail, Globe, MapPin
} from 'lucide-react';
import TemplatePicker from '../TemplatePicker';

const VCardQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
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
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    jobTitle: '',
    website: '',
    address: ''
  });
  
  const [openSection, setOpenSection] = useState('content');

  useEffect(() => {
    if (builderStep === 2) setOpenSection('content');
    if (builderStep === 3) setOpenSection('design');
  }, [builderStep]);

  useEffect(() => {
    if (onLiveUpdate) {
      onLiveUpdate({ 
        url: 'https://nexusqr.com/preview-vcard', 
        fgColor, 
        bgColor, 
        title 
      });
    }
  }, [contactData, fgColor, bgColor, title]);

  const handleSectionToggle = (sectionName, stepNumber) => {
    setOpenSection(sectionName);
    setBuilderStep(stepNumber);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactData.firstName || !contactData.phone) {
      setError("First Name and Phone Number are required.");
      handleSectionToggle('content', 2);
      return;
    }

    // 3. Call the store's action to save it to the backend
    const result = await createQRCode({
      title: title || `${contactData.firstName}'s vCard`,
      qrType: 'vCard Plus', 
      content: contactData, 
    });

    if (result.success) {
      // For dynamic QRs, we pass the tracking link to the generator
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
            <Contact className="w-5 h-5 text-emerald-500" />
            vCard Plus
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
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'content' ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('content', 2)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'content' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Contact className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">1. Contact Info</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter details for your digital card</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'content' ? 'rotate-180 text-emerald-500' : ''}`} />
          </button>
          
          {openSection === 'content' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
              
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">First Name <span className="text-emerald-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="text" name="firstName" value={contactData.firstName} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input type="text" name="lastName" value={contactData.lastName} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone <span className="text-emerald-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="tel" name="phone" value={contactData.phone} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="email" name="email" value={contactData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Work Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="text" name="company" value={contactData.company} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input type="text" name="jobTitle" value={contactData.jobTitle} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              {/* Extras */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input type="url" name="website" value={contactData.website} onChange={handleChange} placeholder="https://" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input type="text" name="address" value={contactData.address} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2: DESIGN */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'design' ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('design', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'design' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">2. Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize colors</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'design' ? 'rotate-180 text-emerald-500' : ''}`} />
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
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'settings' ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('settings', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'settings' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">3. Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name your campaign</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'settings' ? 'rotate-180 text-emerald-500' : ''}`} />
          </button>
          
          {openSection === 'settings' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Code Name</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., John's Work Profile" 
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !contactData.firstName || !contactData.phone}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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

export default VCardQRForm;