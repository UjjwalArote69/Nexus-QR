/* eslint-disable no-unused-vars */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';

const useScanNotifications = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('scan', (data) => {
      const location = [data.city, data.country].filter(Boolean).join(', ') || 'Unknown location';
      const device = data.os || data.deviceType || 'Unknown device';

      toast(
        (t) => (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">New Scan!</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                <span className="font-medium">{data.qrTitle}</span> scanned from {location}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {device} &middot; {data.browser || 'Unknown browser'}
              </p>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-right',
          style: {
            background: 'var(--toast-bg, #fff)',
            border: '1px solid var(--toast-border, #e2e8f0)',
            padding: '12px',
            borderRadius: '12px',
          },
        }
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return socketRef;
};

export default useScanNotifications;
