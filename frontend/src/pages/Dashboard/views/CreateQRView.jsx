/* eslint-disable react-hooks/static-components */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useContext, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRGridSection from "../components/QRGridSection";
import PhoneMockup from "../components/PhoneMockup";
import WebsiteQRForm from "../components/Dynamic/WebsiteQRForm";
import VCardQRForm from "../components/Dynamic/VCardQRForm";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import StyledQRCode from "../../../components/ui/StyledQRCode";
import BuilderContext from "../../../context/BuilderContext";
import PdfQRForm from "../components/Dynamic/PdfQRForm";
import VideoQRForm from "../components/Dynamic/VideoQRForm";
import {
  Download, ChevronDown, CheckCircle2, Copy, QrCode, Eye, X,
  FileImage, FileCode2, Image, ArrowLeft, Sparkles,
} from "lucide-react";
import { dynamicTypes, staticTypes } from "../../../data/qrTypes";
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

  const blank = { url: "", fgColor: "#000000", bgColor: "#ffffff", dotStyle: "square", cornerSquareStyle: "square", cornerDotStyle: "square", logoDataUrl: null, meta: {} };

  const [hoveredType, setHoveredType] = useState(null);

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

  // ─── Preview Panel (mobile bottom-sheet only) ───
  const MobilePreview = () => {
    const qrSize = 180;
    return (
      <div className="flex flex-col items-center py-6 px-6 w-full">
        <div className="w-full max-w-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center">
          <div className="rounded-xl overflow-hidden p-3 mb-4" style={{ backgroundColor: livePreview.bgColor }}>
            {advanced ? (
              <StyledQRCode value={qrValue} size={qrSize} fgColor={livePreview.fgColor} bgColor={livePreview.bgColor}
                dotStyle={livePreview.dotStyle || 'square'} cornerSquareStyle={livePreview.cornerSquareStyle || 'square'} logoDataUrl={livePreview.logoDataUrl} />
            ) : (
              <QRCodeSVG value={qrValue} size={qrSize} level="H" fgColor={livePreview.fgColor} bgColor={livePreview.bgColor} includeMargin={false} />
            )}
          </div>
          {generatedLink ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Ready</span>
              <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-500">
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="truncate">{copiedLink ? 'Copied!' : generatedLink}</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400">{livePreview.url ? 'Live preview' : 'Fill form to preview'}</p>
          )}
        </div>
        <div className="mt-4 w-full max-w-[300px]">
          <button onClick={() => downloadAsPNG(1024)} disabled={!canDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl disabled:opacity-20">
            <Download className="w-4 h-4" /> Download PNG
          </button>
        </div>
      </div>
    );
  };

  // ─── Desktop right panel (phone mockup + QR + download in one flow) ───
  const DesktopPreview = () => {
    const qrSize = 160;
    return (
      <div className="flex flex-col items-center py-6 px-6 w-full">
        {/* Phone mockup — compact in form mode */}
        <PhoneMockup activeType={selectedType} meta={livePreview.meta} title="Content Preview" compact />

        {/* QR Code section */}
        <div className="w-full max-w-[300px] mt-2">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 text-center">QR Code</p>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col items-center">
            <div className="rounded-lg overflow-hidden p-2 mb-3" style={{ backgroundColor: livePreview.bgColor }}>
              {advanced ? (
                <StyledQRCode value={qrValue} size={qrSize} fgColor={livePreview.fgColor} bgColor={livePreview.bgColor}
                  dotStyle={livePreview.dotStyle || 'square'} cornerSquareStyle={livePreview.cornerSquareStyle || 'square'} logoDataUrl={livePreview.logoDataUrl} />
              ) : (
                <QRCodeSVG value={qrValue} size={qrSize} level="H" fgColor={livePreview.fgColor} bgColor={livePreview.bgColor} includeMargin={false} />
              )}
            </div>

            {generatedLink ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>
                <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-500 hover:text-slate-700 transition-colors">
                  {copiedLink ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span className="truncate">{copiedLink ? 'Copied!' : generatedLink}</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-300 dark:text-slate-600">{livePreview.url ? 'Previewing live changes' : 'Fill form to preview'}</p>
            )}
          </div>

          {/* Download */}
          <div className="mt-3 relative" ref={formatMenuRef}>
            <div className="flex rounded-lg overflow-hidden">
              <button onClick={() => downloadAsPNG(1024)} disabled={!canDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-20">
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>
              <button onClick={() => setShowFormatMenu(v => !v)} disabled={!canDownload}
                className="px-3 bg-slate-800 dark:bg-slate-200 text-white/60 dark:text-slate-500 border-l border-slate-700 dark:border-slate-300 hover:text-white dark:hover:text-slate-900 transition-colors disabled:opacity-20">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFormatMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {showFormatMenu && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-30 py-1">
                  {[
                    { label: 'PNG', sub: '1024×1024', action: () => downloadAsPNG(1024) },
                    { label: 'PNG Hi-Res', sub: '2048×2048', action: () => downloadAsPNG(2048) },
                    { label: 'SVG', sub: 'Vector', action: downloadAsSVG },
                  ].map((f) => (
                    <button key={f.label} onClick={f.action}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <span className="text-xs text-slate-700 dark:text-slate-300">{f.label}</span>
                      <span className="text-[10px] text-slate-400">{f.sub}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {generatedLink && (
              <button onClick={handleCopyLink}
                className="w-full mt-2 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors text-center">
                {copiedLink ? 'Copied to clipboard!' : 'Copy shareable link'}
              </button>
            )}
          </div>
        </div>
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
                className="mx-auto px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 max-w-4xl">
                {/* Title */}
                <div className="mb-10">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Select a QR type
                  </h1>
                </div>

                <QRGridSection
                  title="Dynamic QR"
                  badge="with tracking"
                  badgeColor="emerald"
                  subtitle="Update content in real time, without changing your code"
                  items={dynamicTypes}
                  selectedType={hoveredType}
                  onSelectType={handleTypeSelect}
                  onHoverType={setHoveredType}
                />
                <QRGridSection
                  title="Static QR"
                  badge="fixed content"
                  badgeColor="slate"
                  subtitle="Content is embedded directly — cannot be changed after printing"
                  items={staticTypes}
                  selectedType={hoveredType}
                  onSelectType={handleTypeSelect}
                  onHoverType={setHoveredType}
                />
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
                {renderForm()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Preview / Phone Mockup */}
        <aside className="hidden xl:flex w-[420px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex-col items-center shrink-0 overflow-y-auto">
          {selectedType ? (
            <DesktopPreview />
          ) : (
            <PhoneMockup activeType={hoveredType} />
          )}
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
                <MobilePreview />
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
