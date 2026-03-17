import React, { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Lock, LogOut,
  Check, Loader2, Eye, EyeOff, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../../store/authStore';
import { updateProfile, changePassword, deleteAccount } from '../../../api/auth.api';
import { fetchMyQRCodes } from '../../../api/qrcode.api';
import AnimatedPage from '../../../components/ui/AnimatedPage';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const UserProfileView = () => {
  const { user, logout, checkAuth } = useAuthStore();

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalQRs: 0, totalScans: 0 });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    fetchMyQRCodes()
      .then(res => {
        if (res.success) {
          const qrs = res.data;
          setStats({
            totalQRs: qrs.length,
            totalScans: qrs.reduce((sum, qr) => sum + (qr.scanCount || 0), 0),
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const result = await updateProfile({ name, email });
      if (result.success) {
        toast.success('Profile updated successfully');
        await checkAuth();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordSaving(true);
    try {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Account deleted');
      logout();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  return (
    <AnimatedPage className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              User Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal information and account security.
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Details */}
            <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Details</h2>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center text-white dark:text-slate-900 text-2xl font-bold shadow-lg">
                  {initials}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Loading...'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  {memberSince && (
                    <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded">
                      Member since {memberSince}
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving || (name === user?.name && email === user?.email)}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
                  >
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            {/* Change Password */}
            <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center space-x-2 mb-6">
                <Lock className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h2>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                          required
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
                  >
                    {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Account Stats */}
            <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Account Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">QR Codes Created</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.totalQRs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total Scans</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.totalScans.toLocaleString()}</span>
                </div>
                {memberSince && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Member Since</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{memberSince}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="p-6 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center space-x-2 mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
              </div>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-4">
                Permanently delete your account and all associated QR codes, analytics, and templates. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
              >
                Delete Account
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletePassword(''); }}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account?"
        message="This will permanently delete your account, all QR codes, analytics, and templates. This cannot be undone."
        confirmText="Delete Account"
        loading={deleting}
        variant="danger"
      >
        <input
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Enter your password to confirm"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
        />
      </ConfirmModal>
    </AnimatedPage>
  );
};

export default UserProfileView;
