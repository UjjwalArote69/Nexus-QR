import React, { useState, useEffect, useCallback } from 'react';
import { Link2, Copy, CheckCircle2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const UTM_SOURCES = ['google', 'facebook', 'twitter', 'instagram', 'linkedin', 'email', 'newsletter', 'qr_code'];
const UTM_MEDIUMS = ['cpc', 'social', 'email', 'banner', 'referral', 'organic', 'qr', 'print'];

const UTMBuilder = ({ baseUrl, onUrlChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
  });
  const [copied, setCopied] = useState(false);

  const buildUrl = useCallback(() => {
    if (!baseUrl) return '';
    try {
      const url = new URL(baseUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value.trim()) {
          url.searchParams.set(key, value.trim());
        }
      });
      return url.toString();
    } catch {
      // If URL is invalid, just append as query string
      const queryParts = Object.entries(params)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`);
      if (queryParts.length === 0) return baseUrl;
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}${queryParts.join('&')}`;
    }
  }, [baseUrl, params]);

  useEffect(() => {
    if (onUrlChange) {
      const hasUtm = Object.values(params).some(v => v.trim());
      onUrlChange(hasUtm ? buildUrl() : baseUrl);
    }
  }, [params, baseUrl, buildUrl, onUrlChange]);

  const handleCopy = () => {
    const url = buildUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('UTM URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAnyParam = Object.values(params).some(v => v.trim());
  const finalUrl = buildUrl();

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">UTM Campaign Tracking</span>
          {hasAnyParam && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md uppercase">Active</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Campaign Source <span className="text-slate-400">(required)</span>
              </label>
              <input
                type="text"
                list="utm-sources"
                value={params.utm_source}
                onChange={(e) => setParams(p => ({ ...p, utm_source: e.target.value }))}
                placeholder="e.g. google, facebook, qr_code"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
              />
              <datalist id="utm-sources">
                {UTM_SOURCES.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            {/* Medium */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Campaign Medium
              </label>
              <input
                type="text"
                list="utm-mediums"
                value={params.utm_medium}
                onChange={(e) => setParams(p => ({ ...p, utm_medium: e.target.value }))}
                placeholder="e.g. cpc, social, qr"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
              />
              <datalist id="utm-mediums">
                {UTM_MEDIUMS.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>

            {/* Campaign */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={params.utm_campaign}
                onChange={(e) => setParams(p => ({ ...p, utm_campaign: e.target.value }))}
                placeholder="e.g. spring_sale, product_launch"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Term */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Campaign Term <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={params.utm_term}
                onChange={(e) => setParams(p => ({ ...p, utm_term: e.target.value }))}
                placeholder="e.g. running+shoes"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Content - full width */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Campaign Content <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={params.utm_content}
              onChange={(e) => setParams(p => ({ ...p, utm_content: e.target.value }))}
              placeholder="e.g. logolink, textlink, banner_v2"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Preview URL */}
          {hasAnyParam && baseUrl && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> Generated URL
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 break-all font-mono leading-relaxed">
                {finalUrl}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UTMBuilder;
