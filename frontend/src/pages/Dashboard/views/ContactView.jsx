import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, 
  MessageSquare, Globe, Twitter, Github 
} from 'lucide-react';

const ContactView = () => {
  const [status, setStatus] = useState('idle'); // idle, sending, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Mock API delay
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Contact Support
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Have a technical issue or interested in our Enterprise features? Our team typically responds within 2-4 hours during business days.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-700 outline-none transition-all text-sm text-slate-900 dark:text-white">
                    <option>Technical Support</option>
                    <option>Billing Inquiry</option>
                    <option>Enterprise Sales</option>
                    <option>Feature Request</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Urgency</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-700 outline-none transition-all text-sm text-slate-900 dark:text-white">
                    <option>Low - Just curious</option>
                    <option>Medium - Help needed</option>
                    <option>High - Production issue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
                <textarea 
                  rows="6" 
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-700 outline-none transition-all text-sm text-slate-900 dark:text-white resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center space-x-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {status === 'success' ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Message Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className={`w-4 h-4 ${status === 'sending' ? 'animate-pulse' : ''}`} />
                    <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Contact Info Cards */}
          <div className="space-y-8">
            
            {/* Quick Links */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Direct Channels</h3>
              
              <div className="space-y-6">
                <ContactItem icon={Mail} label="Support Email" value="support@nexusqr.io" />
                <ContactItem icon={MessageSquare} label="Live Chat" value="Average wait: 5 min" />
                <ContactItem icon={Globe} label="Headquarters" value="San Francisco, CA" />
              </div>
            </div>

            {/* Social Connect */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Connect</h3>
              <div className="flex gap-4">
                <SocialBtn icon={Twitter} />
                <SocialBtn icon={Github} />
              </div>
            </div>

            {/* Status Indicator */}
            <div className="p-4 rounded-xl border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10 flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">All systems operational</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// Internal Helper: Contact Line Item
const ContactItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-4">
    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

// Internal Helper: Social Button
const SocialBtn = ({ icon: Icon }) => (
  <button className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
    <Icon className="w-5 h-5 text-slate-500" />
  </button>
);

export default ContactView;