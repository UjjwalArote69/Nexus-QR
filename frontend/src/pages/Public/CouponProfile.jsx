import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Ticket, Scissors, Copy, CheckCircle2, ExternalLink, Calendar 
} from 'lucide-react';

const CouponProfile = () => {
  const { shortId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/qrcodes/public/${shortId}`);
        if (response.data.success) {
          setData(response.data.data.content); 
        }
      } catch (err) {
        setError("Coupon not found or has expired.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shortId]);

  const handleCopy = () => {
    if (!data?.couponCode) return;
    navigator.clipboard.writeText(data.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format the date if it exists
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Ticket className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-800">Offer Unavailable</h1>
        <p className="text-slate-500 mt-2 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-10 px-4 font-sans">
      
      {/* Coupon Ticket Container */}
      <div className="max-w-sm w-full bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 relative">
        
        {/* Ticket Top Half */}
        <div className="bg-orange-500 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-orange-100 font-medium tracking-widest uppercase text-sm mb-2">
            {data.companyName}
          </h3>
          <h1 className="text-3xl font-bold mb-2 leading-tight">
            {data.offerTitle}
          </h1>

          {/* Ticket Cutout (Left & Right circles) */}
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-orange-100 dark:bg-slate-900 rounded-full"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-amber-50 dark:bg-slate-800 rounded-full"></div>
        </div>

        {/* Dashed Line separator */}
        <div className="relative border-t-2 border-dashed border-slate-200 dark:border-slate-800 mx-6 flex items-center justify-center -mt-[1px]">
          <Scissors className="w-4 h-4 text-slate-300 absolute -top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-950 px-1" />
        </div>

        {/* Ticket Bottom Half */}
        <div className="p-8 text-center space-y-6">
          
          {data.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {data.description}
            </p>
          )}

          {/* The Coupon Code Block */}
          <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-orange-200 dark:border-orange-900/50 rounded-xl p-4 relative group cursor-pointer transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/10" onClick={handleCopy}>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Promo Code</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white tracking-widest font-mono">
              {data.couponCode}
            </p>
            
            <button className="absolute top-1/2 -translate-y-1/2 right-4 text-orange-500 bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg transition-transform active:scale-90">
              {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Expiration */}
          {data.validUntil && (
            <div className="flex items-center justify-center text-xs text-slate-500 font-medium">
              <Calendar className="w-4 h-4 mr-1.5" />
              Valid until {formatDate(data.validUntil)}
            </div>
          )}

          {/* Redeem Action Button */}
          {data.buttonUrl && (
            <div className="pt-2">
              <a 
                href={data.buttonUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {data.buttonText || 'Redeem Offer'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CouponProfile;