import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import usePageTitle from '../hooks/usePageTitle';

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-600' };
};

const ResetPassword = () => {
  usePageTitle('Reset Password');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await API.post('/users/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Invalid reset link</h1>
        <p className="text-slate-500 mt-2">This password reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="mt-4 text-sm font-medium text-slate-900 dark:text-white hover:underline">
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-8 group">
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <QrCode className="w-6 h-6 text-slate-900 dark:text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Klink</span>
        </Link>

        {done ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Password reset</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Your password has been updated. You can now sign in.</p>
            <Link to="/login" className="inline-block px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm mt-2">
              Sign in
            </Link>
          </motion.div>
        ) : (
          <>
            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Set new password</h2>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="bg-white dark:bg-slate-900/50 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New password</label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type={showPassword ? 'text' : 'password'} required minLength={8}
                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 sm:text-sm"
                        placeholder="At least 8 characters"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{passwordStrength.label}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type={showPassword ? 'text' : 'password'} required minLength={8}
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 sm:text-sm ${confirm && confirm !== password ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                        placeholder="Repeat password"
                        value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      />
                    </div>
                    {confirm && confirm !== password && (
                      <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white dark:text-black bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Resetting...' : 'Reset password'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
