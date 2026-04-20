/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Image as ImageIcon, UploadCloud, X, Link as LinkIcon } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const ImageQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Image QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, setTitle, createQRCode, createQRWithFileAction } = useQRStore();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const { openSections, toggle } = useFormSections();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const displayUrl = imageUrl || (file ? 'https://klink.com/preview-image' : '');
    onLiveUpdate?.({ url: displayUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [file, imageUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
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
    if (uploadMode === 'file' && !file) { setError('Please upload an image file'); return; }
    if (uploadMode === 'url' && !imageUrl) { setError('Please enter an image URL'); return; }
    setError(null);

    let result;
    if (uploadMode === 'file') {
      result = await createQRWithFileAction(file, title || 'My Image QR', 'Images');
    } else {
      result = await createQRCode({ title: title || 'My Image QR', qrType: 'Images', targetUrl: imageUrl });
    }

    if (result.success) {
      setFile(null);
      setPreviewUrl(null);
      setImageUrl('');
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={ImageIcon} iconColor="text-indigo-500" label="Image QR" accentColor="indigo" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={(uploadMode === 'file' && !file) || (uploadMode === 'url' && !imageUrl)} error={error}>
      <Section icon={ImageIcon} title="Content" subtitle="Upload your image" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="indigo">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full max-w-sm">
          <button onClick={() => setUploadMode('file')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            Upload Image
          </button>
          <button onClick={() => setUploadMode('url')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            External Link
          </button>
        </div>

        {uploadMode === 'file' ? (
          <Field label="Upload Photo" required>
            {!file ? (
              <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-950 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Click to browse or drag and drop</p>
                <p className="text-xs text-slate-500">JPG, PNG, or WEBP up to 10MB</p>
              </div>
            ) : (
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                <div className="h-40 w-full bg-slate-100 dark:bg-slate-900 relative flex justify-center">
                  <img src={previewUrl} alt="Preview" className="h-full max-w-full object-contain" />
                  <button onClick={clearFile} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-md backdrop-blur-sm transition-colors">
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
        ) : (
          <Field label="Direct Image URL" required icon={LinkIcon}>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className={inputWithIconClass('indigo')} required />
          </Field>
        )}
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="indigo" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="indigo" />
    </FormShell>
  );
};

export default ImageQRForm;
