import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Copy, Check, ExternalLink, Clock } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

const CouponProfile = () => {
  usePageTitle('Coupon');
  const { shortId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${apiBase}/qrcodes/public/${shortId}`);
        if (response.data.success) {
          setData(response.data.data.content);
        }
      } catch {
        setError('Coupon not found or has expired.');
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

  const ensureProtocol = (url) => {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
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
        <p className="text-neutral-800 font-semibold">Offer Unavailable</p>
        <p className="text-neutral-400 text-sm mt-1">{error || 'This coupon may have expired.'}</p>
      </div>
    );
  }

  const isExpired = data.validUntil && new Date(data.validUntil) < new Date();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-start sm:items-center justify-center sm:py-12 px-0 sm:px-4">
      <div className="w-full sm:max-w-[420px] bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200/60 min-h-screen sm:min-h-0">

        {/* Brand + Offer */}
        <div className="pt-10 pb-6 px-6 text-center">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.15em] mb-3">
            {data.companyName}
          </p>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-tight">
            {data.offerTitle}
          </h1>
          {data.description && (
            <p className="text-neutral-500 text-sm mt-3 leading-relaxed max-w-[300px] mx-auto">
              {data.description}
            </p>
          )}
        </div>

        {/* Coupon code */}
        <div className="px-6 pb-6">
          <div
            onClick={handleCopy}
            className="relative cursor-pointer select-none border-2 border-dashed border-neutral-200 rounded-xl p-5 text-center hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Your code
            </p>
            <p className="text-2xl font-mono font-black text-neutral-900 tracking-[0.15em]">
              {data.couponCode}
            </p>
            <button className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {copied && (
            <p className="text-center text-xs text-emerald-600 font-medium mt-2">
              Copied to clipboard
            </p>
          )}
        </div>

        {/* Expiry */}
        {data.validUntil && (
          <div className="px-6 pb-4">
            <div className={`flex items-center justify-center gap-1.5 text-xs font-medium ${isExpired ? 'text-red-500' : 'text-neutral-400'}`}>
              <Clock className="w-3.5 h-3.5" />
              {isExpired ? 'Expired' : `Valid until ${formatDate(data.validUntil)}`}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mx-6 border-t border-neutral-100" />

        {/* CTA */}
        {data.buttonUrl && !isExpired && (
          <div className="p-6">
            <a
              href={ensureProtocol(data.buttonUrl)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              {data.buttonText || 'Redeem Offer'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

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

export default CouponProfile;
