import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, BarChart3, Users, TrendingUp, Plus,
  Globe, Smartphone, Monitor, Clock, ArrowRight,
  Zap, Star
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import { fetchMyQRCodes, fetchRecentScans } from '../../../api/qrcode.api';
import { fetchOverview } from '../../../api/analytics.api';
import AnimatedPage from '../../../components/ui/AnimatedPage';
import { SkeletonKPI } from '../../../components/ui/Skeleton';

const HomeView = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [recentQRs, setRecentQRs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [qrs, overview, scans] = await Promise.all([
          fetchMyQRCodes(),
          fetchOverview('7d').catch(() => ({ data: { totalScans: 0, uniqueVisitors: 0, activeCampaigns: 0, scansTrend: 0 } })),
          fetchRecentScans().catch(() => ({ data: [] })),
        ]);
        if (qrs.success) {
          setRecentQRs(qrs.data.slice(0, 5));
        }
        setStats(overview.data);
        setRecentScans(scans.data?.slice(0, 8) || []);
      } catch (err) {
        // Gracefully handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const deviceIcon = (type) => {
    if (type === 'mobile' || type === 'tablet') return <Smartphone className="w-3.5 h-3.5" />;
    return <Monitor className="w-3.5 h-3.5" />;
  };

  return (
    <AnimatedPage className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here's what's happening with your QR campaigns.
            </p>
          </div>
          <button
            onClick={() => onNavigate('Create QR')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create QR Code
          </button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total QR Codes"
              value={recentQRs.length > 0 ? recentQRs.length.toString() : '0'}
              icon={QrCode}
              color="blue"
              index={0}
            />
            <StatCard
              title="Total Scans (7d)"
              value={stats?.totalScans?.toLocaleString() || '0'}
              icon={BarChart3}
              trend={stats?.scansTrend}
              color="emerald"
              index={1}
            />
            <StatCard
              title="Unique Visitors (7d)"
              value={stats?.uniqueVisitors?.toLocaleString() || '0'}
              icon={Users}
              trend={stats?.uniqueTrend}
              color="violet"
              index={2}
            />
            <StatCard
              title="Active Campaigns"
              value={stats?.activeCampaigns?.toString() || '0'}
              icon={TrendingUp}
              color="amber"
              index={3}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Scans</h2>
              <button
                onClick={() => onNavigate('Statistics')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View Analytics <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                  <Zap className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No scans yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Share your QR codes to see live activity here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentScans.map((scan, i) => (
                  <motion.div
                    key={scan.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                      {deviceIcon(scan.deviceType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {scan.qrTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {scan.city && scan.city !== 'Unknown' ? `${scan.city}, ` : ''}{scan.country || 'Unknown'} &middot; {scan.os || 'Unknown'} &middot; {scan.browser || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {timeAgo(scan.scannedAt)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions + Recent QRs */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Create QR Code', icon: Plus, nav: 'Create QR', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
                  { label: 'View My QR Codes', icon: QrCode, nav: 'My QR Codes', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
                  { label: 'Check Analytics', icon: BarChart3, nav: 'Statistics', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
                  { label: 'Manage Templates', icon: Star, nav: 'Templates', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
                ].map(({ label, icon: Icon, nav, color }) => (
                  <button
                    key={nav}
                    onClick={() => onNavigate(nav)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                  >
                    <div className={`p-2 rounded-lg ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 ml-auto group-hover:text-slate-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent QR Codes */}
            <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent QR Codes</h2>
                <button
                  onClick={() => onNavigate('My QR Codes')}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all
                </button>
              </div>

              {recentQRs.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No QR codes yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentQRs.map(qr => (
                    <div key={qr.id} className="flex items-center gap-3 p-2 rounded-lg">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <QrCode className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{qr.title}</p>
                        <p className="text-[11px] text-slate-400">{qr.scanCount} scans</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                        {qr.qrType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

const cardColors = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', index = 0 }) => (
  <motion.div
    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.35 }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</span>
      <div className={`p-2 rounded-lg ${cardColors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{value}</span>
      {trend !== undefined && trend !== null && (
        <span className={`text-xs font-semibold mb-0.5 ${
          trend > 0 ? 'text-green-600 dark:text-green-400' : trend < 0 ? 'text-red-500' : 'text-slate-400'
        }`}>
          {trend > 0 ? '+' : ''}{Math.round(trend * 10) / 10}%
        </span>
      )}
    </div>
  </motion.div>
);

export default HomeView;
