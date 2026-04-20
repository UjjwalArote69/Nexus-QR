/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { MessageSquare, Phone, AlignLeft } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const SmsQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('SMS QR');
  const { fgColor, bgColor, title, isLoading, error, setError, createQRCode } = useQRStore();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
    const url = cleanPhone
      ? (message ? `sms:${cleanPhone}?body=${encodeURIComponent(message)}` : `sms:${cleanPhone}`)
      : '';
    onLiveUpdate?.({ url, fgColor, bgColor, title });
  }, [phone, message, fgColor, bgColor, title]);

  const handleSubmit = async () => {
    setError(null);

    if (!phone.trim()) {
      setError('Please enter a destination phone number.');
      return;
    }

    if (!/^[+\d][\d\s\-()]{6,}$/.test(phone.trim())) {
      setError('Please enter a valid phone number (e.g., +1 234 567 8900).');
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
    const smsUri = message
      ? `sms:${cleanPhone}?body=${encodeURIComponent(message)}`
      : `sms:${cleanPhone}`;

    const result = await createQRCode({
      title: title || 'My SMS QR',
      qrType: 'SMS',
      targetUrl: smsUri,
      content: { phone: cleanPhone, message },
    });

    if (result.success) {
      setPhone('');
      setMessage('');
      onGenerated(smsUri);
    }
  };

  return (
    <FormShell icon={MessageSquare} iconColor="text-green-500" label="SMS / Text Message" accentColor="green" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!phone.trim()} error={error}>
      <Section icon={MessageSquare} title="Content" subtitle="Set up your text message" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="green">
        <Field label="Phone Number" required icon={Phone}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 8900"
            className={inputWithIconClass('green')}
            required
          />
        </Field>
        <Field label="Pre-filled Message" icon={AlignLeft}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="3"
            placeholder="e.g., I'm interested in your services!"
            className={`${inputWithIconClass('green')} resize-none`}
          />
        </Field>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="green" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="green" />
    </FormShell>
  );
};

export default SmsQRForm;
