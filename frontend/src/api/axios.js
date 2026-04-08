// src/api/axios.js
// Axios instance with interceptors for auth and auto-refresh.
// Priority: JWT token (logged-in user) > session token (anonymous user).

import axios from 'axios';
import toast from 'react-hot-toast';
import { getSessionToken } from '../utils/sessionToken.js';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor — attach auth on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers['x-session-token'] = getSessionToken();
  }

  return config;
});

// Track whether a refresh is already in progress to avoid duplicate calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor — auto-refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Anonymous users (no JWT) should never refresh or redirect — just reject
      const token = localStorage.getItem('token');
      if (!token) {
        return Promise.reject(error);
      }

      // Don't try to refresh the refresh-token endpoint itself
      if (originalRequest.url?.includes('/users/refresh-token')) {
        localStorage.removeItem('token');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await API.post('/users/refresh-token');
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        // Redirect to login so user isn't stuck on a broken dashboard
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Network error (no response from server)
    if (!error.response) {
      toast.error('Network error — please check your connection.', { id: 'network-error' });
    }

    return Promise.reject(error);
  }
);

export default API;
