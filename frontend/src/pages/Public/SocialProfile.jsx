import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Globe, ExternalLink, Share2 } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const SocialProfile = () => {
  usePageTitle('Social Profile');
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
        setError('Social profile not found.');
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

  const socialConfig = {
    instagram: { icon: Instagram, label: 'Instagram', bg: 'bg-[#E4405F]' },
    twitter: { icon: Twitter, label: 'X (Twitter)', bg: 'bg-[#000000]' },
    facebook: { icon: Facebook, label: 'Facebook', bg: 'bg-[#1877F2]' },
    linkedin: { icon: Linkedin, label: 'LinkedIn', bg: 'bg-[#0A66C2]' },
    youtube: { icon: Youtube, label: 'YouTube', bg: 'bg-[#FF0000]' },
    github: { icon: Github, label: 'GitHub', bg: 'bg-[#24292e]' },
    website: { icon: Globe, label: 'Website', bg: 'bg-neutral-700' },
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
        <Share2 className="w-10 h-10 text-neutral-300 mb-4" strokeWidth={1.5} />
        <p className="text-neutral-800 font-semibold">Profile Not Found</p>
        <p className="text-neutral-400 text-sm mt-1">This link may have expired or been removed.</p>
      </div>
    );
  }

  const socials = data.socials ? Object.entries(data.socials).filter(([, url]) => url) : [];

  return (
    <div className="min-h-screen bg-neutral-50 flex items-start sm:items-center justify-center sm:py-12 px-0 sm:px-4">
      <div className="w-full sm:max-w-[440px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200/60 min-h-screen sm:min-h-0">

        {/* Profile header */}
        <div className="pt-12 pb-8 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-900 mx-auto flex items-center justify-center mb-5">
            <span className="text-2xl font-bold text-white">
              {data.profile?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            {data.profile?.name}
          </h1>
          {data.profile?.headline && (
            <p className="text-neutral-500 text-sm mt-1.5 max-w-[280px] mx-auto leading-relaxed">
              {data.profile.headline}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-neutral-100" />

        {/* Social links */}
        <div className="p-6 space-y-3">
          {socials.map(([network, url]) => {
            const config = socialConfig[network] || { icon: Globe, label: network, bg: 'bg-neutral-600' };
            const Icon = config.icon;

            return (
              <a
                key={network}
                href={ensureProtocol(url)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-3.5 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">{config.label}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" strokeWidth={1.5} />
              </a>
            );
          })}
        </div>

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

export default SocialProfile;
