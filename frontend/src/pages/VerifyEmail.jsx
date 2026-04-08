import { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';

const VerifyEmail = () => {
  usePageTitle('Verify Email');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    API.get(`/users/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      <Link to="/" className="flex items-center space-x-2 mb-8">
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700/50">
          <QrCode className="w-6 h-6 text-slate-900 dark:text-white" />
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">Klink</span>
      </Link>

      {status === 'loading' && (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500" />
      )}

      {status === 'success' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{message}</h2>
          <Link to="/dashboard" className="inline-block px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm mt-2">
            Go to Dashboard
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verification failed</h2>
          <p className="text-slate-500 text-sm">{message}</p>
          <Link to="/login" className="inline-block text-sm font-medium text-slate-900 dark:text-white hover:underline mt-2">
            Go to Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
