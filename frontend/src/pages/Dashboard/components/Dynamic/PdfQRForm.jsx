/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import useQRStore from '../../../../store/qrStore';
import { FileText, UploadCloud, X, Link as LinkIcon } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const PdfQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('PDF QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, setTitle, createQRCode, createQRWithFileAction } = useQRStore();

  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const { openSections, toggle } = useFormSections();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const displayUrl = pdfUrl || (file ? 'https://klink.com/preview-pdf' : '');
    onLiveUpdate?.({ url: displayUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [file, pdfUrl, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      if (!title) setTitle(selectedFile.name.replace('.pdf', ''));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (uploadMode === 'file' && !file) { setError('Please upload a PDF file'); return; }
    if (uploadMode === 'url' && !pdfUrl) { setError('Please enter a PDF URL'); return; }
    setError(null);

    let result;
    if (uploadMode === 'file') {
      result = await createQRWithFileAction(file, title || 'My PDF QR', 'PDF');
    } else {
      result = await createQRCode({ title: title || 'My PDF QR', qrType: 'PDF', targetUrl: pdfUrl });
    }

    if (result.success) {
      setFile(null);
      setPdfUrl('');
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={FileText} iconColor="text-red-500" label="PDF QR" accentColor="red" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={(uploadMode === 'file' && !file) || (uploadMode === 'url' && !pdfUrl)} error={error}>
      <Section icon={FileText} title="Content" subtitle="Upload or link your PDF" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="red">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg w-full max-w-sm">
          <button onClick={() => setUploadMode('file')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            Upload File
          </button>
          <button onClick={() => setUploadMode('url')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            External Link
          </button>
        </div>

        {uploadMode === 'file' ? (
          <Field label="Upload PDF Document" required>
            {!file ? (
              <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 bg-white dark:bg-slate-950 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">PDF up to 10MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </Field>
        ) : (
          <Field label="Direct PDF URL" required icon={LinkIcon}>
            <input type="url" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://example.com/document.pdf" className={inputWithIconClass('red')} required />
          </Field>
        )}
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="red" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="red" />
    </FormShell>
  );
};

export default PdfQRForm;
