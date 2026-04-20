/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { AlignJustify, Plus, Trash2, Link as LinkIcon, User } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const LinksQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Links QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, createQRCode } = useQRStore();

  const [profile, setProfile] = useState({ name: '', bio: '' });
  const [links, setLinks] = useState([{ id: 1, title: 'My Website', url: '' }]);
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: 'https://klink.com/preview-links', fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [profile, links, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const addLink = () => {
    setLinks([...links, { id: Date.now(), title: '', url: '' }]);
  };

  const removeLink = (id) => {
    if (links.length > 1) {
      const link = links.find(l => l.id === id);
      const hasContent = link?.title || link?.url;
      if (hasContent && !window.confirm(`Remove link "${link.title || 'Untitled'}"?`)) return;
      setLinks(links.filter(l => l.id !== id));
    }
  };

  const updateLink = (id, field, value) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!profile.name) { setError('Please enter a profile name.'); return; }

    const firstBadLink = links.find(l => !l.url || !l.title);
    if (firstBadLink) {
      const idx = links.indexOf(firstBadLink) + 1;
      setError(`Link #${idx} is missing a ${!firstBadLink.title ? 'title' : 'URL'}. Please fill in all fields.`);
      return;
    }

    const result = await createQRCode({
      title: title || `${profile.name}'s Links`,
      qrType: 'List of links',
      content: { profile, links },
    });

    if (result.success) {
      setProfile({ name: '', bio: '' });
      setLinks([{ id: 1, title: 'My Website', url: '' }]);
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={AlignJustify} iconColor="text-fuchsia-500" label="List of Links" accentColor="fuchsia" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!profile.name} error={error}>
      <Section icon={AlignJustify} title="Content" subtitle="Setup your Link-in-Bio" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="fuchsia">
        {/* Profile Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Profile Header</h4>
          <Field label="Page Name" required icon={User}>
            <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="e.g., Klink Official" className={inputWithIconClass('fuchsia')} required />
          </Field>
          <Field label="Short Bio / Description">
            <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} placeholder="Welcome to my links!" rows="2" className={`${inputClass('fuchsia')} resize-none`}></textarea>
          </Field>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Dynamic Links List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Your Links</h4>
            <button type="button" onClick={addLink} className="flex items-center gap-1 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 transition-colors bg-fuchsia-50 dark:bg-fuchsia-900/20 px-2 py-1 rounded">
              <Plus className="w-3 h-3" /> Add Link
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={link.id} className="flex gap-2 items-start p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                <div className="flex-1 space-y-2.5">
                  <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} placeholder="Link Title (e.g., Instagram)" className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-fuchsia-500 rounded text-sm text-slate-900 dark:text-white outline-none transition-colors" />
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input type="url" value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} placeholder="https://" className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-fuchsia-500 rounded text-sm text-slate-900 dark:text-white outline-none transition-colors" />
                  </div>
                </div>
                <button type="button" onClick={() => removeLink(link.id)} disabled={links.length === 1} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="fuchsia" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="fuchsia" />
    </FormShell>
  );
};

export default LinksQRForm;
