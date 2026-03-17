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
import { Loader2 } from "lucide-react";

// Store & Wrapper (Keep these synchronous as they are needed immediately)
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { FullPageLoader } from "./components/layout/Loader";
import CreateQRView from "./pages/Dashboard/views/CreateQRView";
import MyQRCodesView from "./pages/Dashboard/views/MyQRCodesView";
import StatisticsView from "./pages/Dashboard/views/StatisticsView";
import TemplatesView from "./pages/Dashboard/views/TemplatesView";
import SettingsView from "./pages/Dashboard/views/SettingsView";
import VCardProfile from './pages/Public/VCardProfile';
import LinksProfile from "./pages/Public/LinksProfile";
import SocialProfile from "./pages/Public/SocialProfile";
import BusinessProfile from "./pages/Public/BusinessProfile";
import CouponProfile from "./pages/Public/CouponProfile";
import AppStoreProfile from "./pages/Public/AppStoreProfile";
import LandingProfile from "./pages/Public/LandingProfile";

// Lazy Load Pages (Code Splitting)
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
  () =>
    import("./pages/Dashboard/Dashboard"),
);

const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
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

      {/* Suspense wrapper catches the lazy-loaded components */}
      <Suspense
        fallback={<FullPageLoader />}
      >
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/vcard/:shortId" element={<VCardProfile />} />
          <Route path="/links/:shortId" element={<LinksProfile />} />
          <Route path="/social/:shortId" element={<SocialProfile />} />
          <Route path="/business/:shortId" element={<BusinessProfile />} />
          <Route path="/coupon/:shortId" element={<CouponProfile />} />
          <Route path="/app/:shortId" element={<AppStoreProfile />} />
          <Route path="/landing/:shortId" element={<LandingProfile />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* Default route redirects to create */}
            <Route
              index
              element={
                <Navigate
                  to="create"
                  replace
                />
              }
            />

            {/* Nested Routes */}
            <Route
              path="create"
              element={<CreateQRView />}
            />
            <Route
              path="library"
              element={
                <MyQRCodesView />
              }
            />
            <Route
              path="statistics"
              element={
                <StatisticsView />
              }
            />
            <Route
              path="templates"
              element={
                <TemplatesView />
              }
            />
            <Route
              path="settings"
              element={<SettingsView />}
            />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
