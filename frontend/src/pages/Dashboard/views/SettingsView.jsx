/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import {
  Moon, Sun, Monitor, Database, Trash2,
  Download, Bell, BellOff, Loader2, AlertTriangle,
  Clock, Eye, EyeOff, LogOut, Palette, Link2, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../../store/authStore';
import { deleteAccount } from '../../../api/auth.api';
import { fetchMyQRCodes } from '../../../api/qrcode.api';
import usePageTitle from '../../../hooks/usePageTitle';

const SettingsView = () => {
  usePageTitle('Settings');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('klink_notifications') !== 'false');
  const [showShortLinks, setShowShortLinks] = useState(() => localStorage.getItem('klink_show_links') !== 'false');
  const [defaultPeriod, setDefaultPeriod] = useState(() => localStorage.getItem('klink_default_period') || '7d');
  const [exporting, setExporting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('klink_theme_mode') || (isDark ? 'dark' : 'light'));

  const handleThemeChange = (mode) => {
    setThemeMode(mode); localStorage.setItem('klink_theme_mode', mode);
    if (mode === 'system') { const sys = window.matchMedia('(prefers-color-scheme: dark)').matches; if (sys !== isDark) toggleTheme(); }
    else if (mode === 'dark' && !isDark) toggleTheme();
    else if (mode === 'light' && isDark) toggleTheme();
  };

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled; setNotificationsEnabled(next);
    localStorage.setItem('klink_notifications', String(next));
    toast.success(next ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleToggleShortLinks = () => {
    const next = !showShortLinks; setShowShortLinks(next);
    localStorage.setItem('klink_show_links', String(next));
    toast.success(next ? 'Short links visible' : 'Short links hidden');
  };

  const handlePeriodChange = (period) => {
    setDefaultPeriod(period); localStorage.setItem('klink_default_period', period);
  };

  const handleExportData = useCallback(async () => {
    setExporting(true);
    try {
      const qrResult = await fetchMyQRCodes();
      if (!qrResult.success || !qrResult.data?.length) { toast.error('No data to export'); setExporting(false); return; }
      const qrCodes = qrResult.data;
      const headers = ['Title', 'Type', 'Short ID', 'Target URL', 'Scans', 'Status', 'Favorite', 'Created At', 'Description', 'Expires At', 'Max Scans'];
      const rows = qrCodes.map(qr => [
        `"${(qr.title || '').replace(/"/g, '""')}"`, qr.qrType, qr.shortId,
        `"${(qr.targetUrl || '').replace(/"/g, '""')}"`, qr.scanCount || 0,
        qr.isActive ? 'Active' : 'Paused', qr.isFavorite ? 'Yes' : 'No',
        new Date(qr.createdAt).toISOString(), `"${(qr.description || '').replace(/"/g, '""')}"`,
        qr.expiresAt ? new Date(qr.expiresAt).toISOString() : '', qr.maxScans || '',
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.download = `klink-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
      toast.success(`Exported ${qrCodes.length} QR codes`);
    } catch { toast.error('Failed to export data'); }
    finally { setExporting(false); }
  }, []);

  const handleDeleteAccount = async () => {
    if (!deletePassword) { toast.error('Please enter your password'); return; }
    setDeleting(true);
    try { await deleteAccount(deletePassword); toast.success('Account deleted'); logout(); window.location.href = '/'; }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete account'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-3xl mx-auto px-6 py-8 sm:px-10 sm:py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your preferences, data, and account.</p>
        </div>

        <div className="space-y-10">

          {/* ── Appearance ── */}
          <Section title="Appearance" icon={Palette} description="Control how Klink looks for you.">
            <Row title="Theme" description="Select a color mode for the interface.">
              <SegmentedControl
                options={[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'Auto', icon: Monitor },
                ]}
                value={themeMode}
                onChange={handleThemeChange}
              />
            </Row>
          </Section>

          {/* ── Preferences ── */}
          <Section title="Preferences" icon={Clock} description="Default behaviors for your dashboard.">
            <Row title="Scan notifications" description="Toast alerts when someone scans your QR codes.">
              <Toggle enabled={notificationsEnabled} onToggle={handleToggleNotifications} />
            </Row>
            <Divider />
            <Row title="Show short links" description="Display the tracking URL on QR code cards.">
              <Toggle enabled={showShortLinks} onToggle={handleToggleShortLinks} />
            </Row>
            <Divider />
            <Row title="Default analytics period" description="Time range used when you open analytics.">
              <SegmentedControl
                options={[
                  { value: '24h', label: '24h' },
                  { value: '7d', label: '7d' },
                  { value: '30d', label: '30d' },
                  { value: '90d', label: '90d' },
                ]}
                value={defaultPeriod}
                onChange={handlePeriodChange}
              />
            </Row>
          </Section>

          {/* ── Data ── */}
          <Section title="Data & Export" icon={Database} description="Download or manage your data.">
            <Row title="Export all QR codes" description="Download a CSV with all your codes, scan counts, and metadata.">
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-40"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </Row>
          </Section>

          {/* ── Account ── */}
          <Section title="Account" icon={Shield} description={`Signed in as ${user?.email || '—'}`}>
            <Row title="Sign out" description="Log out of your current session on this device.">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </Row>
            <Divider />
            <Row title="Delete account" description="Permanently remove your account and all data. This cannot be undone." danger>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete account
              </button>
            </Row>
          </Section>

        </div>
      </div>

      {/* ── Logout Modal ── */}
      <Modal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Sign out</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to log out?</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => { logout(); window.location.href = '/'; }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal open={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Delete account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">This permanently deletes everything.</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-300">
            All QR codes, scan history, templates, and folders will be deleted. <strong>This cannot be undone.</strong>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm your password</label>
          <div className="relative">
            <input
              type={showDeletePassword ? 'text' : 'password'}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 pr-10"
            />
            <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDeleteAccount} disabled={deleting || !deletePassword}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Deleting...' : 'Delete forever'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

/* ─── Reusable pieces ─── */

const Section = ({ title, icon: Icon, description, children }) => (
  <section>
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-[18px] h-[18px] text-slate-500 dark:text-slate-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description && <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="ml-12 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/30">
      {children}
    </div>
  </section>
);

const Row = ({ title, description, danger, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
    <div className="min-w-0">
      <h3 className={`text-sm font-medium ${danger ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>{title}</h3>
      {description && <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Divider = () => null; // handled by divide-y on parent

const SegmentedControl = ({ options, value, onChange }) => (
  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
    {options.map(({ value: v, label, icon: Icon }) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          value === v
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </button>
    ))}
  </div>
);

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
      enabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
    }`}
  >
    <motion.div
      className={`absolute top-0.5 w-5 h-5 rounded-full shadow-sm ${
        enabled ? 'bg-white dark:bg-slate-900' : 'bg-white dark:bg-slate-400'
      }`}
      animate={{ left: enabled ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
        <motion.div
          className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-5"
          initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SettingsView;
