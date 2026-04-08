/* eslint-disable react-hooks/static-components */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useContext, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRGridSection from "../components/QRGridSection";
import WebsiteQRForm from "../components/Dynamic/WebsiteQRForm";
import VCardQRForm from "../components/Dynamic/VCardQRForm";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import StyledQRCode from "../../../components/ui/StyledQRCode";
import BuilderContext from "../../../context/BuilderContext";
import PdfQRForm from "../components/Dynamic/PdfQRForm";
import VideoQRForm from "../components/Dynamic/VideoQRForm";
import {
  Globe, FileText, ImageIcon, UserSquare, Video, AlignJustify,
  Smile, Music, Building2, Ticket, Smartphone, Monitor,
  Type, Mail, MessageSquare, Wifi,
  Download, ChevronDown, CheckCircle2, Copy, QrCode, Eye, X,
  FileImage, FileCode2, Image, ArrowLeft, Sparkles,
} from "lucide-react";
import ImageQRForm from "../components/Dynamic/ImageQRForm";
import LinksQRForm from "../components/Dynamic/LinksQRForm";
import SocialQRForm from "../components/Dynamic/SocialQRForm";
import Mp3QRForm from "../components/Dynamic/Mp3QRForm";
import BusinessQRForm from "../components/Dynamic/BusinessQRForm";
import CouponQRForm from "../components/Dynamic/CouponQRForm";
import AppStoreQRForm from "../components/Dynamic/AppStoreQRForm";
import LandingPageQRForm from "../components/Dynamic/LandingPageQRForm";
import TextQRForm from "../components/Static/TextQRForm";
import SmsQRForm from "../components/Static/SmsQRForm";
import EmailQRForm from "../components/Static/EmailQRForm";
import WifiQRForm from "../components/Static/WifiQRForm";
import AuthPromptModal from "../../../components/AuthPromptModal";
import useQRStore from "../../../store/qrStore";
import toast from "react-hot-toast";
import usePageTitle from "../../../hooks/usePageTitle";

const CreateQRView = () => {
  usePageTitle('Create QR Code');
  const { selectedType, setSelectedType, setBuilderStep } = useContext(BuilderContext);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [livePreview, setLivePreview] = useState({
    url: "", fgColor: "#000000", bgColor: "#ffffff",
    dotStyle: "square", cornerSquareStyle: "square", cornerDotStyle: "square", logoDataUrl: null,
  });
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const showAuthPrompt = useQRStore((s) => s.showAuthPrompt);
  const dismissAuthPrompt = useQRStore((s) => s.dismissAuthPrompt);
  const retryPendingCreation = useQRStore((s) => s.retryPendingCreation);
  const resetStore = useQRStore((s) => s.resetStore);

  const handleAuthSuccess = useCallback(async () => {
    const result = await retryPendingCreation();
    if (result?.success) setGeneratedLink(result.qrLink);
  }, [retryPendingCreation]);

  const qrCanvasRef = useRef(null);
  const qrSvgRef = useRef(null);
  const formatMenuRef = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (formatMenuRef.current && !formatMenuRef.current.contains(e.target)) setShowFormatMenu(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const downloadAsPNG = useCallback((size = 1024) => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const c = document.createElement("canvas"); c.width = size; c.height = size;
    const ctx = c.getContext("2d"); ctx.fillStyle = livePreview.bgColor; ctx.fillRect(0, 0, size, size); ctx.drawImage(canvas, 0, 0, size, size);
    const a = document.createElement("a"); a.download = `qr-${selectedType?.name?.toLowerCase().replace(/\s+/g, "-") || "klink"}.png`; a.href = c.toDataURL("image/png"); a.click();
    setShowFormatMenu(false);
  }, [livePreview.bgColor, selectedType]);

  const downloadAsSVG = useCallback(() => {
    const svg = qrSvgRef.current?.querySelector("svg"); if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.download = `qr-${selectedType?.name?.toLowerCase().replace(/\s+/g, "-") || "klink"}.svg`; a.href = url; a.click();
    URL.revokeObjectURL(url); setShowFormatMenu(false);
  }, [selectedType]);

  const handleCopyLink = useCallback(() => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink); setCopiedLink(true);
    toast.success("Copied"); setTimeout(() => setCopiedLink(false), 2000);
  }, [generatedLink]);

  const dynamicTypes = [
    { name: "Website", desc: "Open a URL", icon: Globe, color: "#3b82f6" },
    { name: "PDF", desc: "Show a PDF file", icon: FileText, color: "#ef4444" },
    { name: "Images", desc: "Display an image gallery", icon: ImageIcon, color: "#6366f1" },
    { name: "vCard Plus", desc: "Share contact details", icon: UserSquare, color: "#10b981" },
    { name: "Video", desc: "Show a video", icon: Video, color: "#f43f5e" },
    { name: "List of links", desc: "Group multiple links", icon: AlignJustify, color: "#d946ef" },
    { name: "Social Media", desc: "Share social profiles", icon: Smile, color: "#0ea5e9" },
    { name: "MP3", desc: "Play an audio file", icon: Music, color: "#f59e0b" },
    { name: "Business", desc: "Business information", icon: Building2, color: "#3b82f6" },
    { name: "Coupon", desc: "Share a discount coupon", icon: Ticket, color: "#f97316" },
    { name: "Apps", desc: "Redirect to app stores", icon: Smartphone, color: "#14b8a6" },
    { name: "Landing page", desc: "Create a custom page", icon: Monitor, color: "#f97316" },
  ];
  const staticTypes = [
    { name: "Text", desc: "Display plain text", icon: Type, color: "#3b82f6" },
    { name: "Email", desc: "Compose an email", icon: Mail, color: "#3b82f6" },
    { name: "SMS", desc: "Send a text message", icon: MessageSquare, color: "#22c55e" },
    { name: "Wi-Fi", desc: "Connect to a network", icon: Wifi, color: "#3b82f6" },
  ];

  const blank = { url: "", fgColor: "#000000", bgColor: "#ffffff", dotStyle: "square", cornerSquareStyle: "square", cornerDotStyle: "square", logoDataUrl: null };

  const handleTypeSelect = (type) => { setSelectedType(type); setBuilderStep(2); setGeneratedLink(null); setCopiedLink(false); setLivePreview(blank); };
  const handleBack = () => { resetStore(); setSelectedType(null); setBuilderStep(1); setGeneratedLink(null); setCopiedLink(false); setLivePreview(blank); setMobilePreviewOpen(false); };

  const qrValue = generatedLink || livePreview.url || "https://klink.com";
  const canDownload = !!(livePreview.url || generatedLink);
  const advanced = livePreview.dotStyle !== 'square' || livePreview.cornerSquareStyle !== 'square' || livePreview.logoDataUrl;

  const renderForm = () => {
    if (!selectedType) return null;
    const p = { onBack: handleBack, onGenerated: (link) => setGeneratedLink(link), onLiveUpdate: (d) => setLivePreview(d) };
    const m = {
      "Website": <WebsiteQRForm {...p} />, "PDF": <PdfQRForm {...p} />,
      "Images": <ImageQRForm {...p} />, "Image": <ImageQRForm {...p} />,
      "vCard Plus": <VCardQRForm {...p} />, "vCard": <VCardQRForm {...p} />, "Contact": <VCardQRForm {...p} />,
      "Video": <VideoQRForm {...p} />, "List of links": <LinksQRForm {...p} />,
      "Social Media": <SocialQRForm {...p} />, "Social": <SocialQRForm {...p} />,
      "MP3": <Mp3QRForm {...p} />, "Business": <BusinessQRForm {...p} />, "Coupon": <CouponQRForm {...p} />,
      "Apps": <AppStoreQRForm {...p} />, "App": <AppStoreQRForm {...p} />,
      "Landing page": <LandingPageQRForm {...p} />, "Landing Page": <LandingPageQRForm {...p} />,
      "Text": <TextQRForm {...p} />, "Email": <EmailQRForm {...p} />, "Wi-Fi": <WifiQRForm {...p} />, "SMS": <SmsQRForm {...p} />,
    };
    return m[selectedType.name] || (
      <div className="p-16 text-center flex flex-col items-center justify-center h-full gap-5">
        <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1"><strong>{selectedType.name}</strong> — coming soon</p>
          <p className="text-sm text-slate-400">This QR type is still under development.</p>
        </div>
        <button onClick={handleBack} className="mt-2 flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to types
        </button>
      </div>
    );
  };

  // ─── Preview Panel ───
  const PreviewContent = ({ compact = false }) => {
    const qrSize = compact ? 180 : 220;
    return (
      <div className={`flex flex-col items-center ${compact ? 'py-6' : 'py-10'} px-6 w-full`}>

        {/* Preview label */}
        {!compact && (
          <div className="w-full max-w-[360px] mb-5">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live Preview</p>
          </div>
        )}

        {/* QR Preview Card */}
        <div className={`w-full ${compact ? 'max-w-[300px]' : 'max-w-[360px]'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center`}>
          {selectedType ? (
            <>
              {/* QR Code */}
              <div className="rounded-xl overflow-hidden p-3 mb-5" style={{ backgroundColor: livePreview.bgColor }}>
                {advanced ? (
                  <StyledQRCode value={qrValue} size={qrSize} fgColor={livePreview.fgColor} bgColor={livePreview.bgColor}
                    dotStyle={livePreview.dotStyle || 'square'} cornerSquareStyle={livePreview.cornerSquareStyle || 'square'} logoDataUrl={livePreview.logoDataUrl} />
                ) : (
                  <QRCodeSVG value={qrValue} size={qrSize} level="H" fgColor={livePreview.fgColor} bgColor={livePreview.bgColor} includeMargin={false} />
                )}
              </div>

              {/* Type name */}
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">{selectedType.name}</p>

              {/* Status */}
              {generatedLink ? (
                <div className="flex flex-col items-center gap-2.5 w-full">
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> QR code ready
                  </span>
                  <button onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                    <span className="truncate">{copiedLink ? 'Copied!' : generatedLink}</span>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-300 dark:text-slate-600">
                  {livePreview.url ? 'Previewing live changes' : 'Fill in the form to preview'}
                </p>
              )}
            </>
          ) : (
            <div className="py-14 flex flex-col items-center gap-4">
              <QrCode className="w-16 h-16 text-slate-200 dark:text-slate-700" strokeWidth={0.8} />
              <p className="text-sm text-slate-400 dark:text-slate-500">Select a QR type to start</p>
            </div>
          )}
        </div>

        {/* Download Actions */}
        {selectedType && (
          <div className={`mt-6 w-full ${compact ? 'max-w-[300px]' : 'max-w-[360px]'}`} ref={formatMenuRef}>
            <div className="relative">
              <div className="flex rounded-xl overflow-hidden">
                <button
                  onClick={() => downloadAsPNG(1024)}
                  disabled={!canDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  onClick={() => setShowFormatMenu(v => !v)}
                  disabled={!canDownload}
                  className="px-4 bg-slate-800 dark:bg-slate-200 text-white/60 dark:text-slate-500 border-l border-slate-700 dark:border-slate-300 hover:text-white dark:hover:text-slate-900 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFormatMenu ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <AnimatePresence>
                {showFormatMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 py-1.5"
                  >
                    {[
                      { label: 'PNG', sub: '1024 × 1024', action: () => downloadAsPNG(1024) },
                      { label: 'PNG Hi-Res', sub: '2048 × 2048', action: () => downloadAsPNG(2048) },
                      { label: 'SVG', sub: 'Vector format', action: downloadAsSVG },
                    ].map((f) => (
                      <button key={f.label} onClick={f.action}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{f.label}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{f.sub}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {generatedLink && (
              <button onClick={handleCopyLink}
                className="w-full mt-2.5 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors text-center">
                {copiedLink ? 'Copied to clipboard!' : 'Copy shareable link'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden relative">
        {/* Left — Grid or Form */}
        <div className="flex-1 xl:overflow-y-auto bg-white dark:bg-slate-950">
          <AnimatePresence mode="wait">
            {!selectedType ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="mx-auto px-8 py-10 sm:px-12 sm:py-12 max-w-5xl">
                <div className="mb-10">
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">Create QR Code</h1>
                  <p className="text-base text-slate-400 dark:text-slate-500">Choose a type below to get started. Dynamic codes can be updated after printing.</p>
                </div>
                <QRGridSection title="Dynamic QR" badge="editable · with analytics" items={dynamicTypes} onSelectType={handleTypeSelect} />
                <QRGridSection title="Static QR" badge="fixed content" items={staticTypes} onSelectType={handleTypeSelect} />
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
                {renderForm()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Preview */}
        <aside className="hidden xl:flex w-[420px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex-col items-center shrink-0 overflow-y-auto">
          <PreviewContent />
        </aside>

        {/* Mobile FAB */}
        {selectedType && (
          <div className="xl:hidden fixed bottom-4 left-6 z-40">
            <button onClick={() => setMobilePreviewOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-medium shadow-lg">
              <Eye className="w-4 h-4" /> Preview
              {generatedLink && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </button>
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        <AnimatePresence>
          {mobilePreviewOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobilePreviewOpen(false)} className="xl:hidden fixed inset-0 bg-black/20 z-50" />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="xl:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 rounded-t-2xl border-t border-slate-200 dark:border-slate-800 z-50 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Preview</span>
                  <button onClick={() => setMobilePreviewOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <PreviewContent compact />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden export canvases */}
      <div ref={qrCanvasRef} className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <QRCodeCanvas value={qrValue} size={1024} level="H" fgColor={livePreview.fgColor} bgColor={livePreview.bgColor} includeMargin />
      </div>
      <div ref={qrSvgRef} className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <QRCodeSVG value={qrValue} size={1024} level="H" fgColor={livePreview.fgColor} bgColor={livePreview.bgColor} includeMargin />
      </div>

      <AuthPromptModal open={showAuthPrompt} onClose={dismissAuthPrompt} onAuthSuccess={handleAuthSuccess} />
    </>
  );
};

export default CreateQRView;
