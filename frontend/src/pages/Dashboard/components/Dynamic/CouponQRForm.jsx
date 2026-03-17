/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useContext, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore'; // <-- Make sure to import the store
import { BuilderContext } from '../../Dashboard'; 
import { 
  ArrowLeft, Ticket, AlertCircle, 
  Settings2, Palette, ChevronDown, Check,
  Building2, Tag, Calendar, Link as LinkIcon, AlignLeft
} from 'lucide-react';
import TemplatePicker from '../TemplatePicker';

const CouponQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
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
  const [coupon, setCoupon] = useState({
    companyName: '',
    offerTitle: '',
    description: '',
    couponCode: '',
    validUntil: '',
    buttonUrl: '',
    buttonText: 'Redeem Now'
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
        url: 'https://nexusqr.com/preview-coupon', 
        fgColor, 
        bgColor, 
        title 
      });
    }
  }, [coupon, fgColor, bgColor, title]);

  const handleSectionToggle = (sectionName, stepNumber) => {
    setOpenSection(sectionName);
    setBuilderStep(stepNumber);
  };

  const handleChange = (e) => {
    setCoupon({ ...coupon, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coupon.companyName || !coupon.offerTitle || !coupon.couponCode) {
      setError("Company Name, Offer Title, and Coupon Code are required.");
      handleSectionToggle('content', 2);
      return;
    }

    // 3. Call the store's action to save it to the backend
    const result = await createQRCode({
      title: title || `${coupon.companyName} Coupon`,
      qrType: 'Coupon', 
      content: coupon, 
    });

    if (result.success) {
      // For dynamic QRs, we pass the tracking link to the generator
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
            <Ticket className="w-5 h-5 text-orange-500" />
            Coupon QR
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
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'content' ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('content', 2)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'content' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">1. Coupon Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Setup your discount offer</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'content' ? 'rotate-180 text-orange-500' : ''}`} />
          </button>
          
          {openSection === 'content' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Brand Name <span className="text-orange-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="text" name="companyName" value={coupon.companyName} onChange={handleChange} placeholder="e.g., Nexus Shop" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Offer Title <span className="text-orange-500">*</span></label>
                  <input type="text" name="offerTitle" value={coupon.offerTitle} onChange={handleChange} placeholder="e.g., 20% OFF Entire Order" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Terms</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <textarea name="description" value={coupon.description} onChange={handleChange} rows="2" placeholder="Valid on all items. Cannot be combined with other offers." className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Coupon Code <span className="text-orange-500">*</span></label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="text" name="couponCode" value={coupon.couponCode} onChange={handleChange} placeholder="e.g., SAVE20" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none uppercase font-bold tracking-wider" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Valid Until (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="date" name="validUntil" value={coupon.validUntil} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Button Link URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="url" name="buttonUrl" value={coupon.buttonUrl} onChange={handleChange} placeholder="https://yourstore.com" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Button Text</label>
                  <input type="text" name="buttonText" value={coupon.buttonText} onChange={handleChange} placeholder="Redeem Now" className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2 & 3: DESIGN & SETTINGS */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'design' ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('design', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'design' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">2. Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize colors</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'design' ? 'rotate-180 text-orange-500' : ''}`} />
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

        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'settings' ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('settings', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'settings' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">3. Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name your campaign</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'settings' ? 'rotate-180 text-orange-500' : ''}`} />
          </button>
          {openSection === 'settings' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Code Name</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Summer Sale 2024" className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm" />
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !coupon.companyName || !coupon.couponCode}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isLoading ? 'Generating...' : <><Check className="w-5 h-5" /> Complete setup</>}
        </button>
      </div>
    </div>
  );
};

export default CouponQRForm;