import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

import { FullPageLoader } from "../layout/Loader";

const ProtectedRoute = ({
  children,
}) => {
  const { isAuthenticated, isLoading } =
    useAuthStore();

  if (isLoading)
    return (
      <FullPageLoader text="Authenticating..." />
    );

  // If not authenticated, boot them back to the login page
  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace />
    );
  }

  // If they are allowed, render the requested page (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;
