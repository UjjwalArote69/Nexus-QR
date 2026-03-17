import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Loader2, MapPin } from 'lucide-react';
import { fetchHeatmapData } from '../api/analytics.api';
import 'leaflet/dist/leaflet.css';

const PERIODS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

const ScanHeatmap = ({ qrId = null }) => {
  const [period, setPeriod] = useState('30d');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchHeatmapData(period, qrId);
      if (result.success) {
        setPoints(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
    } finally {
      setLoading(false);
    }
  }, [period, qrId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Group points by location to get counts
  const grouped = points.reduce((acc, pt) => {
    const key = `${pt.latitude},${pt.longitude}`;
    if (!acc[key]) {
      acc[key] = { ...pt, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {});

  const markers = Object.values(grouped);
  const maxCount = markers.length > 0 ? Math.max(...markers.map(m => m.count)) : 1;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Scan Heatmap</h2>
          {points.length > 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
              {points.length} scan{points.length !== 1 ? 's' : ''} from {markers.length} location{markers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && points.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <MapPin className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No geographic data available yet</p>
            <p className="text-xs mt-1">Scan locations will appear here when users scan your QR codes</p>
          </div>
        ) : (
          <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
            style={{ background: '#f8fafc' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {markers.map((marker, i) => {
              const intensity = marker.count / maxCount;
              const radius = Math.max(6, Math.min(20, 6 + intensity * 14));
              return (
                <CircleMarker
                  key={i}
                  center={[marker.latitude, marker.longitude]}
                  radius={radius}
                  pathOptions={{
                    color: 'rgba(59, 130, 246, 0.8)',
                    fillColor: `rgba(59, 130, 246, ${0.3 + intensity * 0.5})`,
                    fillOpacity: 0.3 + intensity * 0.5,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">
                        {marker.city && marker.city !== 'Unknown' ? `${marker.city}, ` : ''}{marker.country || 'Unknown'}
                      </p>
                      <p className="text-slate-500">{marker.count} scan{marker.count !== 1 ? 's' : ''}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default ScanHeatmap;
