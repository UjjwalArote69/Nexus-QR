/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useRef } from 'react';
import useQRStore from '../../../../store/qrStore'; // <-- Added store import
import { createQRWithFile } from '../../../../api/qrcode.api';
import { BuilderContext } from '../../Dashboard'; 
import { 
  ArrowLeft, Music, AlertCircle, UploadCloud, 
  Settings2, Palette, ChevronDown, Check, X, Link as LinkIcon, PlayCircle
} from 'lucide-react';
import TemplatePicker from '../TemplatePicker';

const Mp3QRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  const { builderStep, setBuilderStep } = useContext(BuilderContext);
  
  // 1. Pull common state and actions from the store
  const { 
    title, setTitle, 
    fgColor, setFgColor, 
    bgColor, setBgColor, 
    isLoading, error, setError,
    createQRCode // Used for the 'URL' mode
  } = useQRStore();

  // 2. Keep ONLY type-specific state local
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(''); 
  const [uploadMode, setUploadMode] = useState('file'); 
  const [openSection, setOpenSection] = useState('content');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (builderStep === 2) setOpenSection('content');
    if (builderStep === 3) setOpenSection('design');
  }, [builderStep]);

  useEffect(() => {
    if (onLiveUpdate) {
      const displayUrl = audioUrl || (file ? 'https://nexusqr.com/preview-audio' : '');
      onLiveUpdate({ url: displayUrl, fgColor, bgColor, title });
    }
  }, [file, audioUrl, fgColor, bgColor, title]);

  const handleSectionToggle = (sectionName, stepNumber) => {
    setOpenSection(sectionName);
    setBuilderStep(stepNumber);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please select a valid audio file (MP3, WAV).');
        return;
      }
      if (selectedFile.size > 15 * 1024 * 1024) { 
        setError('Audio file size must be less than 15MB.');
        return;
      }
      
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
      if (!title) setTitle(selectedFile.name.split('.')[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadMode === 'file' && !file) {
      setError("Please upload an audio file");
      handleSectionToggle('content', 2);
      return;
    }
    if (uploadMode === 'url' && !audioUrl) {
      setError("Please enter an audio URL");
      handleSectionToggle('content', 2);
      return;
    }

    setError(null);

    try {
      let result;

      if (uploadMode === 'file') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title || 'My Audio QR');
        formData.append('qrType', 'MP3');
        
        // Note: For file uploads, we use the specific API helper directly
        // but still utilize the store's error/loading management if needed.
        result = await createQRWithFile(formData);
      } else {
        // Use the centralized store action for the URL mode
        result = await createQRCode({
          title: title || 'My Audio QR',
          qrType: 'MP3',
          targetUrl: audioUrl,
        });
      }

      if (result.success) {
        onGenerated(result.qrLink);
      }
    } catch (err) {
      setError(err.message || "Something went wrong! Are you logged in?");
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
            <Music className="w-5 h-5 text-amber-500" />
            MP3 / Audio QR
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
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'content' ? 'border-amber-500 shadow-md ring-1 ring-amber-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('content', 2)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'content' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">1. Content</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload or link your track</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'content' ? 'rotate-180 text-amber-500' : ''}`} />
          </button>
          
          {openSection === 'content' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              
              <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full max-w-sm">
                <button 
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Upload MP3
                </button>
                <button 
                  onClick={() => setUploadMode('url')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  External Link
                </button>
              </div>

              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Audio <span className="text-amber-500">*</span></label>
                  {!file ? (
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-950 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                    >
                      <input 
                        type="file" 
                        accept="audio/mp3, audio/wav, audio/mpeg" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Click to browse or drag and drop</p>
                      <p className="text-xs text-slate-500">MP3 or WAV up to 15MB</p>
                    </div>
                  ) : (
                    <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 overflow-hidden pr-4">
                          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full shrink-0">
                            <Music className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          onClick={clearFile}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <audio controls src={previewUrl} className="w-full h-10 outline-none" />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Audio/Podcast URL <span className="text-amber-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PlayCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="url" 
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://soundcloud.com/..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                      required={uploadMode === 'url'}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Paste a link to Spotify, SoundCloud, Apple Podcasts, or a direct MP3 URL.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2 & 3: DESIGN & SETTINGS */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'design' ? 'border-amber-500 shadow-md ring-1 ring-amber-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('design', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'design' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">2. Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize colors</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'design' ? 'rotate-180 text-amber-500' : ''}`} />
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

        <div className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${openSection === 'settings' ? 'border-amber-500 shadow-md ring-1 ring-amber-500' : 'border-slate-200 dark:border-slate-800'}`}>
          <button type="button" onClick={() => handleSectionToggle('settings', 3)} className="w-full flex items-center justify-between p-5 text-left bg-transparent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openSection === 'settings' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">3. Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name your campaign</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === 'settings' ? 'rotate-180 text-amber-500' : ''}`} />
          </button>
          {openSection === 'settings' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">QR Code Name</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Podcast Episode 1" className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm" />
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={isLoading || (uploadMode === 'file' && !file) || (uploadMode === 'url' && !audioUrl)}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isLoading ? 'Generating...' : <><Check className="w-5 h-5" /> Complete setup</>}
        </button>
      </div>
    </div>
  );
};

export default Mp3QRForm;