import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, LayoutTemplate } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const LandingProfile = () => {
  usePageTitle('Landing Page');
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
        setError('Landing page not found.');
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
        <LayoutTemplate className="w-10 h-10 text-neutral-300 mb-4" strokeWidth={1.5} />
        <p className="text-neutral-800 font-semibold">Page Not Found</p>
        <p className="text-neutral-400 text-sm mt-1">This page may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-start sm:items-center justify-center sm:py-12 px-0 sm:px-4">
      <div className="w-full sm:max-w-[480px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200/60 min-h-screen sm:min-h-0 overflow-hidden">

        {/* Hero image */}
        {data.heroImageUrl && (
          <div className="w-full aspect-[16/9] bg-neutral-100 overflow-hidden">
            <img
              src={data.heroImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-10 sm:px-8">
          {data.companyName && (
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.15em] mb-4">
              {data.companyName}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
            {data.headline}
          </h1>

          {data.description && (
            <p className="text-neutral-500 text-[15px] leading-relaxed mt-4">
              {data.description}
            </p>
          )}

          {data.buttonUrl && (
            <a
              href={ensureProtocol(data.buttonUrl)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all group"
            >
              {data.buttonText || 'Learn More'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <span className="text-[11px] text-neutral-300 font-medium tracking-wide uppercase">
            Powered by Klink
          </span>
        </div>
      </div>
    </div>
  );
};

export default LandingProfile;
