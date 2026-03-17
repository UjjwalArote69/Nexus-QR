import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, Apple, Play, Globe } from 'lucide-react';

const AppStoreProfile = () => {
  const { shortId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/qrcodes/public/${shortId}`);
        if (response.data.success) {
          setData(response.data.data.content); 
        }
      } catch (err) {
        setError("App profile not found.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Smartphone className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-800">App Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center py-10 px-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* App Header */}
        <div className="p-8 text-center mt-4">
          <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg text-white">
            <span className="text-4xl font-bold">{data.appName?.charAt(0)}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {data.appName}
          </h1>
          {data.developer && (
            <p className="text-slate-500 font-medium text-sm mb-4">{data.developer}</p>
          )}
          {data.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed px-2">
              {data.description}
            </p>
          )}
        </div>

        {/* Download Buttons */}
        <div className="px-6 pb-10 space-y-4">
          
          {data.iosLink && (
            <a href={data.iosLink} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full p-4 bg-black text-white rounded-2xl hover:scale-[1.02] transition-transform shadow-md">
              <Apple className="w-8 h-8 mr-3" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-80 leading-tight">Download on the</p>
                <p className="text-lg font-semibold leading-tight">App Store</p>
              </div>
            </a>
          )}

          {data.androidLink && (
            <a href={data.androidLink} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full p-4 bg-emerald-600 text-white rounded-2xl hover:scale-[1.02] transition-transform shadow-md">
              <Play className="w-7 h-7 mr-3 fill-white" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider opacity-80 leading-tight">Get it on</p>
                <p className="text-lg font-semibold leading-tight">Google Play</p>
              </div>
            </a>
          )}

          {data.websiteLink && (
            <a href={data.websiteLink} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full p-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl hover:scale-[1.02] transition-transform">
              <Globe className="w-5 h-5 mr-3 text-slate-500" />
              <span className="font-semibold">Visit Website</span>
            </a>
          )}

        </div>
      </div>
    </div>
  );
};

export default AppStoreProfile;