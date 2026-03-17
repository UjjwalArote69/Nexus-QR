import { create } from 'zustand';
import { generateQRCode } from '../api/qrcode.api';

const useQRStore = create((set) => ({
  // --- Common State ---
  title: '',
  fgColor: '#000000',
  bgColor: '#ffffff',
  isLoading: false,
  error: null,

  // --- Actions to update state ---
  setTitle: (title) => set({ title }),
  setFgColor: (fgColor) => set({ fgColor }),
  setBgColor: (bgColor) => set({ bgColor }),
  setError: (error) => set({ error }),
  
  // Optional: Reset common state when completely leaving the "Create" section
  resetStore: () => set({ 
    title: '', 
    fgColor: '#000000', 
    bgColor: '#ffffff', 
    error: null,
    isLoading: false 
  }),

  // --- Centralized API Call ---
  createQRCode: async (qrData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await generateQRCode(qrData);
      
      if (result.success) {
        set({ isLoading: false });
        return result; // Return to component to trigger onGenerated
      } else {
        set({ 
          error: result.message || 'Failed to generate QR code.', 
          isLoading: false 
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errMsg = error.message || 'Something went wrong! Are you logged in?';
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  }
}));

export default useQRStore;