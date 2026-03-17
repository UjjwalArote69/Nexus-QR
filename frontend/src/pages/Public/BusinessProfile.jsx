import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, Phone, Mail, Globe, MapPin, Clock, Store, Navigation 
} from 'lucide-react';

const BusinessProfile = () => {
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
        setError("Business profile not found or inactive.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Store className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-800">Page Not Found</h1>
        <p className="text-slate-500 mt-2 text-center">{error}</p>
      </div>
    );
  }

  // Generate a Google Maps link if an address exists
  const mapsLink = data.address 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}` 
    : '#';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center py-10 px-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border border-white/30">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {data.companyName}
          </h1>
          {data.headline && (
            <p className="text-blue-100 font-medium text-sm">{data.headline}</p>
          )}
        </div>

        {/* Action Buttons (Call / Email / Map) */}
        <div className="flex justify-center gap-4 -mt-6 mb-6 px-6 relative z-10">
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 text-blue-600 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
              <Phone className="w-6 h-6" />
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 text-blue-600 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
              <Mail className="w-6 h-6" />
            </a>
          )}
          {data.address && (
            <a href={mapsLink} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 text-blue-600 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
              <Navigation className="w-6 h-6" />
            </a>
          )}
        </div>

        {/* Content Details */}
        <div className="px-6 pb-8 space-y-6">
          
          {/* About Section */}
          {data.about && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Us</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.about}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* Website Row */}
            {data.website && (
              <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Globe className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-sm text-blue-600 font-medium truncate">
                  {data.website.replace(/^https?:\/\//, '')}
                </span>
              </a>
            )}

            {/* Address Row */}
            {data.address && (
              <div className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {data.address}
                </span>
              </div>
            )}

            {/* Hours Row */}
            {data.openingHours && (
              <div className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                <Clock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {data.openingHours}
                </span>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default BusinessProfile;