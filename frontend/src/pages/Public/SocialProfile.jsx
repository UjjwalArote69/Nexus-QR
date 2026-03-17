/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Share2, Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Globe, ArrowLeft
} from 'lucide-react';

const SocialProfile = () => {
  const { shortId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/qrcodes/public/${shortId}`);
        if (response.data.success) {
          setData(response.data.data.content); // { profile, socials }
        }
      } catch (err) {
        setError("Social profile not found.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shortId]);

  // Helper to map network names to nice UI elements
  const getSocialConfig = (network, url) => {
    const configs = {
      instagram: { icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500', name: 'Instagram' },
      twitter: { icon: Twitter, color: 'bg-sky-500', name: 'Twitter / X' },
      facebook: { icon: Facebook, color: 'bg-blue-600', name: 'Facebook' },
      linkedin: { icon: Linkedin, color: 'bg-blue-700', name: 'LinkedIn' },
      youtube: { icon: Youtube, color: 'bg-red-600', name: 'YouTube' },
      github: { icon: Github, color: 'bg-slate-800 dark:bg-slate-700', name: 'GitHub' },
      website: { icon: Globe, color: 'bg-emerald-500', name: 'Website' },
    };
    return configs[network] || { icon: Globe, color: 'bg-slate-500', name: network };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Share2 className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-800">Profile Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-sky-400 to-indigo-500 pt-12 pb-8 px-6 text-center relative">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-4xl font-bold text-sky-500">
              {data.profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {data.profile?.name}
          </h1>
          {data.profile?.headline && (
            <p className="text-sky-100 font-medium px-4">
              {data.profile.headline}
            </p>
          )}
        </div>

        {/* Social Buttons */}
        <div className="p-6 sm:p-8 space-y-4">
          {data.socials && Object.entries(data.socials).map(([network, url]) => {
            if (!url) return null;
            const config = getSocialConfig(network, url);
            const Icon = config.icon;
            
            return (
              <a 
                key={network} 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:scale-[1.02] hover:shadow-md transition-all group border border-slate-100 dark:border-slate-800"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mr-4 shadow-sm ${config.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                    {config.name}
                  </span>
                  <span className="text-xs text-slate-500 block truncate max-w-[200px]">
                    {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-500 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-135" style={{ transform: 'rotate(135deg)' }} />
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default SocialProfile;