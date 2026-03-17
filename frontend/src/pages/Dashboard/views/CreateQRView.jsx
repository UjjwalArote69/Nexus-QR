import React, {
  useState,
  useContext,
} from "react";
import QRGridSection from "../components/QRGridSection";
import WebsiteQRForm from "../components/Dynamic/WebsiteQRForm";
import VCardQRForm from "../components/Dynamic/VCardQRForm";
import { QRCodeSVG } from "qrcode.react";
import { BuilderContext } from "../Dashboard";
import PdfQRForm from "../components/Dynamic/PdfQRForm";
import VideoQRForm from "../components/Dynamic/VideoQRForm";
import {
  Globe,
  FileText,
  ImageIcon,
  UserSquare,
  Video,
  AlignJustify,
  Smile,
  Music,
  Building2,
  Ticket,
  Smartphone,
  Monitor,
  Type,
  Mail,
  MessageSquare,
  Wifi,
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

const CreateQRView = () => {
  const {
    selectedType,
    setSelectedType,
    setBuilderStep,
  } = useContext(BuilderContext);

  const [
    generatedLink,
    setGeneratedLink,
  ] = useState(null);

  // LIVE PREVIEW STATE (Receives updates from the active form)
  const [livePreview, setLivePreview] =
    useState({
      url: "",
      fgColor: "#000000",
      bgColor: "#ffffff",
    });

  const dynamicQrTypes = [
    {
      name: "Website",
      desc: "Open a URL",
      icon: Globe,
    },
    {
      name: "PDF",
      desc: "Show a PDF",
      icon: FileText,
    },
    {
      name: "Images",
      desc: "Show an image gallery",
      icon: ImageIcon,
    },
    {
      name: "vCard Plus",
      desc: "Share contact details",
      icon: UserSquare,
    },
    {
      name: "Video",
      desc: "Show a video",
      icon: Video,
    },
    {
      name: "List of links",
      desc: "Group links",
      icon: AlignJustify,
    },
    {
      name: "Social Media",
      desc: "Share your social profiles",
      icon: Smile,
    },
    {
      name: "MP3",
      desc: "Play an audio file",
      icon: Music,
    },
    {
      name: "Business",
      desc: "Share information about your business",
      icon: Building2,
    },
    {
      name: "Coupon",
      desc: "Share a coupon",
      icon: Ticket,
    },
    {
      name: "Apps",
      desc: "Redirect to app stores",
      icon: Smartphone,
    },
    {
      name: "Landing page",
      desc: "Create a custom page",
      icon: Monitor,
    },
  ];

  const staticQrTypes = [
    {
      name: "Text",
      desc: "Display plain text",
      icon: Type,
    },
    {
      name: "Email",
      desc: "Send an email",
      icon: Mail,
    },
    {
      name: "SMS",
      desc: "Send a text message",
      icon: MessageSquare,
    },
    {
      name: "Wi-Fi",
      desc: "Connect to a wireless network",
      icon: Wifi,
    },
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setBuilderStep(2);
    setGeneratedLink(null);
    setLivePreview({
      url: "",
      fgColor: "#000000",
      bgColor: "#ffffff",
    }); // Reset preview
  };

  const handleBackToGrid = () => {
    setSelectedType(null);
    setBuilderStep(1);
  };

  // Choose the URL to show in the QR Code
  // If generated, show the shortlink. Otherwise, show what they typed (or placeholder).
  const qrDisplayValue = generatedLink
    ? generatedLink
    : livePreview.url ||
      "https://nexusqr.com";

  return (
    <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden">
      {/* LEFT PANEL */}
      <div className="flex-1 xl:overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {!selectedType ? (
          <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <QRGridSection
              title="Dynamic QR"
              badge="with tracking"
              description="Update content in real time, without changing your code."
              items={dynamicQrTypes}
              onSelectType={
                handleTypeSelect
              }
            />
            <QRGridSection
              title="Static QR"
              badge="no tracking"
              description="Fixed content that cannot be changed once printed."
              items={staticQrTypes}
              onSelectType={
                handleTypeSelect
              }
            />
          </div>
        ) : (
          <div className="h-full">
            {selectedType.name ===
            "Website" ? (
              <WebsiteQRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name ===
              "PDF" ? (
              <PdfQRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name ===
                "Images" ||
              selectedType.name ===
                "Image" ? (
              <ImageQRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name ===
                "vCard Plus" ||
              selectedType.name ===
                "vCard" ||
              selectedType.name ===
                "Contact" ? (
              <VCardQRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name ===
              "Video" ? (
              <VideoQRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name ===
              "List of links" ? (
              <LinksQRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name ===
                "Social Media" ||
              selectedType.name ===
                "Social" ? (
              <SocialQRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name ===
              "MP3" ? (
              <Mp3QRForm
                onBack={
                  handleBackToGrid
                }
                onGenerated={(link) =>
                  setGeneratedLink(link)
                }
                onLiveUpdate={(data) =>
                  setLivePreview(data)
                }
              />
            ) : selectedType.name === "Business" ? (
              <BusinessQRForm
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : selectedType.name === "Coupon" ? (
              <CouponQRForm
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : (selectedType.name === "Apps" || selectedType.name === "App") ? (
              <AppStoreQRForm 
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : (selectedType.name === "Landing page" || selectedType.name === "Landing Page") ? (
              <LandingPageQRForm 
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : selectedType.name === "Text" ? (
              <TextQRForm 
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : selectedType.name === "Email" ? (
              <EmailQRForm 
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : selectedType.name === "Wi-Fi" ? (
              <WifiQRForm 
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : selectedType.name === "SMS" ? (
              <SmsQRForm
                onBack={handleBackToGrid} 
                onGenerated={(link) => setGeneratedLink(link)} 
                onLiveUpdate={(data) => setLivePreview(data)} 
              />
            ) : (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <p className="mb-4 text-lg">
                  Form for{" "}
                  <strong>
                    {selectedType.name}
                  </strong>{" "}
                  is coming soon!
                </p>
                <button
                  onClick={
                    handleBackToGrid
                  }
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  &larr; Back to types
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PREVIEW PANE */}
      <aside className="w-full xl:w-[450px] border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 shrink-0 xl:overflow-y-auto transition-colors duration-300">
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-8">
          Live Preview
        </h2>

        <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[650px] rounded-[3rem] border-[12px] border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-xl dark:shadow-2xl flex items-center justify-center overflow-hidden transition-colors duration-300">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-200 dark:bg-slate-900 rounded-full z-20 transition-colors duration-300"></div>

          <div className="text-center w-full px-6 flex flex-col items-center justify-center h-full">
            {selectedType ? (
              <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                {/* Dynamically Styled Live Preview */}
                <div
                  className="p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4 transition-colors"
                  style={{
                    backgroundColor:
                      livePreview.bgColor,
                  }}
                >
                  <QRCodeSVG
                    value={
                      qrDisplayValue
                    }
                    size={180}
                    level={"H"}
                    fgColor={
                      livePreview.fgColor
                    }
                    bgColor={
                      livePreview.bgColor
                    }
                    includeMargin={
                      false
                    }
                  />
                </div>

                {generatedLink ? (
                  <>
                    <p className="text-xs text-slate-500 mt-4 break-all bg-slate-100 dark:bg-slate-800 p-2 rounded max-w-[200px]">
                      {generatedLink}
                    </p>
                    <p className="mt-6 text-sm font-medium text-green-600 dark:text-green-400">
                      Ready to scan!
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 mt-4">
                    {livePreview.url
                      ? "Updating live..."
                      : "Enter a URL to update"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-lg text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                Select a type
                <br />
                to start designing
              </p>
            )}
          </div>

          <div className="absolute top-32 -left-3.5 w-1 h-12 bg-slate-300 dark:bg-slate-800 rounded-l-md transition-colors duration-300"></div>
          <div className="absolute top-48 -left-3.5 w-1 h-12 bg-slate-300 dark:bg-slate-800 rounded-l-md transition-colors duration-300"></div>
          <div className="absolute top-40 -right-3.5 w-1 h-16 bg-slate-300 dark:bg-slate-800 rounded-r-md transition-colors duration-300"></div>
        </div>
      </aside>
    </div>
  );
};

export default CreateQRView;
