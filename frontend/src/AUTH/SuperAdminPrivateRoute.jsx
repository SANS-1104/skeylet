import { Navigate } from "react-router-dom";

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export default function SuperAdminPrivateRoute({ children }) {
  const token = localStorage.getItem("superadmin_token");
  if (!token) {
    return <Navigate to="/studioSuperAdmin" replace />;
  }

  const payload = decodeJwtPayload(token);
  const isExpired = payload?.exp && payload.exp * 1000 < Date.now();
  if (!payload || payload.role !== "superadmin" || isExpired) {
    localStorage.removeItem("superadmin_token");
    return <Navigate to="/studioSuperAdmin" replace />;
  }

  return children;
}
