import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
});

// Removed token interceptor as we use session-based auth with withCredentials: true

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const path = window.location?.pathname || "";

    const skipRedirect =
      path.startsWith("/login") ||
      path.startsWith("/signup") ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/reset-password") ||
      path.startsWith("/auth/callback");

    if (status === 401 && !skipRedirect) {
      // Clear token on 401
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;