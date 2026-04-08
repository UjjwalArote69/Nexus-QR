import API from './axios';

const buildParams = (period, from, to) => {
  const params = { period };
  if (period === 'custom' && from && to) {
    params.from = from;
    params.to = to;
  }
  return params;
};

export const fetchOverview = async (period = '7d', from, to) => {
  const response = await API.get('/analytics/overview', { params: buildParams(period, from, to) });
  return response.data;
};

export const fetchTimeseries = async (period = '7d', from, to) => {
  const response = await API.get('/analytics/timeseries', { params: buildParams(period, from, to) });
  return response.data;
};

export const fetchDevices = async (period = '7d', from, to) => {
  const response = await API.get('/analytics/devices', { params: buildParams(period, from, to) });
  return response.data;
};

export const fetchGeo = async (period = '7d', from, to) => {
  const response = await API.get('/analytics/geo', { params: buildParams(period, from, to) });
  return response.data;
};

export const fetchTopCampaigns = async (period = '7d', from, to) => {
  const response = await API.get('/analytics/top-campaigns', { params: buildParams(period, from, to) });
  return response.data;
};

export const fetchQRAnalytics = async (id, period = '7d', from, to) => {
  const response = await API.get(`/analytics/qr/${id}`, { params: buildParams(period, from, to) });
  return response.data;
};

export const fetchHeatmapData = async (period = '30d', qrId = null, from, to) => {
  const params = buildParams(period, from, to);
  if (qrId) params.qrId = qrId;
  const response = await API.get('/analytics/heatmap', { params });
  return response.data;
};
