/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Share2, User, Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Globe } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const SocialQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Social Media QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, createQRCode } = useQRStore();

  const [profile, setProfile] = useState({ name: '', headline: '' });
  const [socials, setSocials] = useState({
    instagram: '', twitter: '', facebook: '', linkedin: '', youtube: '', github: '', website: ''
  });
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: 'https://klink.com/preview-social', fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [profile, socials, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleSocialChange = (e) => {
    setSocials({ ...socials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!profile.name) { setError('Please enter a profile name.'); return; }

    const cleanedSocials = Object.fromEntries(
      Object.entries(socials)
        .filter(([_, v]) => v.trim() !== '')
        .map(([k, v]) => [k, /^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`])
    );

    if (Object.keys(cleanedSocials).length === 0) {
      setError('Please add at least one social media link.');
      return;
    }

    const result = await createQRCode({
      title: title || `${profile.name}'s Socials`,
      qrType: 'Social Media',
      content: { profile, socials: cleanedSocials },
    });

    if (result.success) {
      setProfile({ name: '', headline: '' });
      setSocials({ instagram: '', twitter: '', facebook: '', linkedin: '', youtube: '', github: '', website: '' });
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Share2} iconColor="text-sky-500" label="Social Media" accentColor="sky" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!profile.name} error={error}>
      <Section icon={Share2} title="Content" subtitle="Add your profiles" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="sky">
        <div className="space-y-4">
          <Field label="Profile Name" required icon={User}>
            <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="Your Name or Brand" className={inputWithIconClass('sky')} required />
          </Field>
          <Field label="Headline (Optional)">
            <input type="text" value={profile.headline} onChange={(e) => setProfile({...profile, headline: e.target.value})} placeholder="Content Creator & Developer" className={inputClass('sky')} />
          </Field>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Social Links</h4>
          {[
            { name: 'instagram', icon: Instagram, color: 'text-pink-500', placeholder: 'Instagram URL' },
            { name: 'twitter', icon: Twitter, color: 'text-sky-500', placeholder: 'Twitter/X URL' },
            { name: 'linkedin', icon: Linkedin, color: 'text-blue-600', placeholder: 'LinkedIn URL' },
            { name: 'youtube', icon: Youtube, color: 'text-red-500', placeholder: 'YouTube Channel URL' },
            { name: 'facebook', icon: Facebook, color: 'text-blue-500', placeholder: 'Facebook URL' },
            { name: 'github', icon: Github, color: 'text-slate-800 dark:text-white', placeholder: 'GitHub Profile URL' },
            { name: 'website', icon: Globe, color: 'text-emerald-500', placeholder: 'Personal Website URL' },
          ].map((platform) => (
            <div key={platform.name} className="relative flex items-center">
              <div className="absolute left-3 flex items-center justify-center">
                <platform.icon className={`h-5 w-5 ${platform.color}`} />
              </div>
              <input
                type="url"
                name={platform.name}
                value={socials[platform.name]}
                onChange={handleSocialChange}
                placeholder={platform.placeholder}
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm text-slate-900 dark:text-white outline-none transition-all shadow-sm"
              />
            </div>
          ))}
        </div>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="sky" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="sky" />
    </FormShell>
  );
};

export default SocialQRForm;
