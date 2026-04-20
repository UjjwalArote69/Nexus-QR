/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Mail } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const EmailQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Email QR');
  const { fgColor, bgColor, title, isLoading, error, setError, createQRCode } = useQRStore();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: email ? `mailto:${email}` : '', fgColor, bgColor, title });
  }, [email, subject, message, fgColor, bgColor, title]);

  const handleSubmit = async () => {
    setError(null);

    if (!email) {
      setError('Please enter an email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }

    const result = await createQRCode({
      title: title || 'My Email QR',
      qrType: 'Email',
      content: { email, subject, message },
    });

    if (result.success) {
      setEmail('');
      setSubject('');
      setMessage('');
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Mail} iconColor="text-blue-500" label="Email QR" accentColor="blue" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!email} error={error}>
      <Section icon={Mail} title="Content" subtitle="Enter email address and message details" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="blue">
        <Field label="Email Address" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            className={inputClass('blue')}
            required
          />
        </Field>
        <Field label="Subject">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Inquiry from QR Code"
            className={inputClass('blue')}
          />
        </Field>
        <Field label="Message">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your pre-filled message here..."
            className={`${inputClass('blue')} min-h-[100px] resize-y`}
          />
        </Field>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="blue" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="blue" />
    </FormShell>
  );
};

export default EmailQRForm;
