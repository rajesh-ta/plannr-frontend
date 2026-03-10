import axios from "axios";
import Cookies from "js-cookie";
import { store } from "@/store/store";
import { showNotification } from "@/store/notificationSlice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor — attach JWT token from cookie on every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("plannr_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — centralised error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error.response?.status;
    const message: string =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    // Redirect to login on 401 (but not while already on an auth page)
    if (status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/signup")) {
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // 403 — permission denied
    if (status === 403) {
      store.dispatch(
        showNotification({
          message: "You don't have permission to do that.",
          severity: "warning",
        }),
      );
      return Promise.reject(error);
    }

    // 422 — validation error from FastAPI
    if (status === 422) {
      const detail = error.response?.data?.detail;
      const validationMsg = Array.isArray(detail)
        ? detail.map((e: { msg: string }) => e.msg).join(", ")
        : message;
      store.dispatch(
        showNotification({ message: validationMsg, severity: "warning" }),
      );
      return Promise.reject(error);
    }

    // 5xx — server errors
    if (status !== undefined && status >= 500) {
      store.dispatch(
        showNotification({
          message: "A server error occurred. Please try again later.",
          severity: "error",
        }),
      );
      return Promise.reject(error);
    }

    // Network / timeout errors
    if (!error.response) {
      store.dispatch(
        showNotification({
          message: "Network error — please check your connection.",
          severity: "error",
        }),
      );
      return Promise.reject(error);
    }

    // All other errors — show the message from the server
    store.dispatch(showNotification({ message, severity: "error" }));
    return Promise.reject(error);
  },
);
