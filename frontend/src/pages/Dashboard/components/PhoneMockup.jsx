import { AnimatePresence, motion } from 'framer-motion';
import {
  Globe, FileText, ImageIcon, UserSquare, Video, AlignJustify,
  Smile, Music, Building2, Ticket, Smartphone, Monitor,
  Type, Mail, MessageSquare, Wifi,
  Play, Download, MapPin, Phone, Star, Heart,
  Share2, ExternalLink,
} from 'lucide-react';

// ── Skeleton screens for each QR type ──

const WebsiteSkeleton = () => (
  <div className="p-4 space-y-3.5">
    <div className="bg-slate-100 rounded-lg px-3 py-2 flex items-center">
      <Globe className="w-3 h-3 text-slate-300 mr-1.5 shrink-0" />
      <span className="text-[10px] text-slate-400 font-medium">https://www.web.com</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="w-7 h-7 bg-slate-200 rounded" />
      <div className="flex flex-col gap-[3px]">
        <div className="w-4 h-[2px] bg-slate-300 rounded" />
        <div className="w-4 h-[2px] bg-slate-300 rounded" />
        <div className="w-4 h-[2px] bg-slate-300 rounded" />
      </div>
    </div>
    <div className="bg-slate-200 rounded-xl h-32 flex items-center justify-center">
      <ImageIcon className="w-8 h-8 text-slate-300" strokeWidth={1} />
    </div>
    <div className="space-y-2 pt-1">
      <div className="h-2.5 bg-slate-200 rounded-full w-full" />
      <div className="h-2.5 bg-slate-200 rounded-full w-4/5" />
      <div className="h-2.5 bg-slate-200 rounded-full w-3/5" />
    </div>
    <div className="h-9 bg-slate-800 rounded-lg w-full mt-2 flex items-center justify-center">
      <span className="text-[9px] text-white font-medium">Visit Website</span>
    </div>
  </div>
);

const PdfSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <FileText className="w-5 h-5 text-red-400" strokeWidth={1.5} />
      <span className="text-[11px] font-semibold text-slate-600">Document.pdf</span>
    </div>
    <div className="border border-slate-200 rounded-xl p-3 space-y-2.5 bg-slate-50">
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-11/12" />
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-9/12" />
      <div className="h-16 bg-slate-200 rounded-lg w-full my-2" />
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-10/12" />
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-7/12" />
    </div>
    <div className="flex items-center justify-between pt-1">
      <span className="text-[9px] text-slate-400">Page 1 of 3</span>
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-slate-400" />
        <Share2 className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  </div>
);

const ImagesSkeleton = () => (
  <div className="p-4 space-y-3">
    <span className="text-[11px] font-semibold text-slate-600">Image Gallery</span>
    <div className="grid grid-cols-2 gap-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="aspect-square bg-slate-200 rounded-xl flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-300" strokeWidth={1} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[5, 6, 7].map(i => (
        <div key={i} className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-slate-300" strokeWidth={1} />
        </div>
      ))}
    </div>
  </div>
);

// ── vCard template skeletons ──
const VCardContactRows = ({ iconColor = 'text-slate-300', bgColor = 'bg-slate-50' }) => (
  <div className="space-y-1.5">
    {[{ icon: Phone, w: 'w-24' }, { icon: Mail, w: 'w-28' }, { icon: MapPin, w: 'w-20' }, { icon: Globe, w: 'w-22' }].map(({ icon: Icon, w }, i) => (
      <div key={i} className={`flex items-center gap-2.5 px-3 py-2 ${bgColor} rounded-lg`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} strokeWidth={1.5} />
        <div className={`h-1.5 bg-slate-200 rounded-full ${w}`} />
      </div>
    ))}
  </div>
);

const VCardDefaultSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex flex-col items-center py-3">
      <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center mb-2"><UserSquare className="w-6 h-6 text-slate-300" strokeWidth={1} /></div>
      <div className="h-1.5 bg-blue-200 rounded-full w-16 mb-1" />
      <div className="h-2.5 bg-slate-800 rounded-full w-24 mb-1" />
      <div className="h-1.5 bg-slate-200 rounded-full w-20" />
    </div>
    <div className="h-8 bg-blue-500 rounded-full w-full flex items-center justify-center"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
    <div className="flex justify-center gap-2">{[1,2,3,4].map(i=><div key={i} className="w-7 h-7 rounded-lg bg-blue-50" />)}</div>
    <VCardContactRows iconColor="text-blue-300" bgColor="bg-blue-50/50" />
  </div>
);

const VCardGradientSkeleton = () => (
  <div>
    <div className="h-20 bg-gradient-to-br from-purple-500 to-pink-500 relative">
      <div className="w-12 h-12 rounded-full bg-white border-2 border-white absolute -bottom-6 left-1/2 -translate-x-1/2 shadow" />
    </div>
    <div className="flex flex-col items-center pt-8 px-4 pb-3 space-y-2">
      <div className="h-1.5 bg-purple-200 rounded-full w-16" />
      <div className="h-2.5 bg-slate-800 rounded-full w-24" />
      <div className="h-1.5 bg-slate-200 rounded-full w-20" />
      <div className="h-8 bg-purple-500 rounded-full w-full flex items-center justify-center mt-1"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
    </div>
    <div className="px-4 pb-3"><VCardContactRows iconColor="text-purple-300" bgColor="bg-purple-50/50" /></div>
  </div>
);

const VCardModernSkeleton = () => (
  <div>
    <div className="h-28 bg-slate-200 flex items-center justify-center"><UserSquare className="w-10 h-10 text-slate-300" strokeWidth={1} /></div>
    <div className="flex flex-col items-center pt-4 px-4 pb-3 space-y-2">
      <div className="h-2.5 bg-slate-800 rounded-full w-24" />
      <div className="h-1.5 bg-emerald-400 rounded-full w-16" />
      <div className="h-1.5 bg-slate-200 rounded-full w-20" />
      <div className="h-8 bg-emerald-500 rounded-full w-full flex items-center justify-center mt-1"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
    </div>
    <div className="px-4 pb-3"><VCardContactRows iconColor="text-emerald-300" bgColor="bg-emerald-50/50" /></div>
  </div>
);

const VCardBoldSkeleton = () => (
  <div>
    <div className="h-28 bg-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-400 opacity-20" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-16" />
      <div className="absolute bottom-2 left-3 space-y-1">
        <div className="h-2.5 bg-white rounded-full w-20" />
        <div className="h-1.5 bg-emerald-400 rounded-full w-14" />
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-8 bg-emerald-600 rounded-full w-full flex items-center justify-center"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
      <VCardContactRows iconColor="text-emerald-300" bgColor="bg-emerald-50/50" />
    </div>
  </div>
);

const VCardElegantSkeleton = () => (
  <div>
    <div className="h-20 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-amber-200 border-2 border-white" />
    </div>
    <div className="flex flex-col items-center pt-3 px-4 pb-3 space-y-2 border-b border-slate-100">
      <div className="h-2.5 bg-slate-800 rounded-full w-24" />
      <div className="h-1.5 bg-amber-500 rounded-full w-16" />
      <div className="h-1.5 bg-slate-200 rounded-full w-20" />
      <div className="h-8 bg-amber-600 rounded-full w-full flex items-center justify-center mt-1"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
    </div>
    <div className="px-4 py-3"><VCardContactRows iconColor="text-amber-400" bgColor="bg-amber-50/50" /></div>
  </div>
);

const VCardMinimalSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
      <div className="space-y-1.5">
        <div className="h-2.5 bg-slate-800 rounded-full w-20" />
        <div className="h-1.5 bg-slate-300 rounded-full w-16" />
      </div>
    </div>
    <div className="h-8 bg-slate-800 rounded-full w-full flex items-center justify-center"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
    <div className="flex justify-center gap-2">{[1,2,3,4].map(i=><div key={i} className="w-7 h-7 rounded-lg bg-slate-100" />)}</div>
    <VCardContactRows />
  </div>
);

const VCardCorporateSkeleton = () => (
  <div>
    <div className="h-1.5" style={{ backgroundColor: '#6366f1' }} />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0"><UserSquare className="w-5 h-5 text-indigo-300" strokeWidth={1} /></div>
        <div className="space-y-1.5">
          <div className="h-2.5 bg-slate-800 rounded-full w-24" />
          <div className="h-1.5 bg-indigo-400 rounded-full w-16" />
          <div className="h-1.5 bg-slate-200 rounded-full w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
        <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center"><Phone className="w-3.5 h-3.5 text-indigo-400" strokeWidth={1.5} /></div>
        <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center"><Mail className="w-3.5 h-3.5 text-indigo-400" strokeWidth={1.5} /></div>
      </div>
      <VCardContactRows iconColor="text-indigo-300" bgColor="bg-indigo-50/50" />
    </div>
  </div>
);

const VCardDarkSkeleton = () => (
  <div className="bg-slate-950 min-h-[360px]">
    <div className="p-4 space-y-3">
      <div className="flex flex-col items-center py-3">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-2"><UserSquare className="w-6 h-6 text-slate-600" strokeWidth={1} /></div>
        <div className="h-1.5 bg-teal-400 rounded-full w-16 mb-1" />
        <div className="h-2.5 bg-white rounded-full w-24 mb-1" />
        <div className="h-1.5 bg-slate-600 rounded-full w-20" />
      </div>
      <div className="h-8 bg-teal-500 rounded-full w-full flex items-center justify-center"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
      <div className="flex justify-center gap-2">{[1,2,3,4].map(i=><div key={i} className="w-7 h-7 rounded-lg bg-slate-800" />)}</div>
      <VCardContactRows iconColor="text-teal-400" bgColor="bg-slate-800/50" />
    </div>
  </div>
);

const VCardRoseSkeleton = () => (
  <div style={{ backgroundColor: '#fefbfb' }}>
    <div className="p-4 space-y-3">
      <div className="flex flex-col items-center py-3">
        <div className="w-14 h-14 rounded-full p-0.5 mb-2" style={{ background: 'linear-gradient(135deg, #fecdd3, #fbcfe8)' }}>
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center"><UserSquare className="w-6 h-6 text-rose-300" strokeWidth={1} /></div>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full w-24 mb-1" />
        <div className="h-1.5 bg-rose-400 rounded-full w-16 mb-1" />
        <div className="h-1.5 bg-slate-200 rounded-full w-20" />
      </div>
      <div className="h-8 bg-rose-500 rounded-full w-full flex items-center justify-center"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
      <div className="flex justify-center gap-2">{[1,2,3,4].map(i=><div key={i} className="w-7 h-7 rounded-lg bg-rose-50" />)}</div>
      <VCardContactRows iconColor="text-rose-400" bgColor="bg-rose-50/50" />
    </div>
  </div>
);

const VCardOceanSkeleton = () => (
  <div>
    <div className="bg-teal-600 px-4 py-5 flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2"><UserSquare className="w-5 h-5 text-white/70" strokeWidth={1} /></div>
      <div className="h-2.5 bg-white rounded-full w-24 mb-1" />
      <div className="h-1.5 bg-teal-200 rounded-full w-16" />
    </div>
    <div className="p-4 space-y-3">
      <div className="h-8 bg-teal-600 rounded-full w-full flex items-center justify-center"><span className="text-[8px] text-white font-medium">Save Contact</span></div>
      <div className="flex justify-center gap-2">{[1,2,3,4].map(i=><div key={i} className="w-7 h-7 rounded-lg bg-teal-50" />)}</div>
      <VCardContactRows iconColor="text-teal-400" bgColor="bg-teal-50/50" />
    </div>
  </div>
);

const vcardTemplateMap = {
  'default': VCardDefaultSkeleton,
  'gradient': VCardGradientSkeleton,
  'modern': VCardModernSkeleton,
  'bold': VCardBoldSkeleton,
  'elegant': VCardElegantSkeleton,
  'corporate': VCardCorporateSkeleton,
  'dark': VCardDarkSkeleton,
  'rose': VCardRoseSkeleton,
  'ocean': VCardOceanSkeleton,
  'minimal': VCardMinimalSkeleton,
};

const VCardSkeleton = ({ template = 'default' }) => {
  const Comp = vcardTemplateMap[template] || VCardDefaultSkeleton;
  return <Comp />;
};

const VideoSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="bg-slate-800 rounded-xl h-40 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10">
        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
      </div>
      <div className="absolute bottom-2 left-3 right-3">
        <div className="h-1 bg-white/20 rounded-full">
          <div className="h-1 bg-red-500 rounded-full w-1/3" />
        </div>
      </div>
    </div>
    <div className="h-3 bg-slate-300 rounded-full w-3/4" />
    <div className="h-2 bg-slate-200 rounded-full w-full" />
    <div className="h-2 bg-slate-200 rounded-full w-2/3" />
  </div>
);

const LinksSkeleton = () => (
  <div className="p-4 space-y-2.5">
    <div className="flex flex-col items-center py-2 mb-1">
      <div className="w-12 h-12 rounded-full bg-slate-200 mb-2" />
      <div className="h-2.5 bg-slate-300 rounded-full w-20" />
    </div>
    {['Portfolio', 'Blog', 'YouTube', 'Shop'].map((label) => (
      <div key={label} className="flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-xl">
        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.5} />
        <span className="text-[10px] font-medium text-slate-500">{label}</span>
      </div>
    ))}
  </div>
);

const SocialSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex flex-col items-center py-2">
      <div className="w-16 h-16 rounded-full bg-slate-200 mb-2" />
      <div className="h-3 bg-slate-300 rounded-full w-24 mb-1" />
      <div className="h-2 bg-slate-200 rounded-full w-16" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      {['Tw', 'Ig', 'Li', 'Fb', 'Yt', 'Tk'].map((s) => (
        <div key={s} className="flex flex-col items-center gap-1.5 py-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
            <span className="text-[8px] font-bold text-slate-400">{s}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Mp3Skeleton = () => (
  <div className="p-4 space-y-3">
    <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl h-40 flex items-center justify-center">
      <Music className="w-12 h-12 text-slate-400" strokeWidth={1} />
    </div>
    <div className="text-center space-y-1 py-1">
      <div className="h-3 bg-slate-300 rounded-full w-32 mx-auto" />
      <div className="h-2 bg-slate-200 rounded-full w-20 mx-auto" />
    </div>
    <div className="space-y-2">
      <div className="h-1.5 bg-slate-200 rounded-full w-full">
        <div className="h-1.5 bg-slate-400 rounded-full w-2/5" />
      </div>
      <div className="flex items-center justify-between text-[8px] text-slate-400">
        <span>1:24</span><span>3:45</span>
      </div>
    </div>
    <div className="flex items-center justify-center gap-6">
      <div className="w-8 h-8 rounded-full bg-slate-200" />
      <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center">
        <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-200" />
    </div>
  </div>
);

const BusinessSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
        <Building2 className="w-6 h-6 text-slate-300" strokeWidth={1} />
      </div>
      <div>
        <div className="h-3 bg-slate-300 rounded-full w-24 mb-1" />
        <div className="h-2 bg-slate-200 rounded-full w-16" />
      </div>
    </div>
    {[
      { icon: MapPin, w: 'w-36' },
      { icon: Phone, w: 'w-28' },
      { icon: Globe, w: 'w-32' },
    ].map(({ icon: Icon, w }, i) => (
      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
        <Icon className="w-4 h-4 text-slate-300 shrink-0" strokeWidth={1.5} />
        <div className={`h-2 bg-slate-200 rounded-full ${w}`} />
      </div>
    ))}
    <div className="bg-slate-200 rounded-xl h-28 flex items-center justify-center">
      <MapPin className="w-6 h-6 text-slate-300" strokeWidth={1} />
    </div>
  </div>
);

const CouponSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="bg-gradient-to-br from-orange-100 to-amber-50 border-2 border-dashed border-orange-300 rounded-2xl p-4 text-center space-y-2">
      <Ticket className="w-8 h-8 text-orange-400 mx-auto" strokeWidth={1.5} />
      <div className="text-2xl font-extrabold text-orange-500">20% OFF</div>
      <div className="h-2 bg-orange-200 rounded-full w-3/4 mx-auto" />
      <div className="h-2 bg-orange-200 rounded-full w-1/2 mx-auto" />
      <div className="border-t border-dashed border-orange-300 my-2" />
      <div className="bg-white rounded-lg px-3 py-2 border border-orange-200">
        <span className="text-[10px] font-mono font-bold text-orange-600 tracking-widest">SAVE20NOW</span>
      </div>
    </div>
    <div className="h-9 bg-orange-500 rounded-lg w-full flex items-center justify-center">
      <span className="text-[9px] text-white font-medium">Redeem Coupon</span>
    </div>
  </div>
);

const AppsSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex flex-col items-center py-3">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mb-3">
        <Smartphone className="w-7 h-7 text-slate-400" strokeWidth={1} />
      </div>
      <div className="h-3 bg-slate-300 rounded-full w-24 mb-1" />
      <div className="flex items-center gap-1 mt-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className="w-3 h-3 text-amber-400" fill={i <= 4 ? 'currentColor' : 'none'} />
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl">
        <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-[7px] font-bold text-slate-900">A</div>
        <div>
          <div className="text-[9px] text-white/60">Download on the</div>
          <div className="text-[10px] text-white font-semibold">App Store</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl">
        <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-[7px] font-bold text-slate-900">G</div>
        <div>
          <div className="text-[9px] text-white/60">Get it on</div>
          <div className="text-[10px] text-white font-semibold">Google Play</div>
        </div>
      </div>
    </div>
  </div>
);

const LandingPageSkeleton = () => (
  <div className="space-y-0">
    <div className="bg-gradient-to-b from-slate-800 to-slate-700 px-4 py-6 text-center">
      <div className="h-3 bg-white/20 rounded-full w-3/4 mx-auto mb-2" />
      <div className="h-2 bg-white/10 rounded-full w-1/2 mx-auto mb-3" />
      <div className="h-7 bg-white rounded-lg w-24 mx-auto" />
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl text-center space-y-1.5">
            <div className="w-6 h-6 bg-slate-200 rounded-lg mx-auto" />
            <div className="h-2 bg-slate-200 rounded-full w-3/4 mx-auto" />
          </div>
        ))}
      </div>
      <div className="h-9 bg-slate-800 rounded-lg flex items-center justify-center">
        <span className="text-[9px] text-white font-medium">Get Started</span>
      </div>
    </div>
  </div>
);

const TextSkeleton = () => (
  <div className="p-5 space-y-3">
    <div className="flex items-center gap-2 mb-2">
      <Type className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
      <span className="text-[11px] font-semibold text-slate-500">Plain Text</span>
    </div>
    <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-11/12" />
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-9/12" />
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-7/12" />
      <div className="h-2 bg-slate-200 rounded-full w-10/12" />
      <div className="h-2 bg-slate-200 rounded-full w-full" />
    </div>
  </div>
);

const EmailSkeleton = () => (
  <div className="p-4 space-y-2.5">
    <div className="flex items-center gap-2 mb-1">
      <Mail className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
      <span className="text-[11px] font-semibold text-slate-500">New Email</span>
    </div>
    {['To', 'Subject'].map((label) => (
      <div key={label} className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="text-[9px] text-slate-400 w-10 shrink-0">{label}:</span>
        <div className="h-2 bg-slate-200 rounded-full flex-1" />
      </div>
    ))}
    <div className="bg-slate-50 rounded-lg p-3 space-y-2 min-h-[140px] border border-slate-100">
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-4/5" />
      <div className="h-2 bg-slate-200 rounded-full w-full" />
      <div className="h-2 bg-slate-200 rounded-full w-2/3" />
    </div>
    <div className="h-9 bg-blue-500 rounded-lg w-full flex items-center justify-center mt-1">
      <span className="text-[9px] text-white font-medium">Send Email</span>
    </div>
  </div>
);

const SmsSkeleton = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <MessageSquare className="w-5 h-5 text-green-500" strokeWidth={1.5} />
      <span className="text-[11px] font-semibold text-slate-500">Message</span>
    </div>
    <div className="space-y-2.5 py-2">
      <div className="flex justify-end">
        <div className="bg-green-500 rounded-2xl rounded-br-md px-3 py-2 max-w-[75%]">
          <div className="h-2 bg-white/30 rounded-full w-28 mb-1" />
          <div className="h-2 bg-white/30 rounded-full w-20" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-slate-100 rounded-2xl rounded-bl-md px-3 py-2 max-w-[75%]">
          <div className="h-2 bg-slate-200 rounded-full w-24 mb-1" />
          <div className="h-2 bg-slate-200 rounded-full w-32" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-green-500 rounded-2xl rounded-br-md px-3 py-2 max-w-[75%]">
          <div className="h-2 bg-white/30 rounded-full w-16" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 bg-slate-100 rounded-full px-3 py-2">
        <div className="h-2 bg-slate-200 rounded-full w-16" />
      </div>
      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
        <MessageSquare className="w-3.5 h-3.5 text-white" fill="white" />
      </div>
    </div>
  </div>
);

const WifiSkeleton = () => (
  <div className="p-5 flex flex-col items-center justify-center min-h-[360px] space-y-4">
    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
      <Wifi className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
    </div>
    <div className="text-center space-y-1">
      <div className="h-3 bg-slate-300 rounded-full w-28 mx-auto" />
      <div className="h-2 bg-slate-200 rounded-full w-20 mx-auto" />
    </div>
    <div className="w-full space-y-2 pt-2">
      {['Network', 'Security', 'Password'].map(label => (
        <div key={label} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg">
          <span className="text-[9px] text-slate-400">{label}</span>
          <div className="h-2 bg-slate-200 rounded-full w-20" />
        </div>
      ))}
    </div>
    <div className="h-9 bg-blue-500 rounded-lg w-full flex items-center justify-center mt-2">
      <span className="text-[9px] text-white font-medium">Connect</span>
    </div>
  </div>
);

// ── Skeleton map ──
// Components that accept props (like vCard template) use a wrapper
const skeletonMap = {
  'Website': WebsiteSkeleton,
  'PDF': PdfSkeleton,
  'Images': ImagesSkeleton,
  'vCard Plus': null, // handled specially — needs template prop
  'Video': VideoSkeleton,
  'List of links': LinksSkeleton,
  'Social Media': SocialSkeleton,
  'MP3': Mp3Skeleton,
  'Business': BusinessSkeleton,
  'Coupon': CouponSkeleton,
  'Apps': AppsSkeleton,
  'Landing page': LandingPageSkeleton,
  'Text': TextSkeleton,
  'Email': EmailSkeleton,
  'SMS': SmsSkeleton,
  'Wi-Fi': WifiSkeleton,
};

// ── Phone Mockup Component ──
// meta: extra data from the form (e.g. { template: 'gradient' } for vCard)
const PhoneMockup = ({ activeType, meta = {}, title: headerTitle, compact = false }) => {
  const isVCard = activeType?.name === 'vCard Plus';
  const SkeletonComponent = activeType ? (isVCard ? null : skeletonMap[activeType.name]) : null;

  return (
    <div className={`flex flex-col items-center w-full ${compact ? 'py-4 px-6' : 'py-10 px-8 sticky top-0'}`}>
      <p className={`font-semibold text-slate-400 dark:text-slate-500 tracking-wide ${compact ? 'text-[10px] uppercase mb-3' : 'text-lg mb-7'}`}>
        {headerTitle || 'Example'}
      </p>

      {/* Phone frame */}
      <div className={`relative ${compact ? 'w-[220px]' : 'w-[272px]'}`}>
        {/* Phone bezel */}
        <div className={`bg-slate-900 dark:bg-slate-800 shadow-2xl shadow-slate-400/20 dark:shadow-black/40 ${compact ? 'rounded-[2rem] p-[8px]' : 'rounded-[2.5rem] p-[10px]'}`}>
          {/* Notch */}
          <div className="flex justify-center mb-1.5">
            <div className={`bg-slate-800 dark:bg-slate-700 rounded-full flex items-center justify-center ${compact ? 'w-[70px] h-[18px]' : 'w-[90px] h-[22px]'}`}>
              <div className={`rounded-full bg-slate-700 dark:bg-slate-600 ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
            </div>
          </div>

          {/* Screen */}
          <div className={`bg-white overflow-hidden ${compact ? 'rounded-[1.25rem]' : 'rounded-[1.5rem]'}`} style={{ minHeight: compact ? 300 : 420 }}>
            <AnimatePresence mode="wait">
              {(SkeletonComponent || isVCard) ? (
                <motion.div
                  key={isVCard ? `vcard-${meta.template || 'default'}` : activeType.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {isVCard ? <VCardSkeleton template={meta.template} /> : <SkeletonComponent />}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center px-6"
                  style={{ minHeight: compact ? 300 : 420 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 text-slate-300" strokeWidth={1} />
                  </div>
                  <p className="text-xs text-slate-400">
                    Hover over a QR type to preview
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center mt-1.5">
            <div className={`h-1 bg-slate-700 dark:bg-slate-600 rounded-full ${compact ? 'w-20' : 'w-28'}`} />
          </div>
        </div>
      </div>

      {/* Type label — hide in compact mode */}
      {!compact && (
        <AnimatePresence mode="wait">
          {activeType && (
            <motion.p
              key={activeType.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-6 flex items-center gap-2"
            >
              <activeType.icon className="w-4 h-4" style={{ color: activeType.color }} strokeWidth={1.5} />
              {activeType.name}
            </motion.p>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PhoneMockup;
