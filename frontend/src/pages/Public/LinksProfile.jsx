import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link2, ExternalLink } from 'lucide-react';

const LinksProfile = () => {
  const { shortId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/qrcodes/public/${shortId}`);
        if (response.data.success) {
          setData(response.data.data.content); // Extract { profile, links }
        }
      } catch (err) {
        setError("Link profile not found or inactive.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Link2 className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-800">Page Not Found</h1>
        <p className="text-slate-500 mt-2 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-12 px-4 sm:px-6 font-sans flex justify-center">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-fuchsia-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg text-white text-3xl font-bold">
            {data.profile?.name?.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {data.profile?.name}
          </h1>
          {data.profile?.bio && (
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {data.profile.bio}
            </p>
          )}
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {data.links?.map((link) => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noreferrer"
              className="block w-full p-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm hover:shadow-md transition-all active:scale-95 group relative"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200">{link.title}</span>
              <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="https://nexusqr.com" target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-400 hover:text-fuchsia-500 transition-colors uppercase tracking-widest">
            Powered by NexusQR
          </a>
        </div>

      </div>
    </div>
  );
};

export default LinksProfile;