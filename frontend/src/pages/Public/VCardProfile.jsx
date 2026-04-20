import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, Globe, MapPin, User, Download } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const VCardProfile = () => {
  usePageTitle('vCard');
  const { shortId } = useParams();
  const [profile, setProfile] = useState(null);
  const [template, setTemplate] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
        const { data } = await axios.get(`${apiBase}/qrcodes/public/${shortId}`);
        if (data.success && data.data?.content) {
          const c = data.data.content;
          setProfile({
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            jobTitle: c.jobTitle || '',
            company: c.company || '',
            phone: c.phone || '',
            email: c.email || '',
            website: c.website || '',
            address: c.address || '',
            avatar: c.avatar || null,
          });
          setTemplate(c.template || 'default');
        } else {
          setError('Contact profile not found.');
        }
      } catch {
        setError('Contact profile not found or inactive.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [shortId]);

  const handleSaveContact = () => {
    if (!profile) return;
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    const vcard = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `N:${profile.lastName || ''};${profile.firstName || ''};;;`,
      `FN:${fullName}`,
      profile.company ? `ORG:${profile.company}` : '',
      profile.jobTitle ? `TITLE:${profile.jobTitle}` : '',
      profile.phone ? `TEL;TYPE=WORK,VOICE:${profile.phone}` : '',
      profile.email ? `EMAIL;TYPE=PREF,INTERNET:${profile.email}` : '',
      profile.website ? `URL:${profile.website}` : '',
      profile.address ? `ADR;TYPE=intl,postal,parcel,work:;;${profile.address};;;;` : '',
      profile.avatar ? `PHOTO;VALUE=URI:${profile.avatar}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName || 'Contact'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <User className="w-10 h-10 text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-lg font-semibold text-slate-800">Profile Not Found</p>
        <p className="text-slate-400 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const hasWebsite = profile.website && profile.website !== 'null' && profile.website.trim();

  const ensureProtocol = (url) => {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  // ── Shared pieces ──

  const Avatar = ({ size = 80, className = '' }) => (
    <div className={`rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      {profile.avatar
        ? <img src={profile.avatar} alt={fullName} className="w-full h-full object-cover" />
        : <User className="text-slate-400" style={{ width: size * 0.38, height: size * 0.38 }} strokeWidth={1.5} />
      }
    </div>
  );

  const ContactRow = ({ icon: Icon, label, value, href, iconBg, iconColor, external }) => {
    if (!value) return null;
    const inner = (
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-slate-400 font-medium">{label}</p>
          <p className="text-[13px] font-medium text-slate-700 truncate">{value}</p>
        </div>
      </div>
    );
    return href ? <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="block">{inner}</a> : inner;
  };

  const ContactCards = ({ iconTheme = 'mixed' }) => {
    const themes = {
      mixed: {
        phone: { bg: 'bg-emerald-50', color: 'text-emerald-600' },
        email: { bg: 'bg-blue-50', color: 'text-blue-600' },
        website: { bg: 'bg-violet-50', color: 'text-violet-600' },
        address: { bg: 'bg-orange-50', color: 'text-orange-500' },
      },
      blue: {
        phone: { bg: 'bg-blue-50', color: 'text-blue-600' },
        email: { bg: 'bg-blue-50', color: 'text-blue-600' },
        website: { bg: 'bg-blue-50', color: 'text-blue-600' },
        address: { bg: 'bg-blue-50', color: 'text-blue-600' },
      },
      purple: {
        phone: { bg: 'bg-purple-50', color: 'text-purple-600' },
        email: { bg: 'bg-purple-50', color: 'text-purple-600' },
        website: { bg: 'bg-purple-50', color: 'text-purple-600' },
        address: { bg: 'bg-purple-50', color: 'text-purple-600' },
      },
      emerald: {
        phone: { bg: 'bg-emerald-50', color: 'text-emerald-600' },
        email: { bg: 'bg-emerald-50', color: 'text-emerald-600' },
        website: { bg: 'bg-emerald-50', color: 'text-emerald-600' },
        address: { bg: 'bg-emerald-50', color: 'text-emerald-600' },
      },
      amber: {
        phone: { bg: 'bg-amber-50', color: 'text-amber-600' },
        email: { bg: 'bg-amber-50', color: 'text-amber-600' },
        website: { bg: 'bg-amber-50', color: 'text-amber-600' },
        address: { bg: 'bg-amber-50', color: 'text-amber-600' },
      },
      slate: {
        phone: { bg: 'bg-slate-100', color: 'text-slate-500' },
        email: { bg: 'bg-slate-100', color: 'text-slate-500' },
        website: { bg: 'bg-slate-100', color: 'text-slate-500' },
        address: { bg: 'bg-slate-100', color: 'text-slate-500' },
      },
      indigo: {
        phone: { bg: 'bg-indigo-50', color: 'text-indigo-600' },
        email: { bg: 'bg-indigo-50', color: 'text-indigo-600' },
        website: { bg: 'bg-indigo-50', color: 'text-indigo-600' },
        address: { bg: 'bg-indigo-50', color: 'text-indigo-600' },
      },
      dark: {
        phone: { bg: 'bg-slate-800', color: 'text-teal-400' },
        email: { bg: 'bg-slate-800', color: 'text-teal-400' },
        website: { bg: 'bg-slate-800', color: 'text-teal-400' },
        address: { bg: 'bg-slate-800', color: 'text-teal-400' },
      },
      rose: {
        phone: { bg: 'bg-rose-50', color: 'text-rose-500' },
        email: { bg: 'bg-rose-50', color: 'text-rose-500' },
        website: { bg: 'bg-rose-50', color: 'text-rose-500' },
        address: { bg: 'bg-rose-50', color: 'text-rose-500' },
      },
      teal: {
        phone: { bg: 'bg-teal-50', color: 'text-teal-600' },
        email: { bg: 'bg-teal-50', color: 'text-teal-600' },
        website: { bg: 'bg-teal-50', color: 'text-teal-600' },
        address: { bg: 'bg-teal-50', color: 'text-teal-600' },
      },
    };
    const t = themes[iconTheme] || themes.mixed;
    return (
      <div className="space-y-1">
        <ContactRow icon={Phone} label="Phone" value={profile.phone} href={`tel:${profile.phone}`} iconBg={t.phone.bg} iconColor={t.phone.color} />
        <ContactRow icon={Mail} label="Email" value={profile.email} href={`mailto:${profile.email}`} iconBg={t.email.bg} iconColor={t.email.color} />
        <ContactRow icon={Globe} label="Website" value={hasWebsite ? profile.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null} href={hasWebsite ? ensureProtocol(profile.website) : null} iconBg={t.website.bg} iconColor={t.website.color} external />
        <ContactRow icon={MapPin} label="Address" value={profile.address} href={profile.address ? `https://maps.google.com/?q=${encodeURIComponent(profile.address)}` : null} iconBg={t.address.bg} iconColor={t.address.color} external />
      </div>
    );
  };

  const QuickActions = ({ color = 'text-blue-600', bg = 'bg-blue-50', hoverBg = 'hover:bg-blue-100' }) => (
    <div className="flex items-center justify-center gap-2">
      {profile.phone && <a href={`tel:${profile.phone}`} className={`p-2.5 rounded-xl ${bg} ${color} ${hoverBg} transition-colors`}><Phone className="w-4 h-4" strokeWidth={1.5} /></a>}
      {profile.email && <a href={`mailto:${profile.email}`} className={`p-2.5 rounded-xl ${bg} ${color} ${hoverBg} transition-colors`}><Mail className="w-4 h-4" strokeWidth={1.5} /></a>}
      {hasWebsite && <a href={ensureProtocol(profile.website)} target="_blank" rel="noreferrer" className={`p-2.5 rounded-xl ${bg} ${color} ${hoverBg} transition-colors`}><Globe className="w-4 h-4" strokeWidth={1.5} /></a>}
      {profile.address && <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`} target="_blank" rel="noreferrer" className={`p-2.5 rounded-xl ${bg} ${color} ${hoverBg} transition-colors`}><MapPin className="w-4 h-4" strokeWidth={1.5} /></a>}
    </div>
  );

  // ── Templates ──

  // Default: Blue accent, centered, classic digital card
  const DefaultTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200/60 min-h-screen sm:min-h-0">
      <div className="flex flex-col items-center pt-12 pb-6 px-6 text-center">
        <Avatar size={88} className="border-2 border-blue-100" />
        <div className="mt-5">
          {profile.jobTitle && <p className="text-blue-600 text-xs font-semibold mb-1">{profile.jobTitle}</p>}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
          {profile.company && <p className="text-slate-400 text-sm mt-1">{profile.company}</p>}
        </div>
        <button onClick={handleSaveContact} className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
        <div className="mt-4"><QuickActions /></div>
      </div>
      <div className="mx-6 border-t border-slate-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="mixed" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Gradient: Purple banner with overlapping avatar
  const GradientTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200/60 min-h-screen sm:min-h-0 overflow-hidden">
      <div className="h-36 bg-gradient-to-br from-purple-500 to-fuchsia-500 relative">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <Avatar size={80} className="border-[3px] border-white shadow-sm" />
        </div>
      </div>
      <div className="flex flex-col items-center pt-14 pb-6 px-6 text-center">
        {profile.jobTitle && <p className="text-purple-600 text-xs font-semibold mb-1">{profile.jobTitle}</p>}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
        {profile.company && <p className="text-slate-400 text-sm mt-1">{profile.company}</p>}
        <button onClick={handleSaveContact} className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
        <div className="mt-4"><QuickActions color="text-purple-600" bg="bg-purple-50" hoverBg="hover:bg-purple-100" /></div>
      </div>
      <div className="mx-6 border-t border-slate-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="purple" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Modern: Large photo hero, emerald accents
  const ModernTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200/60 min-h-screen sm:min-h-0 overflow-hidden">
      {profile.avatar ? (
        <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden">
          <img src={profile.avatar} alt={fullName} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
          <User className="w-12 h-12 text-emerald-200" strokeWidth={1} />
        </div>
      )}
      <div className="px-6 pt-6 pb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
        <div className="flex items-center gap-1.5 mt-1 text-sm">
          {profile.jobTitle && <span className="text-emerald-600 font-medium">{profile.jobTitle}</span>}
          {profile.jobTitle && profile.company && <span className="text-slate-300">/</span>}
          {profile.company && <span className="text-slate-400">{profile.company}</span>}
        </div>
        <div className="flex items-center gap-2 mt-5">
          <button onClick={handleSaveContact} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all">
            <Download className="w-4 h-4" /> Save
          </button>
          {profile.phone && <a href={`tel:${profile.phone}`} className="p-3 rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-colors"><Phone className="w-4 h-4" strokeWidth={1.5} /></a>}
          {profile.email && <a href={`mailto:${profile.email}`} className="p-3 rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-colors"><Mail className="w-4 h-4" strokeWidth={1.5} /></a>}
        </div>
      </div>
      <div className="mx-6 border-t border-slate-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="emerald" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Bold: Dark header with name overlay
  const BoldTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200/60 min-h-screen sm:min-h-0 overflow-hidden">
      <div className="relative bg-slate-900 px-6 pt-10 pb-8 overflow-hidden">
        {profile.avatar && <img src={profile.avatar} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
        <div className="relative">
          <h1 className="text-xl font-bold text-white tracking-tight">{fullName}</h1>
          {profile.jobTitle && <p className="text-emerald-400 text-sm font-medium mt-1">{profile.jobTitle}</p>}
          {profile.company && <p className="text-slate-400 text-sm mt-0.5">{profile.company}</p>}
        </div>
      </div>
      <div className="px-6 pt-5 pb-6">
        <button onClick={handleSaveContact} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
        <div className="mt-4"><QuickActions color="text-emerald-600" bg="bg-emerald-50" hoverBg="hover:bg-emerald-100" /></div>
      </div>
      <div className="mx-6 border-t border-slate-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="emerald" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Elegant: Warm amber tones, soft background
  const ElegantTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-[#fdfbf8] sm:rounded-2xl sm:shadow-sm sm:border sm:border-amber-100/80 min-h-screen sm:min-h-0">
      <div className="flex flex-col items-center pt-10 pb-6 px-6 text-center">
        <div className="p-1 rounded-full bg-gradient-to-br from-amber-200 to-orange-200">
          <Avatar size={76} className="border-2 border-white" />
        </div>
        <div className="mt-5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
          {profile.jobTitle && <p className="text-amber-700 text-sm font-medium mt-1 italic">{profile.jobTitle}</p>}
          {profile.company && <p className="text-slate-400 text-sm mt-0.5">{profile.company}</p>}
        </div>
        <button onClick={handleSaveContact} className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-amber-700 text-white text-sm font-semibold rounded-xl hover:bg-amber-800 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
        <div className="mt-4"><QuickActions color="text-amber-700" bg="bg-amber-50" hoverBg="hover:bg-amber-100" /></div>
      </div>
      <div className="mx-6 border-t border-amber-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="amber" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-amber-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Corporate: Indigo accent, structured two-row header
  const CorporateTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200/60 min-h-screen sm:min-h-0 overflow-hidden">
      <div className="h-2 bg-indigo-600" />
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-start gap-4">
          <Avatar size={64} className="border border-indigo-100" />
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{fullName}</h1>
            {profile.jobTitle && <p className="text-indigo-600 text-sm font-medium mt-0.5">{profile.jobTitle}</p>}
            {profile.company && <p className="text-slate-400 text-sm mt-0.5">{profile.company}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-5">
          <button onClick={handleSaveContact} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all">
            <Download className="w-4 h-4" /> Save Contact
          </button>
          {profile.phone && <a href={`tel:${profile.phone}`} className="p-3 rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors"><Phone className="w-4 h-4" strokeWidth={1.5} /></a>}
          {profile.email && <a href={`mailto:${profile.email}`} className="p-3 rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors"><Mail className="w-4 h-4" strokeWidth={1.5} /></a>}
        </div>
      </div>
      <div className="mx-6 border-t border-slate-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="indigo" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Dark: Full dark mode, teal accents
  const DarkTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-slate-950 sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-800 min-h-screen sm:min-h-0">
      <div className="flex flex-col items-center pt-12 pb-6 px-6 text-center">
        <Avatar size={88} className="border-2 border-slate-800" />
        <div className="mt-5">
          {profile.jobTitle && <p className="text-teal-400 text-xs font-semibold mb-1">{profile.jobTitle}</p>}
          <h1 className="text-xl font-bold text-white tracking-tight">{fullName}</h1>
          {profile.company && <p className="text-slate-500 text-sm mt-1">{profile.company}</p>}
        </div>
        <button onClick={handleSaveContact} className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2">
            {profile.phone && <a href={`tel:${profile.phone}`} className="p-2.5 rounded-xl bg-slate-900 text-teal-400 hover:bg-slate-800 transition-colors"><Phone className="w-4 h-4" strokeWidth={1.5} /></a>}
            {profile.email && <a href={`mailto:${profile.email}`} className="p-2.5 rounded-xl bg-slate-900 text-teal-400 hover:bg-slate-800 transition-colors"><Mail className="w-4 h-4" strokeWidth={1.5} /></a>}
            {hasWebsite && <a href={ensureProtocol(profile.website)} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-900 text-teal-400 hover:bg-slate-800 transition-colors"><Globe className="w-4 h-4" strokeWidth={1.5} /></a>}
            {profile.address && <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-900 text-teal-400 hover:bg-slate-800 transition-colors"><MapPin className="w-4 h-4" strokeWidth={1.5} /></a>}
          </div>
        </div>
      </div>
      <div className="mx-6 border-t border-slate-800" />
      <div className="px-6 py-5">
        <div className="space-y-1">
          {[
            { icon: Phone, label: 'Phone', value: profile.phone, href: profile.phone ? `tel:${profile.phone}` : null },
            { icon: Mail, label: 'Email', value: profile.email, href: profile.email ? `mailto:${profile.email}` : null },
            { icon: Globe, label: 'Website', value: hasWebsite ? profile.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null, href: hasWebsite ? ensureProtocol(profile.website) : null, external: true },
            { icon: MapPin, label: 'Address', value: profile.address, href: profile.address ? `https://maps.google.com/?q=${encodeURIComponent(profile.address)}` : null, external: true },
          ].filter(i => i.value).map(({ icon: Icon, label, value, href, external }) => {
            const row = (
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-teal-400" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-600 font-medium">{label}</p>
                  <p className="text-[13px] font-medium text-slate-300 truncate">{value}</p>
                </div>
              </div>
            );
            return href ? <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="block">{row}</a> : <div key={label}>{row}</div>;
          })}
        </div>
      </div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-700 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Rose: Soft pink tones, centered
  const RoseTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-[#fefbfb] sm:rounded-2xl sm:shadow-sm sm:border sm:border-rose-100/80 min-h-screen sm:min-h-0">
      <div className="flex flex-col items-center pt-12 pb-6 px-6 text-center">
        <div className="p-1 rounded-full bg-gradient-to-br from-rose-200 to-pink-200">
          <Avatar size={80} className="border-2 border-white" />
        </div>
        <div className="mt-5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
          {profile.jobTitle && <p className="text-rose-500 text-sm font-medium mt-1">{profile.jobTitle}</p>}
          {profile.company && <p className="text-slate-400 text-sm mt-0.5">{profile.company}</p>}
        </div>
        <button onClick={handleSaveContact} className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
        <div className="mt-4"><QuickActions color="text-rose-500" bg="bg-rose-50" hoverBg="hover:bg-rose-100" /></div>
      </div>
      <div className="mx-6 border-t border-rose-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="rose" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-rose-200 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Ocean: Teal, banner stripe with split info
  const OceanTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200/60 min-h-screen sm:min-h-0 overflow-hidden">
      <div className="bg-teal-600 px-6 py-8 text-center text-white">
        <Avatar size={72} className="border-[3px] border-white/30 mx-auto" />
        <h1 className="text-xl font-bold mt-4 tracking-tight">{fullName}</h1>
        {profile.jobTitle && <p className="text-teal-100 text-sm mt-1">{profile.jobTitle}</p>}
        {profile.company && <p className="text-teal-200/70 text-sm mt-0.5">{profile.company}</p>}
      </div>
      <div className="px-6 pt-5 pb-6">
        <button onClick={handleSaveContact} className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
        <div className="mt-4"><QuickActions color="text-teal-600" bg="bg-teal-50" hoverBg="hover:bg-teal-100" /></div>
      </div>
      <div className="mx-6 border-t border-slate-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="teal" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  // Minimal: No color, left-aligned, compact
  const MinimalTemplate = () => (
    <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200/60 min-h-screen sm:min-h-0">
      <div className="px-6 pt-10 pb-5">
        <div className="flex items-center gap-4">
          <Avatar size={56} className="border border-slate-200" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{fullName}</h1>
            {profile.jobTitle && <p className="text-slate-500 text-sm truncate">{profile.jobTitle}{profile.company ? ` / ${profile.company}` : ''}</p>}
            {!profile.jobTitle && profile.company && <p className="text-slate-500 text-sm truncate">{profile.company}</p>}
          </div>
        </div>
        <button onClick={handleSaveContact} className="w-full mt-5 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all">
          <Download className="w-4 h-4" /> Save Contact
        </button>
      </div>
      <div className="mx-6 border-t border-slate-100" />
      <div className="px-6 py-5"><ContactCards iconTheme="slate" /></div>
      <div className="pb-6 text-center"><span className="text-[11px] text-slate-300 font-medium tracking-wide uppercase">Powered by Klink</span></div>
    </div>
  );

  const templateMap = {
    default: DefaultTemplate,
    gradient: GradientTemplate,
    modern: ModernTemplate,
    bold: BoldTemplate,
    elegant: ElegantTemplate,
    corporate: CorporateTemplate,
    dark: DarkTemplate,
    rose: RoseTemplate,
    ocean: OceanTemplate,
    minimal: MinimalTemplate,
  };

  const TemplateComponent = templateMap[template] || DefaultTemplate;

  return (
    <div className="min-h-screen bg-slate-50 flex items-start sm:items-center justify-center sm:p-6">
      <TemplateComponent />
    </div>
  );
};

export default VCardProfile;
