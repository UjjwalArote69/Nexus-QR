/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { loginUser, registerUser, fetchProfile } from '../api/auth.api';

const useAuthStore = create((set) => ({
  user: null,
  // Synchronously check local storage so the UI knows immediately
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Start loading as true if we have a token, so ProtectedRoute waits for checkAuth
  isLoading: !!localStorage.getItem('token'), 
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginUser(credentials);
      
      // Save to localStorage
      localStorage.setItem('token', data.token);
      
      set({ 
        user: data.user, 
        token: data.token,
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed. Please try again.', 
        isLoading: false 
      });
      return { success: false };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await registerUser(userData);
      
      // Save to localStorage
      localStorage.setItem('token', data.token);

      set({ 
        user: data.user, 
        token: data.token,
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed. Please try again.', 
        isLoading: false 
      });
      return { success: false };
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
    }

    try {
      const data = await fetchProfile();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // ADD THIS CONSOLE LOG TO CATCH THE CULPRIT:
      console.error("Auth Check Failed:", error.response?.data || error.message);
      
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;