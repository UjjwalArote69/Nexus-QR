import axios from 'axios';

// Export it as apiClient so auth.api.js can use it
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    withCredentials: true, // Keep this if you ever fall back to cookies
    headers: {
        'Content-Type': 'application/json',
    }
});

// Attach the Bearer token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);