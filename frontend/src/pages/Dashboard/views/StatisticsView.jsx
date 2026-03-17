import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, MousePointerClick, TrendingUp,
  Calendar, MapPin, MonitorSmartphone, ArrowUpRight,
  RefreshCw, Loader2
} from 'lucide-react';
import AnimatedPage from '../../../components/ui/AnimatedPage';
import { SkeletonKPI, SkeletonChart } from '../../../components/ui/Skeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  fetchOverview,
  fetchTimeseries,
  fetchDevices,
  fetchGeo,
  fetchTopCampaigns,
} from '../../../api/analytics.api';
import ScanHeatmap from '../../../components/ScanHeatmap';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const PERIODS = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

const StatisticsView = ({ onViewQRAnalytics }) => {
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ totalScans: 0, uniqueVisitors: 0, activeCampaigns: 0, scansTrend: 0, uniqueTrend: 0 });
  const [timeseries, setTimeseries] = useState([]);
  const [devices, setDevices] = useState({ os: [], deviceType: [] });
  const [geo, setGeo] = useState([]);
  const [topCampaigns, setTopCampaigns] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, ts, dv, ge, tc] = await Promise.all([
        fetchOverview(period),
        fetchTimeseries(period),
        fetchDevices(period),
        fetchGeo(period),
        fetchTopCampaigns(period),
      ]);
      setOverview(ov.data);
      setTimeseries(ts.data);
      setDevices(dv.data);
      setGeo(ge.data);
      setTopCampaigns(tc.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- Chart Data ---
  const lineChartData = {
    labels: timeseries.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Total Scans',
      data: timeseries.map(d => d.scans),
      borderColor: '#94a3b8',
      backgroundColor: 'rgba(148, 163, 184, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#f8fafc',
      pointBorderColor: '#64748b',
      pointRadius: timeseries.length > 30 ? 0 : 4,
      pointHoverRadius: 6,
    }],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'Inter, sans-serif' }, maxTicksLimit: 7 },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'Inter, sans-serif' } },
        beginAtZero: true,
      },
    },
  };

  // Device Doughnut
  const osData = devices.os || [];
  const totalDeviceScans = osData.reduce((sum, d) => sum + d.count, 0);
  const mobileCount = (devices.deviceType || [])
    .filter(d => d.name === 'mobile' || d.name === 'tablet')
    .reduce((sum, d) => sum + d.count, 0);
  const mobilePercent = totalDeviceScans > 0 ? Math.round((mobileCount / totalDeviceScans) * 100) : 0;

  const osColors = ['#0f172a', '#475569', '#94a3b8', '#e2e8f0'];
  const doughnutData = {
    labels: osData.map(d => d.name),
    datasets: [{
      data: osData.map(d => d.count),
      backgroundColor: osData.map((_, i) => osColors[i % osColors.length]),
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b',
          usePointStyle: true,
          padding: 20,
          font: { family: 'Inter, sans-serif', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '75%',
  };

  // Compute scan rate
  const scanRate = overview.uniqueVisitors > 0
    ? (overview.totalScans / overview.uniqueVisitors).toFixed(1)
    : '0';

  const formatTrend = (val) => {
    if (val > 0) return `+${val}%`;
    if (val < 0) return `${val}%`;
    return 'Stable';
  };

  // Geo: compute max scans for bar widths
  const maxGeoScans = geo.length > 0 ? Math.max(...geo.map(g => g.scans)) : 1;

  const isInitialLoad = loading && timeseries.length === 0;

  return (
    <AnimatedPage className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header & Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Global Statistics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time insights across all your active campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-medium text-sm appearance-none cursor-pointer"
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards Row */}
        {isInitialLoad ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Scans"
            value={overview.totalScans.toLocaleString()}
            trend={formatTrend(overview.scansTrend)}
            icon={BarChart3}
            index={0}
          />
          <KPICard
            title="Unique Visitors"
            value={overview.uniqueVisitors.toLocaleString()}
            trend={formatTrend(overview.uniqueTrend)}
            icon={Users}
            index={1}
          />
          <KPICard
            title="Scan Rate"
            value={`${scanRate} / user`}
            trend="Stable"
            icon={MousePointerClick}
            neutral
            index={2}
          />
          <KPICard
            title="Active Campaigns"
            value={overview.activeCampaigns.toString()}
            trend=""
            icon={TrendingUp}
            neutral
            index={3}
          />
        </div>
        )}

        {/* Charts Row: Timeline & Device Types */}
        {isInitialLoad ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><SkeletonChart /></div>
            <SkeletonChart />
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Time Series Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Scan Volume</h2>
            </div>
            <div className="h-[300px] w-full">
              {timeseries.length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                  {loading ? 'Loading...' : 'No scan data yet. Share your QR codes to start tracking!'}
                </div>
              )}
            </div>
          </div>

          {/* Device Types Doughnut */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
              <MonitorSmartphone className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Operating Systems</h2>
            </div>
            <div className="flex-1 min-h-[250px] relative flex items-center justify-center">
              {osData.length > 0 ? (
                <>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-6">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{mobilePercent}%</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Mobile</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm">
                  {loading ? 'Loading...' : 'No device data yet'}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Bottom Row: Geographic Data & Top Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Locations */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Geographies</h2>
            </div>
            <div className="space-y-4">
              {geo.length > 0 ? geo.map((loc, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-4">{i + 1}.</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {loc.city !== 'Unknown' ? `${loc.city}, ` : ''}{loc.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{loc.scans.toLocaleString()} scans</span>
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-800 dark:bg-slate-400 rounded-full"
                        style={{ width: `${(loc.scans / maxGeoScans) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
                  {loading ? 'Loading...' : 'No geographic data yet'}
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Campaigns */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top Performing Campaigns</h2>
            <div className="space-y-4">
              {topCampaigns.length > 0 ? topCampaigns.map((campaign, i) => (
                <div key={i} onClick={() => campaign.id && onViewQRAnalytics?.(campaign.id)} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:underline">
                      {campaign.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      /q/{campaign.shortId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {campaign.scans.toLocaleString()}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
                  {loading ? 'Loading...' : 'No campaign data yet'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scan Heatmap */}
        <ScanHeatmap />

      </div>
    </AnimatedPage>
  );
};

// Reusable KPI Card Component with animation
const kpiVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

const KPICard = ({ title, value, trend, icon: Icon, neutral, index = 0 }) => (
  <motion.div
    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    variants={kpiVariants}
    initial="hidden"
    animate="show"
    custom={index}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{value}</span>
      {trend && (
        <span className={`text-xs font-semibold mb-0.5 ${
          neutral
            ? 'text-slate-500 dark:text-slate-400'
            : trend.startsWith('+')
              ? 'text-green-600 dark:text-green-400'
              : trend.startsWith('-')
                ? 'text-red-500 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
        }`}>
          {trend}
        </span>
      )}
    </div>
  </motion.div>
);

export default StatisticsView;
