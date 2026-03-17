import React from 'react';
import { Loader2 } from 'lucide-react';

// 1. Standard Spinner (Customizable size & text)
export const Spinner = ({ size = 'md', className = '', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-slate-900 dark:text-white transition-colors duration-300`} />
      {text && (
        <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse transition-colors duration-300">
          {text}
        </p>
      )}
    </div>
  );
};

// 2. Full Page Loader (Perfect for App.jsx and ProtectedRoute.jsx)
export const FullPageLoader = ({ text = 'Loading NexusQR...' }) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
      <Spinner size="lg" text={text} />
    </div>
  );
};

// 3. Container Loader (Perfect for lazy-loading Dashboard views)
export const ContainerLoader = ({ text = '' }) => {
  return (
    <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-300">
      <Spinner size="md" text={text} />
    </div>
  );
};