/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Video as VideoIcon, UploadCloud, X, Youtube } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const VideoQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Video QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, setTitle, createQRCode, createQRWithFileAction } = useQRStore();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('url');
  const { openSections, toggle } = useFormSections();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const displayUrl = videoUrl || (file ? 'https://klink.com/preview-video' : '');
    onLiveUpdate?.({ url: displayUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [file, videoUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file (MP4, WebM).');
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError('Video file size must be less than 20MB.');
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
    if (uploadMode === 'file' && !file) { setError('Please upload a video file'); return; }
    if (uploadMode === 'url' && !videoUrl) { setError('Please enter a video URL'); return; }
    setError(null);

    let result;
    if (uploadMode === 'file') {
      result = await createQRWithFileAction(file, title || 'My Video QR', 'Video');
    } else {
      result = await createQRCode({ title: title || 'My Video QR', qrType: 'Video', targetUrl: videoUrl });
    }

    if (result.success) {
      setFile(null);
      setPreviewUrl(null);
      setVideoUrl('');
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={VideoIcon} iconColor="text-rose-500" label="Video QR" accentColor="rose" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={(uploadMode === 'file' && !file) || (uploadMode === 'url' && !videoUrl)} error={error}>
      <Section icon={VideoIcon} title="Content" subtitle="Link or upload a video" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="rose">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full max-w-sm">
          <button onClick={() => setUploadMode('url')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            YouTube / Link
          </button>
          <button onClick={() => setUploadMode('file')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            Upload MP4
          </button>
        </div>

        {uploadMode === 'url' ? (
          <Field label="Video URL" required icon={Youtube} hint="Paste a link from YouTube, Vimeo, or a direct MP4 URL.">
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputWithIconClass('rose')} required />
          </Field>
        ) : (
          <Field label="Upload Video" required>
            {!file ? (
              <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 bg-white dark:bg-slate-950 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <input type="file" accept="video/mp4, video/webm" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Click to browse or drag and drop</p>
                <p className="text-xs text-slate-500">MP4 or WebM up to 20MB</p>
              </div>
            ) : (
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                <div className="w-full bg-slate-950 relative aspect-video flex justify-center">
                  <video src={previewUrl} controls className="h-full max-w-full object-contain" />
                  <button onClick={clearFile} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-md backdrop-blur-sm transition-colors z-10">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="truncate pr-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}
          </Field>
        )}
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="rose" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="rose" />
    </FormShell>
  );
};

export default VideoQRForm;
