// src/api/axiosClient.js
import axios from "axios";
import { toast } from 'react-toastify';

const axiosClient = axios.create({
  baseURL: "https://api.skeylet.com/api",
  // baseURL: "https://api.skeylet.com/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor: attach access token conditionally
axiosClient.interceptors.request.use(
  (config) => {
    const publicRoutes = ["/login", "/signup", "/auth/refresh-token", "/auth"];

    if (publicRoutes.some(route => config.url.includes(route))) {
      return config; // Skip token for public routes
    }

    // SuperAdmin routes use a separate token to keep regular-user and
    // superadmin sessions isolated.
    const isSuperAdminRoute =
      config.url.includes("/studioAdmin") || config.url.includes("/admin/superadmin");
    const token = isSuperAdminRoute
      ? localStorage.getItem("superadmin_token")
      : localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: refresh token logic
axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      err.response.data?.msg === "Token expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post("https://api.skeylet.com/api/auth/refresh-token", {
            token: refreshToken,
          });

          const newAccessToken = res.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken); // ✅ fixed key

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("name");
          window.location.href = "/auth";
        }
      } else {
        localStorage.clear();
        window.location.href = "/auth";
      }
    }
    // 🚨 Check for quota or limit exceeded
    const quotaMsg = err.response?.data?.error || err.response?.data?.msg;
    if (quotaMsg?.toLowerCase().includes("limit") || quotaMsg?.toLowerCase().includes("quota")) {
      import("react-toastify").then(({ toast }) => {
        toast.error(quotaMsg, { autoClose: 2000 });
      });
    }


    return Promise.reject(err);
  }
);

export default axiosClient;
