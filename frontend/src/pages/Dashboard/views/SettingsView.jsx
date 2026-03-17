/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Moon, Sun, Monitor, Database, Trash2,
  Download, Bell, BellOff, Loader2, AlertTriangle,
  Clock, Eye, EyeOff, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../../store/authStore';
import { deleteAccount } from '../../../api/auth.api';
import { fetchMyQRCodes } from '../../../api/qrcode.api';

const SettingsView = () => {
  // Theme state — read directly from DOM to avoid import issues with useTheme
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Notifications preference (persisted to localStorage)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('nexusqr_notifications') !== 'false';
  });

  // QR code links default visibility
  const [showShortLinks, setShowShortLinks] = useState(() => {
    return localStorage.getItem('nexusqr_show_links') !== 'false';
  });

  // Default scan period
  const [defaultPeriod, setDefaultPeriod] = useState(() => {
    return localStorage.getItem('nexusqr_default_period') || '7d';
  });

  // Export state
  const [exporting, setExporting] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Theme selection: 'dark', 'light', 'system'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('nexusqr_theme_mode') || (isDark ? 'dark' : 'light');
  });

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('nexusqr_theme_mode', mode);

    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark !== isDark) toggleTheme();
    } else if (mode === 'dark' && !isDark) {
      toggleTheme();
    } else if (mode === 'light' && isDark) {
      toggleTheme();
    }
  };

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('nexusqr_notifications', String(next));
    toast.success(next ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleToggleShortLinks = () => {
    const next = !showShortLinks;
    setShowShortLinks(next);
    localStorage.setItem('nexusqr_show_links', String(next));
    toast.success(next ? 'Short links visible' : 'Short links hidden');
  };

  const handlePeriodChange = (period) => {
    setDefaultPeriod(period);
    localStorage.setItem('nexusqr_default_period', period);
    toast.success(`Default period set to ${period}`);
  };

  // Export all QR codes as CSV
  const handleExportData = useCallback(async () => {
    setExporting(true);
    try {
      const qrResult = await fetchMyQRCodes();

      if (!qrResult.success || !qrResult.data?.length) {
        toast.error('No data to export');
        setExporting(false);
        return;
      }

      const qrCodes = qrResult.data;

      // Build CSV
      const headers = ['Title', 'Type', 'Short ID', 'Target URL', 'Scans', 'Status', 'Favorite', 'Created At', 'Description', 'Expires At', 'Max Scans'];
      const rows = qrCodes.map(qr => [
        `"${(qr.title || '').replace(/"/g, '""')}"`,
        qr.qrType,
        qr.shortId,
        `"${(qr.targetUrl || '').replace(/"/g, '""')}"`,
        qr.scanCount || 0,
        qr.isActive ? 'Active' : 'Paused',
        qr.isFavorite ? 'Yes' : 'No',
        new Date(qr.createdAt).toISOString(),
        `"${(qr.description || '').replace(/"/g, '""')}"`,
        qr.expiresAt ? new Date(qr.expiresAt).toISOString() : '',
        qr.maxScans || '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexusqr-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${qrCodes.length} QR codes as CSV`);
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  }, []);

  // Delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      logout();
      window.location.href = '/';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your workspace, preferences, and data management.
          </p>
        </div>

        <div className="space-y-6">

          {/* Appearance */}
          <SettingsSection title="Appearance" icon={isDark ? Moon : Sun}>
            <SettingsRow
              title="Theme"
              description="Choose your preferred color scheme."
              action={
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        themeMode === value
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              }
            />
          </SettingsSection>

          {/* Preferences */}
          <SettingsSection title="Preferences" icon={Clock}>
            <div className="space-y-4">
              <SettingsRow
                title="Scan Notifications"
                description="Show toast notifications when your QR codes are scanned."
                action={
                  <ToggleSwitch
                    enabled={notificationsEnabled}
                    onToggle={handleToggleNotifications}
                    iconOn={Bell}
                    iconOff={BellOff}
                  />
                }
              />
              <SettingsRow
                title="Show Short Links"
                description="Display tracking short links on QR code cards."
                action={
                  <ToggleSwitch
                    enabled={showShortLinks}
                    onToggle={handleToggleShortLinks}
                    iconOn={Eye}
                    iconOff={EyeOff}
                  />
                }
              />
              <SettingsRow
                title="Default Analytics Period"
                description="Default time range for analytics dashboards."
                action={
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {['24h', '7d', '30d', '90d'].map(p => (
                      <button
                        key={p}
                        onClick={() => handlePeriodChange(p)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                          defaultPeriod === p
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                }
              />
            </div>
          </SettingsSection>

          {/* Data & Export */}
          <SettingsSection title="Data & Privacy" icon={Database}>
            <div className="space-y-4">
              <SettingsRow
                title="Export All Data"
                description="Download all your QR codes and metadata as a CSV file."
                action={
                  <button
                    onClick={handleExportData}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {exporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                }
              />

              <SettingsRow
                title="Account Info"
                description={`Signed in as ${user?.email || 'N/A'} since ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}.`}
                action={
                  <button
                    onClick={() => { logout(); window.location.href = '/'; }}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                }
              />
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-red-900 dark:text-red-300">Danger Zone</h2>
            </div>

            <SettingsRow
              title="Delete Account"
              description="Permanently remove your account and all associated data. This action cannot be undone."
              action={
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              }
            />
          </div>

        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} />
            <motion.div
              className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md p-6 space-y-5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete Account?</h2>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                This will permanently delete your account, all QR codes, scan history, and associated data. This action <strong className="text-red-600 dark:text-red-400">cannot be undone</strong>.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm your password
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Helper Components --- */

const SettingsSection = ({ title, icon: Icon, children }) => (
  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </div>
);

const SettingsRow = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
    <div className="max-w-md">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
    </div>
    <div className="flex shrink-0">{action}</div>
  </div>
);

const ToggleSwitch = ({ enabled, onToggle, iconOn: IconOn, iconOff: IconOff }) => (
  <button
    onClick={onToggle}
    className={`relative flex items-center w-12 h-7 rounded-full transition-colors duration-200 ${
      enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
    }`}
  >
    <motion.div
      className="absolute w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center"
      animate={{ x: enabled ? 24 : 4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {enabled
        ? <IconOn className="w-3 h-3 text-blue-600" />
        : <IconOff className="w-3 h-3 text-slate-400" />
      }
    </motion.div>
  </button>
);

export default SettingsView;
