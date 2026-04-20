/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Music, UploadCloud, X, PlayCircle } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const Mp3QRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('MP3 QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, setTitle, createQRCode, createQRWithFileAction } = useQRStore();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const { openSections, toggle } = useFormSections();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const displayUrl = audioUrl || (file ? 'https://klink.com/preview-audio' : '');
    onLiveUpdate?.({ url: displayUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [file, audioUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

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

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (uploadMode === 'file' && !file) { setError('Please upload an audio file'); return; }
    if (uploadMode === 'url' && !audioUrl) { setError('Please enter an audio URL'); return; }
    setError(null);

    let result;
    if (uploadMode === 'file') {
      result = await createQRWithFileAction(file, title || 'My Audio QR', 'MP3');
    } else {
      result = await createQRCode({ title: title || 'My Audio QR', qrType: 'MP3', targetUrl: audioUrl });
    }

    if (result.success) {
      setFile(null);
      setPreviewUrl(null);
      setAudioUrl('');
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Music} iconColor="text-amber-500" label="MP3 / Audio QR" accentColor="amber" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={(uploadMode === 'file' && !file) || (uploadMode === 'url' && !audioUrl)} error={error}>
      <Section icon={Music} title="Content" subtitle="Upload or link your track" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="amber">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full max-w-sm">
          <button onClick={() => setUploadMode('file')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            Upload MP3
          </button>
          <button onClick={() => setUploadMode('url')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            External Link
          </button>
        </div>

        {uploadMode === 'file' ? (
          <Field label="Upload Audio" required>
            {!file ? (
              <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-950 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <input type="file" accept="audio/mp3, audio/wav, audio/mpeg" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
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
                  <button onClick={clearFile} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <audio controls src={previewUrl} className="w-full h-10 outline-none" />
              </div>
            )}
          </Field>
        ) : (
          <Field label="Audio/Podcast URL" required icon={PlayCircle} hint="Paste a link to Spotify, SoundCloud, Apple Podcasts, or a direct MP3 URL.">
            <input type="url" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://soundcloud.com/..." className={inputWithIconClass('amber')} required />
          </Field>
        )}
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="amber" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="amber" />
    </FormShell>
  );
};

export default Mp3QRForm;
