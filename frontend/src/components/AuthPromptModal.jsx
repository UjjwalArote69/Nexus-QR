/* eslint-disable no-unused-vars */
// src/components/AuthPromptModal.jsx
// Post-generation auth nudge — appears AFTER a QR code is successfully created
// by an anonymous user. The QR already works; this modal encourages sign-up
// to unlock editing, analytics, and management. On successful auth, it claims
// all anonymous QR codes for the new user account.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Mail, Lock, User, ArrowRight, X, Loader2,
  BarChart3, Pencil, FolderOpen, CheckCircle2,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { claimAnonymousQRCodes } from '../api/qrcode.api';
import { getSessionToken, clearSessionToken } from '../utils/sessionToken';
import toast from 'react-hot-toast';

const AuthPromptModal = ({ open, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('register'); // Default to register for new users
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setFormData({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Save session token BEFORE auth — login/register clears it
    const sessionToken = getSessionToken();

    try {
      let result;

      if (mode === 'login') {
        result = await login({ email: formData.email, password: formData.password });
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      if (result.success) {
        // ── Claim anonymous QR codes ──
        // After successful auth, transfer all QR codes created with
        // the session token to the newly authenticated user.
        try {
          const claimResult = await claimAnonymousQRCodes(sessionToken);
          if (claimResult.success && claimResult.claimed > 0) {
            toast.success(`${claimResult.claimed} QR code(s) added to your account!`);
          } else {
            toast.success(mode === 'login' ? 'Signed in!' : 'Account created!');
          }
          clearSessionToken(); // Clean up — no longer needed
        } catch (claimErr) {
          // Claim failed but auth succeeded — not a blocker
          console.warn('Failed to claim anonymous QR codes:', claimErr);
          toast.success(mode === 'login' ? 'Signed in!' : 'Account created!');
        }

        setFormData({ name: '', email: '', password: '' });
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      } else {
        toast.error(result.message || (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white dark:bg-slate-950 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header with success context */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 px-6 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    QR code created!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your code is live and working
                  </p>
                </div>
              </div>

              {/* Benefits of signing up */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Pencil, label: 'Edit anytime' },
                  { icon: BarChart3, label: 'Scan analytics' },
                  { icon: FolderOpen, label: 'Organize codes' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/30"
                  >
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {mode === 'register'
                  ? 'Create a free account to manage your QR codes:'
                  : 'Sign in to add this QR code to your account:'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name field (register only) */}
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required={mode === 'register'}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 mt-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign in' : 'Create free account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 mt-3">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </form>
            </div>

            {/* Skip option */}
            <div className="px-6 pb-5">
              <button
                onClick={onClose}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2"
              >
                Skip for now — I'll sign up later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;