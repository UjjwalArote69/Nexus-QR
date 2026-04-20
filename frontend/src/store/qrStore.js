import { create } from "zustand";
import {
  generateQRCode,
  createQRWithFile,
  uploadImage as uploadImageAPI,
} from "../api/qrcode.api";

const useQRStore = create(
  (set, get) => ({
    // --- Common State ---
    title: "",
    fgColor: "#000000",
    bgColor: "#ffffff",
    dotStyle: "square", // square | dots | rounded | extra-rounded | classy | classy-rounded
    cornerSquareStyle: "square", // square | dot | extra-rounded
    cornerDotStyle: "square", // square | dot
    logoFile: null, // File object for logo overlay
    logoDataUrl: null, // data URL preview of logo
    isLoading: false,
    error: null,

    // --- Auth Prompt State (for unauthenticated users) ---
    showAuthPrompt: false,
    pendingQRData: null, // Stores the QR data to retry after auth
    pendingFileData: null, // Stores { file, title, qrType } for file uploads to retry after auth

    // --- Actions to update state ---
    setTitle: (title) => set({ title }),
    setFgColor: (fgColor) => {
      if (
        /^#[0-9a-fA-F]{0,6}$/.test(
          fgColor,
        )
      )
        set({ fgColor });
    },
    setBgColor: (bgColor) => {
      if (
        /^#[0-9a-fA-F]{0,6}$/.test(
          bgColor,
        )
      )
        set({ bgColor });
    },
    setDotStyle: (dotStyle) =>
      set({ dotStyle }),
    setCornerSquareStyle: (
      cornerSquareStyle,
    ) => set({ cornerSquareStyle }),
    setCornerDotStyle: (
      cornerDotStyle,
    ) => set({ cornerDotStyle }),
    setLogo: (file) => {
      if (!file) {
        set({
          logoFile: null,
          logoDataUrl: null,
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) =>
        set({
          logoFile: file,
          logoDataUrl: e.target.result,
        });
      reader.readAsDataURL(file);
    },
    setIsLoading: (isLoading) =>
      set({ isLoading }),
    setError: (error) => set({ error }),
    setShowAuthPrompt: (show) =>
      set({ showAuthPrompt: show }),

    // Optional: Reset common state when completely leaving the "Create" section
    resetStore: () =>
      set({
        title: "",
        fgColor: "#000000",
        bgColor: "#ffffff",
        dotStyle: "square",
        cornerSquareStyle: "square",
        cornerDotStyle: "square",
        logoFile: null,
        logoDataUrl: null,
        error: null,
        isLoading: false,
        showAuthPrompt: false,
        pendingQRData: null,
        pendingFileData: null,
      }),

    // --- Centralized API Call ---
    // Returns { success, needsAuth?, qrLink?, message? }
    createQRCode: async (qrData) => {
      // User IS logged in — proceed with API call
      set({
        isLoading: true,
        error: null,
      });
      try {
        const result =
          await generateQRCode(qrData);

        if (result.success) {
          set({
            isLoading: false,
            pendingQRData: null,
          });
          const token =
            localStorage.getItem(
              "token",
            );
          if (!token) {
            // Small delay so the user sees the success state first
            setTimeout(
              () =>
                set({
                  showAuthPrompt: true,
                }),
              1500,
            );
          }
          return result; // Return to component to trigger onGenerated
        } else {
          set({
            error:
              result.message ||
              "Failed to generate QR code.",
            isLoading: false,
          });
          return {
            success: false,
            message: result.message,
          };
        }
      } catch (error) {
        const errMsg =
          error.message ||
          "Something went wrong! Are you logged in?";
        set({
          error: errMsg,
          isLoading: false,
        });
        return {
          success: false,
          message: errMsg,
        };
      }
    },

    // --- Centralized File Upload Action (with auth check) ---
    createQRWithFileAction: async (
      file,
      title,
      qrType,
    ) => {
      set({
        isLoading: true,
        error: null,
      });
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append(
          "qrType",
          qrType,
        );

        const result =
          await createQRWithFile(
            formData,
          );

        if (result.success) {
          set({
            isLoading: false,
            pendingFileData: null,
          });
          const token =
            localStorage.getItem(
              "token",
            );
          if (!token) {
            // Small delay so the user sees the success state first
            setTimeout(
              () =>
                set({
                  showAuthPrompt: true,
                }),
              1500,
            );
          }
          return result;
        } else {
          set({
            error:
              result.message ||
              "Failed to generate QR code.",
            isLoading: false,
          });
          return {
            success: false,
            message: result.message,
          };
        }
      } catch (error) {
        const errMsg =
          error.message ||
          "Something went wrong! Are you logged in?";
        set({
          error: errMsg,
          isLoading: false,
        });
        return {
          success: false,
          message: errMsg,
        };
      }
    },
    // ... existing store code ...

    // --- Image Upload Action ---
    uploadImage: async (file) => {
      // We don't set global isLoading here because we handle a local isUploading state in the form,
      // but we can clear previous errors.
      set({ error: null });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const data =
          await uploadImageAPI(formData);

        if (data.success) {
          return {
            success: true,
            imageUrl: data.imageUrl,
          };
        } else {
          set({
            error:
              data.message ||
              "Image upload failed",
          });
          return {
            success: false,
            message: data.message,
          };
        }
      } catch (error) {
        set({
          error:
            "Image upload failed. Please try again.",
        });
        return {
          success: false,
          message:
            error.response?.data?.message ||
            error.message,
        };
      }
    },

    // ... rest of the store code ...
    // Called after successful authentication to retry the pending QR creation
    retryPendingCreation: async () => {
      const {
        pendingQRData,
        pendingFileData,
      } = get();

      if (
        !pendingQRData &&
        !pendingFileData
      ) {
        return {
          success: false,
          message:
            "No pending QR data.",
        };
      }

      set({
        showAuthPrompt: false,
        isLoading: true,
        error: null,
      });

      try {
        let result;

        if (pendingFileData) {
          // Retry file upload
          const formData =
            new FormData();
          formData.append(
            "file",
            pendingFileData.file,
          );
          formData.append(
            "title",
            pendingFileData.title,
          );
          formData.append(
            "qrType",
            pendingFileData.qrType,
          );
          result =
            await createQRWithFile(
              formData,
            );
        } else {
          // Retry regular QR creation
          result = await generateQRCode(
            pendingQRData,
          );
        }

        if (result.success) {
          set({
            isLoading: false,
            pendingQRData: null,
            pendingFileData: null,
          });
          return result;
        } else {
          set({
            error:
              result.message ||
              "Failed to generate QR code.",
            isLoading: false,
          });
          return {
            success: false,
            message: result.message,
          };
        }
      } catch (error) {
        const errMsg =
          error.message ||
          "Failed to save QR code after login.";
        set({
          error: errMsg,
          isLoading: false,
        });
        return {
          success: false,
          message: errMsg,
        };
      }
    },

    dismissAuthPrompt: () =>
      set({
        showAuthPrompt: false,
        pendingQRData: null,
        pendingFileData: null,
      }),
  }),
);

export default useQRStore;
