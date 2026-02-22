import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    console.error("API Error:", message);
    // Redirect to login on 401 (but not while already on an auth page)
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/signup")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
