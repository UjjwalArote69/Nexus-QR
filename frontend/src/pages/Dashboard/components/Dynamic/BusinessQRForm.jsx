/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Store, Building2, Phone, Mail, Globe, MapPin, Clock } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const BusinessQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Business QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, createQRCode } = useQRStore();

  const [business, setBusiness] = useState({
    companyName: '', headline: '', about: '', phone: '', email: '', website: '', address: '', openingHours: 'Mon - Fri: 9:00 AM - 5:00 PM'
  });
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: 'https://klink.com/preview-business', fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [business, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleChange = (e) => {
    setBusiness({ ...business, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!business.companyName) { setError('Company Name is required.'); return; }
    if (!business.phone && !business.email && !business.website) {
      setError('Please provide at least one contact method (phone, email, or website).');
      return;
    }

    const result = await createQRCode({
      title: title || `${business.companyName} Profile`,
      qrType: 'Business',
      content: business,
    });

    if (result.success) {
      setBusiness({ companyName: '', headline: '', about: '', phone: '', email: '', website: '', address: '', openingHours: 'Mon - Fri: 9:00 AM - 5:00 PM' });
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Store} iconColor="text-blue-500" label="Business Page" accentColor="blue" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!business.companyName} error={error}>
      <Section icon={Store} title="Business Details" subtitle="Enter company information" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="blue">
        <div className="space-y-4">
          <Field label="Company Name" required icon={Building2}>
            <input type="text" name="companyName" value={business.companyName} onChange={handleChange} className={inputWithIconClass('blue')} required />
          </Field>
          <Field label="Headline / Slogan">
            <input type="text" name="headline" value={business.headline} onChange={handleChange} placeholder="e.g., Your Trusted Tech Partner" className={inputClass('blue')} />
          </Field>
          <Field label="About Us">
            <textarea name="about" value={business.about} onChange={handleChange} rows="3" placeholder="A brief description of what you do..." className={`${inputClass('blue')} resize-none`}></textarea>
          </Field>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" icon={Phone}>
            <input type="tel" name="phone" value={business.phone} onChange={handleChange} className={inputWithIconClass('blue')} />
          </Field>
          <Field label="Email" icon={Mail}>
            <input type="email" name="email" value={business.email} onChange={handleChange} className={inputWithIconClass('blue')} />
          </Field>
        </div>

        <Field label="Website" icon={Globe}>
          <input type="url" name="website" value={business.website} onChange={handleChange} placeholder="https://" className={inputWithIconClass('blue')} />
        </Field>

        <Field label="Physical Address" icon={MapPin}>
          <input type="text" name="address" value={business.address} onChange={handleChange} placeholder="123 Business St, City" className={inputWithIconClass('blue')} />
        </Field>

        <Field label="Opening Hours" icon={Clock}>
          <input type="text" name="openingHours" value={business.openingHours} onChange={handleChange} placeholder="e.g., Mon-Fri: 9am-5pm" className={inputWithIconClass('blue')} />
        </Field>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="blue" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="blue" />
    </FormShell>
  );
};

export default BusinessQRForm;
