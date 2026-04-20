/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Contact, User, Building2, Phone, Mail, Globe, MapPin, LayoutTemplate } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, inputWithIconClass, useFormSections } from '../FormKit';
import VCardTemplatePicker from './VCardTemplatePicker';
import usePageTitle from '../../../../hooks/usePageTitle';

const VCardQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('vCard QR');
  const { fgColor, bgColor, title, isLoading, error, setError, createQRCode, uploadImage } = useQRStore();

  const [contactData, setContactData] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    company: '', jobTitle: '', website: '', address: '', avatar: '',
  });
  const [template, setTemplate] = useState('default');
  const [isUploading, setIsUploading] = useState(false);
  const { openSections, toggle } = useFormSections({ content: true, template: true, design: false, settings: false });

  useEffect(() => {
    onLiveUpdate?.({ url: 'https://klink.com/preview-vcard', fgColor, bgColor, title, meta: { template } });
  }, [contactData, fgColor, bgColor, title, template]);

  const set = (key, value) => setContactData(prev => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const result = await uploadImage(file);
    if (result.success) set('avatar', result.imageUrl);
    setIsUploading(false);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!contactData.firstName || !contactData.phone) {
      setError('First name and phone number are required.'); return;
    }

    const result = await createQRCode({
      title: title || `${contactData.firstName}'s vCard`,
      qrType: 'vCard Plus',
      content: { ...contactData, template },
    });

    if (result.success) {
      setContactData({ firstName: '', lastName: '', phone: '', email: '', company: '', jobTitle: '', website: '', address: '', avatar: '' });
      setTemplate('default');
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Contact} iconColor="text-emerald-500" label="vCard Plus" accentColor="emerald" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!contactData.firstName || !contactData.phone} error={error}>

      {/* ── Template Selection ── */}
      <Section icon={LayoutTemplate} title="Select Template" subtitle="Choose how your digital card will look" isOpen={openSections.template} onToggle={() => toggle('template')} accentColor="emerald">
        <VCardTemplatePicker value={template} onChange={setTemplate} />
      </Section>

      {/* ── Contact Info ── */}
      <Section icon={Contact} title="Contact Info" subtitle="Enter the details for your digital card" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="emerald">

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {contactData.avatar
              ? <img src={contactData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              : <User className="w-5 h-5 text-slate-400" />
            }
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
              {isUploading ? 'Uploading...' : contactData.avatar ? 'Change photo' : 'Upload photo'}
            </label>
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" required icon={User}>
            <input type="text" value={contactData.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputWithIconClass('emerald')} />
          </Field>
          <Field label="Last Name">
            <input type="text" value={contactData.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputClass('emerald')} />
          </Field>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" required icon={Phone}>
            <input type="tel" value={contactData.phone} onChange={(e) => set('phone', e.target.value)} className={inputWithIconClass('emerald')} />
          </Field>
          <Field label="Email" icon={Mail}>
            <input type="email" value={contactData.email} onChange={(e) => set('email', e.target.value)} className={inputWithIconClass('emerald')} />
          </Field>
        </div>

        {/* Work */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company" icon={Building2}>
            <input type="text" value={contactData.company} onChange={(e) => set('company', e.target.value)} className={inputWithIconClass('emerald')} />
          </Field>
          <Field label="Job Title">
            <input type="text" value={contactData.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} className={inputClass('emerald')} />
          </Field>
        </div>

        <Field label="Website" icon={Globe}>
          <input type="url" value={contactData.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" className={inputWithIconClass('emerald')} />
        </Field>
        <Field label="Address" icon={MapPin}>
          <input type="text" value={contactData.address} onChange={(e) => set('address', e.target.value)} className={inputWithIconClass('emerald')} />
        </Field>

      </Section>

      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="emerald" />

      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="emerald" />

    </FormShell>
  );
};

export default VCardQRForm;
