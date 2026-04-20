/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Link as LinkIcon, Globe } from 'lucide-react';
import UTMBuilder from '../../../../components/UTMBuilder';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const WebsiteQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Website QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, createQRCode } = useQRStore();

  const [url, setUrl] = useState('');
  const [utmUrl, setUtmUrl] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxScans, setMaxScans] = useState('');
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [url, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!url) { setError('Please enter a destination URL.'); return; }
    try { new URL(url); } catch { setError('Please enter a valid URL (e.g., https://example.com).'); return; }

    const result = await createQRCode({
      title: title || 'My Website QR',
      qrType: 'Website',
      targetUrl: utmUrl || url,
      description: description || undefined,
      expiresAt: expiresAt || undefined,
      maxScans: maxScans ? parseInt(maxScans, 10) : undefined,
    });

    if (result.success) {
      setUrl(''); setUtmUrl(''); setDescription(''); setExpiresAt(''); setMaxScans('');
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Globe} iconColor="text-blue-500" label="Website QR" accentColor="blue" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!url} error={error}>

      <Section icon={LinkIcon} title="Destination" subtitle="Where should this QR code point?" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="blue">
        <Field label="Website URL" required>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={inputClass('blue')} required />
        </Field>
        {url && <UTMBuilder baseUrl={url} onUrlChange={setUtmUrl} />}
      </Section>

      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="blue" />

      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="blue" description={description} setDescription={setDescription} expiresAt={expiresAt} setExpiresAt={setExpiresAt} maxScans={maxScans} setMaxScans={setMaxScans} />

    </FormShell>
  );
};

export default WebsiteQRForm;
