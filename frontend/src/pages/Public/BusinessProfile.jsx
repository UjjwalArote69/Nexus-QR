import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, Globe, MapPin, Clock, Building2 } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const BusinessProfile = () => {
  usePageTitle('Business');
  const { shortId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${apiBase}/qrcodes/public/${shortId}`);
        if (response.data.success) {
          setData(response.data.data.content);
        }
      } catch {
        setError('Business profile not found or inactive.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shortId]);

  const ensureProtocol = (url) => {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        <Building2 className="w-10 h-10 text-neutral-300 mb-4" strokeWidth={1.5} />
        <p className="text-neutral-800 font-semibold">Business Not Found</p>
        <p className="text-neutral-400 text-sm mt-1">This page may have been removed.</p>
      </div>
    );
  }

  const mapsLink = data.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`
    : null;

  const contactItems = [
    { icon: Phone, label: 'Phone', value: data.phone, href: data.phone ? `tel:${data.phone}` : null },
    { icon: Mail, label: 'Email', value: data.email, href: data.email ? `mailto:${data.email}` : null },
    { icon: Globe, label: 'Website', value: data.website ? data.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null, href: data.website ? ensureProtocol(data.website) : null, external: true },
    { icon: MapPin, label: 'Address', value: data.address, href: mapsLink, external: true },
    { icon: Clock, label: 'Hours', value: data.openingHours },
  ].filter(item => item.value);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-start sm:items-center justify-center sm:py-12 px-0 sm:px-4">
      <div className="w-full sm:max-w-[440px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200/60 min-h-screen sm:min-h-0">

        {/* Header */}
        <div className="pt-12 pb-6 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 mx-auto flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            {data.companyName}
          </h1>
          {data.headline && (
            <p className="text-neutral-500 text-sm mt-1.5">{data.headline}</p>
          )}
        </div>

        {/* Quick actions */}
        {(data.phone || data.email || mapsLink) && (
          <div className="flex items-center justify-center gap-3 px-6 pb-6">
            {data.phone && (
              <a href={`tel:${data.phone}`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-colors">
                <Phone className="w-4 h-4" strokeWidth={1.5} /> Call
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-colors">
                <Mail className="w-4 h-4" strokeWidth={1.5} /> Email
              </a>
            )}
            {mapsLink && (
              <a href={mapsLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-colors">
                <MapPin className="w-4 h-4" strokeWidth={1.5} /> Map
              </a>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="mx-6 border-t border-neutral-100" />

        {/* About */}
        {data.about && (
          <div className="px-6 pt-6">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">About</p>
            <p className="text-sm text-neutral-600 leading-relaxed">{data.about}</p>
          </div>
        )}

        {/* Contact details */}
        {contactItems.length > 0 && (
          <div className="px-6 py-6 space-y-2">
            {contactItems.map(({ icon: Icon, label, value, href, external }) => {
              const content = (
                <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-neutral-400 font-medium">{label}</p>
                    <p className="text-sm text-neutral-800 truncate">{value}</p>
                  </div>
                </div>
              );

              if (href) {
                return (
                  <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="block">
                    {content}
                  </a>
                );
              }
              return <div key={label}>{content}</div>;
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pb-8 pt-2 text-center">
          <span className="text-[11px] text-neutral-300 font-medium tracking-wide uppercase">
            Powered by Klink
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
