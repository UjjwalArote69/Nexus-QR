import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LayoutTemplate, ArrowRight } from 'lucide-react';

const LandingProfile = () => {
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
        setError("Landing page not found.",err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <LayoutTemplate className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-800">Page Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center py-10 px-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Optional Hero Image */}
        {data.heroImageUrl ? (
          <div className="w-full h-48 sm:h-64 bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
            <img 
              src={data.heroImageUrl} 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for better text readability if company name overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-tr from-orange-400 to-rose-500"></div>
        )}

        <div className="p-8 text-center -mt-6 relative z-10">
          
          {data.companyName && (
            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
              {data.companyName}
            </span>
          )}

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
            {data.headline}
          </h1>
          
          {data.description && (
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
              {data.description}
            </p>
          )}

          <a 
            href={data.buttonUrl} 
            target="_blank" 
            rel="noreferrer"
            className="group flex items-center justify-center w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1"
          >
            {data.buttonText || "Learn More"}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
      
      <div className="mt-8 text-center">
        <a href="https://nexusqr.com" target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest">
          Powered by NexusQR
        </a>
      </div>
    </div>
  );
};

export default LandingProfile;