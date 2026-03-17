import React, {
  useState,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Download,
  Contact,
} from "lucide-react";

const VCardProfile = () => {
  const { shortId } = useParams();
  const [profile, setProfile] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch the public QR data using the route we made earlier
        const response =
          await axios.get(
            `http://localhost:5000/api/qrcodes/public/${shortId}`,
          );
        if (response.data.success) {
          setProfile(
            response.data.data.content,
          ); // Extract the JSON content
        }
      } catch (err) {
        setError(
          "Contact profile not found or inactive. :",
          err,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [shortId]);

  // Function to generate and download a .vcf file natively to the phone
  const handleSaveContact = () => {
    if (!profile) return;

    const vCardData = `
BEGIN:VCARD
VERSION:3.0
N:${profile.lastName || ""};${profile.firstName || ""};;;
FN:${profile.firstName || ""} ${profile.lastName || ""}
ORG:${profile.company || ""}
TITLE:${profile.jobTitle || ""}
TEL;TYPE=WORK,VOICE:${profile.phone || ""}
EMAIL;TYPE=PREF,INTERNET:${profile.email || ""}
URL:${profile.website || ""}
ADR;TYPE=intl,postal,parcel,work:;;${profile.address || ""};;;;
END:VCARD
    `.trim();

    const blob = new Blob([vCardData], {
      type: "text/vcard",
    });
    const url =
      URL.createObjectURL(blob);
    const link =
      document.createElement("a");
    link.href = url;
    link.download = `${profile.firstName || "Contact"}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Contact className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-800">
          Profile Not Found
        </h1>
        <p className="text-slate-500 mt-2 text-center">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* Header Profile Section */}
        <div className="bg-emerald-500 pt-12 pb-6 px-6 text-center relative">
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
            <span className="text-4xl font-bold text-emerald-500">
              {profile.firstName?.charAt(
                0,
              )}
              {profile.lastName?.charAt(
                0,
              )}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {profile.firstName}{" "}
            {profile.lastName}
          </h1>
          {profile.jobTitle && (
            <p className="text-emerald-100 font-medium">
              {profile.jobTitle}
            </p>
          )}
          {profile.company && (
            <p className="text-emerald-50 text-sm opacity-90">
              {profile.company}
            </p>
          )}
        </div>

        {/* Contact Details List */}
        <div className="p-6 space-y-4">
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                  Mobile
                </p>
                <p className="text-slate-900 dark:text-white font-medium">
                  {profile.phone}
                </p>
              </div>
            </a>
          )}

          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                  Email
                </p>
                <p className="text-slate-900 dark:text-white font-medium break-all">
                  {profile.email}
                </p>
              </div>
            </a>
          )}

          {/* Strictly check that website exists and isn't the word "null" */}
          {profile.website &&
            profile.website !==
              "null" &&
            profile.website.trim() !==
              "" && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                    Website
                  </p>
                  <p className="text-slate-900 dark:text-white font-medium break-all">
                    {/* Clean up the display URL so it looks nice (removes https://) */}
                    {profile.website.replace(
                      /^https?:\/\//,
                      "",
                    )}
                  </p>
                </div>
              </a>
            )}

          {profile.address && (
            <div className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 text-orange-600 rounded-full flex items-center justify-center mr-4 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                  Address
                </p>
                <p className="text-slate-900 dark:text-white font-medium">
                  {profile.address}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Save to Contacts Button */}
        <div className="p-6 pt-0">
          <button
            onClick={handleSaveContact}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
          >
            <Download className="w-5 h-5" />
            Save to Contacts
          </button>
        </div>
      </div>
    </div>
  );
};

export default VCardProfile;
