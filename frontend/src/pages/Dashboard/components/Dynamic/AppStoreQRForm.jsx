/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Smartphone, Apple, Play, Globe, Box } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const AppStoreQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('App Store QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, createQRCode } = useQRStore();

  const [appData, setAppData] = useState({
    appName: '', developer: '', description: '', iosLink: '', androidLink: '', websiteLink: ''
  });
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: 'https://klink.com/preview-app', fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [appData, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleChange = (e) => {
    setAppData({ ...appData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!appData.appName) { setError('App Name is required.'); return; }
    if (!appData.iosLink && !appData.androidLink) {
      setError('Please provide at least one store link (iOS or Android).');
      return;
    }

    const result = await createQRCode({
      title: title || `${appData.appName} App`,
      qrType: 'App Store',
      content: appData,
    });

    if (result.success) {
      setAppData({ appName: '', developer: '', description: '', iosLink: '', androidLink: '', websiteLink: '' });
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Smartphone} iconColor="text-teal-500" label="App Store Links" accentColor="teal" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!appData.appName || (!appData.iosLink && !appData.androidLink)} error={error}>
      <Section icon={Smartphone} title="App Details" subtitle="Enter app info and links" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="teal">
        <div className="space-y-4">
          <Field label="App Name" required icon={Box}>
            <input type="text" name="appName" value={appData.appName} onChange={handleChange} className={inputWithIconClass('teal')} required />
          </Field>
          <Field label="Developer / Company Name">
            <input type="text" name="developer" value={appData.developer} onChange={handleChange} className={inputClass('teal')} />
          </Field>
          <Field label="Short Description">
            <textarea name="description" value={appData.description} onChange={handleChange} rows="2" placeholder="What does your app do?" className={`${inputClass('teal')} resize-none`}></textarea>
          </Field>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Store Links</h4>
          <Field label="Apple App Store URL" icon={Apple}>
            <input type="url" name="iosLink" value={appData.iosLink} onChange={handleChange} placeholder="https://apps.apple.com/..." className={inputWithIconClass('teal')} />
          </Field>
          <Field label="Google Play Store URL" icon={Play}>
            <input type="url" name="androidLink" value={appData.androidLink} onChange={handleChange} placeholder="https://play.google.com/..." className={inputWithIconClass('teal')} />
          </Field>
          <Field label="Website URL (Fallback)" icon={Globe}>
            <input type="url" name="websiteLink" value={appData.websiteLink} onChange={handleChange} placeholder="https://" className={inputWithIconClass('teal')} />
          </Field>
        </div>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="teal" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="teal" />
    </FormShell>
  );
};

export default AppStoreQRForm;
