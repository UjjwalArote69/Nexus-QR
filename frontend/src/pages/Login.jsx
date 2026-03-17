/* eslint-disable no-unused-vars */

import  { useState,  } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Mail, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import  useTheme  from '../hooks/useTheme';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { login,  } = useAuthStore();
  const navigate = useNavigate();


  const { isDark, toggleTheme } = useTheme();

 const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    
    if (result.success) {
    // Add the success toast here
    toast.success('Successfully logged in!');
    navigate('/dashboard'); 
  } else {
    // Optional: You can also show errors as a toast!
    toast.error('Invalid email or password');
  }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-slate-200 dark:selection:bg-slate-600/30 relative overflow-hidden transition-colors duration-300">
      
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow transition-all group"
        >
          {isDark ? (
            <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-slate-300/30 dark:bg-slate-100/5 rounded-full blur-[60px] md:blur-[120px] pointer-events-none transition-colors duration-300" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-8 group">
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700/50 group-hover:border-slate-300 dark:group-hover:border-slate-500 transition-colors">
            <QrCode className="w-6 h-6 text-slate-900 dark:text-white transition-colors" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">NexusQR</span>
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 transition-colors">
          Sign in to access your command center
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-slate-900/50 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-black/40 sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800 backdrop-blur-sm transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Email address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-400 transition-colors sm:text-sm"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-400 transition-colors sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-slate-400 focus:ring-offset-white dark:focus:ring-offset-slate-950 transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400 transition-colors">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-sm font-semibold text-white dark:text-black bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 focus:ring-slate-900 dark:focus:ring-white transition-all"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800 transition-colors" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 transition-colors">
                  New to NexusQR?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/register" className="text-sm font-medium text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;