import React, {
  useEffect,
  Suspense,
  lazy,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Store & Wrapper
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { FullPageLoader } from "./components/layout/Loader";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import VCardProfile from './pages/Public/VCardProfile';
import LinksProfile from "./pages/Public/LinksProfile";
import SocialProfile from "./pages/Public/SocialProfile";
import BusinessProfile from "./pages/Public/BusinessProfile";
import CouponProfile from "./pages/Public/CouponProfile";
import AppStoreProfile from "./pages/Public/AppStoreProfile";
import LandingProfile from "./pages/Public/LandingProfile";

// Lazy Load Pages
const HomePage = lazy(
  () => import("./pages/HomePage"),
);
const LandingPage = lazy(
  () => import("./pages/LandingPage"),
);
const Login = lazy(
  () => import("./pages/Login"),
);
const Register = lazy(
  () => import("./pages/Register"),
);
const Dashboard = lazy(
  () => import("./pages/Dashboard/Dashboard"),
);
const ForgotPassword = lazy(
  () => import("./pages/ForgotPassword"),
);
const ResetPassword = lazy(
  () => import("./pages/ResetPassword"),
);
const VerifyEmail = lazy(
  () => import("./pages/VerifyEmail"),
);
const NotFound = lazy(
  () => import("./pages/NotFound"),
);

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId || ""}>
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
        }}
      />

      <ErrorBoundary>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          {/* Homepage IS the QR builder */}
          <Route path="/" element={<HomePage />} />

          {/* Marketing / About page (old landing page) */}
          <Route path="/about" element={<LandingPage />} />

          {/* Redirect old /create to homepage since builder is now at / */}
          <Route path="/create" element={<Navigate to="/" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Public QR profile pages */}
          <Route path="/vcard/:shortId" element={<VCardProfile />} />
          <Route path="/links/:shortId" element={<LinksProfile />} />
          <Route path="/social/:shortId" element={<SocialProfile />} />
          <Route path="/business/:shortId" element={<BusinessProfile />} />
          <Route path="/coupon/:shortId" element={<CouponProfile />} />
          <Route path="/app/:shortId" element={<AppStoreProfile />} />
          <Route path="/landing/:shortId" element={<LandingProfile />} />

          {/* Protected Dashboard routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </Router>
    </GoogleOAuthProvider>
  );
};

export default App;