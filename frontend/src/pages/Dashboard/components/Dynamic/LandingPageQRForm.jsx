/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { LayoutTemplate, Type, AlignLeft, Link as LinkIcon, Image as ImageIcon, MousePointerClick } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const LandingPageQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Landing Page QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, createQRCode } = useQRStore();

  const [pageData, setPageData] = useState({
    companyName: '', headline: '', description: '', heroImageUrl: '', buttonText: 'Learn More', buttonUrl: ''
  });
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: 'https://klink.com/preview-landing', fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [pageData, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleChange = (e) => {
    setPageData({ ...pageData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!pageData.headline) { setError('Headline is required.'); return; }
    if (!pageData.buttonUrl) { setError('Button destination URL is required.'); return; }
    try { new URL(pageData.buttonUrl); } catch {
      setError('Please enter a valid button URL (e.g., https://example.com).');
      return;
    }

    const result = await createQRCode({
      title: title || `${pageData.companyName || 'Promo'} Landing Page`,
      qrType: 'Landing page',
      content: pageData,
    });

    if (result.success) {
      setPageData({ companyName: '', headline: '', description: '', heroImageUrl: '', buttonText: 'Learn More', buttonUrl: '' });
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={LayoutTemplate} iconColor="text-orange-500" label="Landing Page" accentColor="orange" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!pageData.headline || !pageData.buttonUrl} error={error}>
      <Section icon={LayoutTemplate} title="Content" subtitle="Build your page" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="orange">
        <div className="space-y-4">
          <Field label="Brand / Company Name">
            <input type="text" name="companyName" value={pageData.companyName} onChange={handleChange} placeholder="Optional branding" className={inputClass('orange')} />
          </Field>
          <Field label="Headline" required icon={Type}>
            <input type="text" name="headline" value={pageData.headline} onChange={handleChange} placeholder="E.g., Big Summer Sale!" className={inputWithIconClass('orange')} required />
          </Field>
          <Field label="Description" icon={AlignLeft}>
            <textarea name="description" value={pageData.description} onChange={handleChange} rows="3" placeholder="Tell them what they're getting..." className={`${inputWithIconClass('orange')} resize-none`}></textarea>
          </Field>
          <Field label="Hero Image URL (Optional)" icon={ImageIcon}>
            <input type="url" name="heroImageUrl" value={pageData.heroImageUrl} onChange={handleChange} placeholder="https://..." className={inputWithIconClass('orange')} />
          </Field>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Call to Action</h4>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Button Text" required icon={MousePointerClick}>
              <input type="text" name="buttonText" value={pageData.buttonText} onChange={handleChange} placeholder="Buy Now" className={inputWithIconClass('orange')} required />
            </Field>
            <Field label="Destination URL" required icon={LinkIcon}>
              <input type="url" name="buttonUrl" value={pageData.buttonUrl} onChange={handleChange} placeholder="https://" className={inputWithIconClass('orange')} required />
            </Field>
          </div>
        </div>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="orange" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="orange" />
    </FormShell>
  );
};

export default LandingPageQRForm;
