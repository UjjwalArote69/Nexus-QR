import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink, Link2 } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const LinksProfile = () => {
  usePageTitle('Links');
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
        setError('Link page not found or inactive.');
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
        <Link2 className="w-10 h-10 text-neutral-300 mb-4" strokeWidth={1.5} />
        <p className="text-neutral-800 font-semibold">Page Not Found</p>
        <p className="text-neutral-400 text-sm mt-1">This link may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-start sm:items-center justify-center sm:py-12 px-0 sm:px-4">
      <div className="w-full sm:max-w-[440px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200/60 min-h-screen sm:min-h-0">

        {/* Profile */}
        <div className="pt-12 pb-6 px-6 text-center">
          <div className="w-18 h-18 rounded-full bg-neutral-900 mx-auto flex items-center justify-center mb-5" style={{ width: 72, height: 72 }}>
            <span className="text-xl font-bold text-white">
              {data.profile?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            {data.profile?.name}
          </h1>
          {data.profile?.bio && (
            <p className="text-neutral-500 text-sm mt-1.5 max-w-[280px] mx-auto leading-relaxed">
              {data.profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="px-6 pb-6 space-y-3">
          {data.links?.map((link) => (
            <a
              key={link.id}
              href={ensureProtocol(link.url)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between w-full p-4 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-colors group"
            >
              <span className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-900">
                {link.title}
              </span>
              <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0 ml-3" strokeWidth={1.5} />
            </a>
          ))}
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

export default LinksProfile;
