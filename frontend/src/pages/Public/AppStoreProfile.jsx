import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Globe } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const AppStoreProfile = () => {
  usePageTitle('App Store');
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
        setError('App not found.');
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
        <Smartphone className="w-10 h-10 text-neutral-300 mb-4" strokeWidth={1.5} />
        <p className="text-neutral-800 font-semibold">App Not Found</p>
        <p className="text-neutral-400 text-sm mt-1">This app link may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-start sm:items-center justify-center sm:py-12 px-0 sm:px-4">
      <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200/60 min-h-screen sm:min-h-0">

        {/* App info */}
        <div className="pt-12 pb-6 px-6 text-center">
          <div className="w-20 h-20 rounded-[18px] bg-neutral-900 mx-auto flex items-center justify-center mb-5 shadow-sm">
            <span className="text-2xl font-bold text-white">
              {data.appName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            {data.appName}
          </h1>
          {data.developer && (
            <p className="text-neutral-400 text-sm mt-1">{data.developer}</p>
          )}
          {data.description && (
            <p className="text-neutral-500 text-sm mt-3 leading-relaxed max-w-[300px] mx-auto">
              {data.description}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-neutral-100" />

        {/* Download buttons */}
        <div className="p-6 space-y-3">
          {data.iosLink && (
            <a
              href={ensureProtocol(data.iosLink)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center w-full p-3.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-8 h-8 mr-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <p className="text-[10px] opacity-70 leading-tight">Download on the</p>
                <p className="text-base font-semibold leading-tight">App Store</p>
              </div>
            </a>
          )}

          {data.androidLink && (
            <a
              href={ensureProtocol(data.androidLink)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center w-full p-3.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-7 h-7 mr-3.5 ml-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.72L14.12 12 3.18.28a.73.73 0 00-.18.52v22.4c0 .2.06.38.18.52zm1.42.68l12.17-6.84-2.68-2.68L4.6 24.4zm14.76-8.27L6.03 24.86l9.42-9.42 3.91 1.69zM6.03-.86l13.33 8.73-3.91 1.69L6.03-.86zM4.6-.4l9.49 9.52 2.68-2.68L4.6-.4z"/>
              </svg>
              <div>
                <p className="text-[10px] opacity-70 leading-tight">Get it on</p>
                <p className="text-base font-semibold leading-tight">Google Play</p>
              </div>
            </a>
          )}

          {data.websiteLink && (
            <a
              href={ensureProtocol(data.websiteLink)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3.5 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              Visit Website
            </a>
          )}
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

export default AppStoreProfile;
