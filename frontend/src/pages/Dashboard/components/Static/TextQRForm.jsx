/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Type } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const TextQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Text QR');
  const { fgColor, bgColor, title, isLoading, error, setError, createQRCode } = useQRStore();
  const [text, setText] = useState('');
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: text, fgColor, bgColor, title });
  }, [text, fgColor, bgColor, title]);

  const handleSubmit = async () => {
    setError(null);

    if (!text) {
      setError('Please enter some text.');
      return;
    }

    const result = await createQRCode({
      title: title || 'My Text QR',
      qrType: 'Text',
      targetUrl: text,
      content: text,
    });

    if (result.success) {
      setText('');
      onGenerated(text);
    }
  };

  return (
    <FormShell icon={Type} iconColor="text-blue-500" label="Plain Text QR (Static)" accentColor="blue" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!text} error={error}>
      <Section icon={Type} title="Content" subtitle="Enter the text to display" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="blue">
        <Field label="Your Text" required>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hello, world! Type any message here..."
            className={`${inputClass('blue')} min-h-[120px] resize-y`}
            required
          />
        </Field>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="blue" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="blue" />
    </FormShell>
  );
};

export default TextQRForm;
