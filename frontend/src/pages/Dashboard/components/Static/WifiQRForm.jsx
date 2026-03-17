/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore'; // <-- Added import
import { BuilderContext } from '../../Dashboard'; 
import { 
  ArrowLeft, Wifi, AlertCircle, 
  Settings2, Palette, ChevronDown, Check
} from 'lucide-react';
import TemplatePicker from '../TemplatePicker';

const WifiQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
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
  const [networkName, setNetworkName] = useState(''); // SSID
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA'); // WPA, WEP, or nopass
  const [isHidden, setIsHidden] = useState(false);
  const [openSection, setOpenSection] = useState('content');

  // Function to construct the standard WIFI string format
  const getWifiString = () => {
    if (!networkName) return "";
    // Format: WIFI:T:<WEP|WPA|nopass>;S:<SSID>;P:<PASSWORD>;H:<true|false>;;
    const encType = encryption === 'None' ? 'nopass' : encryption;
    return `WIFI:T:${encType};S:${networkName};P:${password};H:${isHidden ? 'true' : 'false'};;`;
  };

  const wifiString = getWifiString();

  // Sync Accordions to Topbar Clicks
  useEffect(() => {
    if (builderStep === 2) setOpenSection('content');
    if (builderStep === 3) setOpenSection('design');
  }, [builderStep]);

  // Sync Live Preview upwards whenever content or design changes
  useEffect(() => {
    if (onLiveUpdate) {
      onLiveUpdate({ url: networkName ? wifiString : "", fgColor, bgColor, title });
    }
  }, [wifiString, fgColor, bgColor, title, networkName]);

  const handleSectionToggle = (sectionName, stepNumber) => {
    setOpenSection(sectionName);
    setBuilderStep(stepNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!networkName) {
      setError("Please enter a Network Name (SSID)");
      handleSectionToggle('content', 2);
      return;
    }
    
    // 3. Call the store's action to save it to the backend
    const result = await createQRCode({
      title: title || `${networkName} Wi-Fi`,
      qrType: 'Wi-Fi',
      content: wifiString, 
    });

    if (result.success) {
      // Pass the raw WIFI string to the generator
      onGenerated(wifiString);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-medium">
            <Wifi className="w-5 h-5 text-blue-500" />
            Wi-Fi QR (Static)
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
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'content' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button 
            type="button"
            onClick={() => handleSectionToggle('content', 2)}
            className="w-full flex items-center justify-between p-5 text-left bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'content' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">1. Content</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter network details</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'content' ? 'rotate-180 text-blue-500' : ''}`} />
          </button>
          
          {openSection === 'content' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Network Name (SSID) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  placeholder="e.g., Home_Network_5G" 
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Encryption</label>
                  <select
                    value={encryption}
                    onChange={(e) => setEncryption(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="None">None (Open Network)</option>
                  </select>
                </div>

                {encryption !== 'None' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Network password" 
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  This is a hidden network
                </span>
              </label>
            </div>
          )}
        </div>

        {/* SECTION 2: DESIGN */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'design' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button 
            type="button"
            onClick={() => handleSectionToggle('design', 3)}
            className="w-full flex items-center justify-between p-5 text-left bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'design' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">2. Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize colors</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'design' ? 'rotate-180 text-blue-500' : ''}`} />
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
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'settings' ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button 
            type="button"
            onClick={() => handleSectionToggle('settings', 3)}
            className="w-full flex items-center justify-between p-5 text-left bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'settings' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">3. Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name your code</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'settings' ? 'rotate-180 text-blue-500' : ''}`} />
          </button>
          
          {openSection === 'settings' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Code Name</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Guest House Wi-Fi" 
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={isLoading|| !networkName}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <span className="animate-spin -ml-1 mr-2 h-5 w-5 text-white">...</span>
          ) : (
            <Check className="w-5 h-5" />
          )}
          {isLoading ? 'Generating...' : 'Complete setup'}
        </button>
      </div>
    </div>
  );
};

export default WifiQRForm;