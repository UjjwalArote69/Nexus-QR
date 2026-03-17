import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingTiers = [
  {
    name: 'Starter',
    description: 'Perfect for small projects and individual creators.',
    monthlyPrice: 0,
    annualPrice: 0,
    buttonText: 'Get Started for Free',
    buttonVariant: 'secondary',
    features: [
      'Up to 3 Dynamic QR Codes',
      'Basic Scan Analytics (30 days)',
      'Standard QR Frame Designs',
      'Community Support',
    ],
  },
  {
    name: 'Professional',
    description: 'For marketers and businesses needing deep insights.',
    monthlyPrice: 49,
    annualPrice: 39, // Billed annually
    buttonText: 'Start 14-Day Trial',
    buttonVariant: 'primary',
    isPopular: true,
    features: [
      'Unlimited Dynamic QR Codes',
      'Real-time High-Fidelity Analytics',
      'Advanced Design Sovereignty',
      'Custom Domain (r.yourbrand.com)',
      'CSV Data Export',
      'Priority Email Support',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Advanced security and control for large-scale operations.',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    buttonText: 'Contact Sales',
    buttonVariant: 'secondary',
    features: [
      'Everything in Professional',
      'Isolated Team Workspaces',
      'SSO & JWT Authentication',
      'Custom API Access',
      'SLA Guarantee',
      'Dedicated Account Manager',
    ],
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-24 px-6 bg-white dark:bg-slate-950 relative z-10 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors">
            Transparent pricing for teams of all sizes.
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 transition-colors">
            Start for free, upgrade when you need advanced analytics and team workspaces.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              Monthly
            </span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium flex items-center transition-colors ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              Annually 
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                tier.isPopular 
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-400 dark:border-slate-500 shadow-xl shadow-slate-200/50 dark:shadow-black/50 scale-100 md:scale-105 z-10' 
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-slate-900 dark:bg-slate-100 text-white dark:text-black text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full border border-transparent dark:border-white transition-colors">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 transition-colors">{tier.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 h-10 transition-colors">{tier.description}</p>
              </div>

              <div className="mb-8 flex-grow">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white transition-colors">
                    {typeof tier.monthlyPrice === 'number' ? '$' : ''}
                    {isAnnual ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  {typeof tier.monthlyPrice === 'number' && (
                    <span className="text-slate-500 dark:text-slate-400 ml-2 font-medium transition-colors">/month</span>
                  )}
                </div>
                {typeof tier.monthlyPrice === 'number' && isAnnual && (
                  <p className="text-sm text-slate-500 dark:text-slate-500 transition-colors">Billed annually</p>
                )}
                {typeof tier.monthlyPrice === 'number' && !isAnnual && (
                  <p className="text-sm text-transparent opacity-0">Spacer</p> /* Maintains height */
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-slate-700 dark:text-slate-300 transition-colors">
                    <Check className="w-5 h-5 text-slate-900 dark:text-slate-100 mr-3 shrink-0 transition-colors" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to="/register" 
                className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-300 ${
                  tier.buttonVariant === 'primary'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tier.buttonText}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;