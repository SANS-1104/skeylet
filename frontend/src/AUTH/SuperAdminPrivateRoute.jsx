import { Navigate } from "react-router-dom";

export default function SuperAdminPrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/studioSuperAdmin" replace />;
  }

  return children;
}
