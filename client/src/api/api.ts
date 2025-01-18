import axios from "axios";
import store from "@/Redux/store";
import { resetUser } from "@/Redux/userSlice";

const token = sessionStorage.getItem("token");

// List of endpoints that should not trigger auth redirect
const EXCLUDED_ENDPOINTS = [
  "/users/login",
  "/users",
  "/signup-requests",
  // "/users/me",
];

export const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:5000/api",
  headers: {
    Authorization: `Bearer ${token}`,
    "Access-Control-Allow-Methods": "true",
    "Content-Type": "application/json",
  },
});

// Add request interceptor to update token before each request
api.interceptors.request.use((config) => {
  const currentToken = sessionStorage.getItem("token");
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the request URL is in the excluded list
    const requestUrl = error.config?.url;
    const isExcluded = EXCLUDED_ENDPOINTS.some((endpoint) =>
      requestUrl?.includes(endpoint)
    );

    if (
      !isExcluded &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      console.log(error.response?.status);
      // Clear session storage
      sessionStorage.clear();
      // Reset Redux state
      store.dispatch(resetUser());
      // Redirect to login using window.location
      console.log("Unauthorized");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
