import React, { useState } from 'react';
import { 
  Search, Book, LifeBuoy, Zap, Shield, 
  MessageCircle, FileText, ChevronDown, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HelpCenterView = () => {
  const categories = [
    { title: 'Getting Started', desc: 'New to NexusQR? Start here to create your first code.', icon: Zap },
    { title: 'Dynamic vs Static', desc: 'Understand the difference between our QR types.', icon: Book },
    { title: 'Analytics & Tracking', desc: 'How to interpret your scan data and reports.', icon: LifeBuoy },
    { title: 'Security & Privacy', desc: 'Managing JWT tokens and workspace isolation.', icon: Shield },
  ];

  const faqs = [
    { q: "Can I change a QR code's destination after it is printed?", a: "Yes! If you created a 'Dynamic QR', you can update the destination URL at any time from your dashboard without changing the physical code." },
    { q: "What happens if I reach my scan limit?", a: "On the Starter plan, we'll notify you when you hit 90% of your limit. If reached, the QR will temporarily point to a landing page until the limit resets or you upgrade." },
    { q: "Are the QR codes high-resolution for printing?", a: "Absolutely. Our editor allows you to export in SVG and high-DPI PNG formats, suitable for everything from business cards to billboards." }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Help Hero */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            How can we help you?
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-700 outline-none transition-all"
              placeholder="Search for articles, guides, or features..."
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {categories.map((cat, i) => (
            <button key={i} className="p-6 text-left rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <cat.icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{cat.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{cat.desc}</p>
            </button>
          ))}
        </div>

        {/* FAQs Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        {/* Contact/Support CTA */}
        <div className="p-8 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 dark:bg-slate-900/5 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Still need help?</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Our support engineers are available 24/7 for Enterprise users.</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
            Contact Support
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

// Reusable Accordion Component
const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpCenterView;