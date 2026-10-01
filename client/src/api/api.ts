import axios from "axios";
import store from "@/Redux/store";
import { resetUser } from "@/Redux/userSlice";
import { getApiUrl } from "@/utils/publicApiConfig";

// List of endpoints that should not trigger auth redirect
const EXCLUDED_ENDPOINTS = [
  "/login",
  "/",
  "/signup",
  // "/users/me",
];
export const baseURL = getApiUrl();

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to update token before each request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the request URL is in the excluded list
    const requestUrl = error.config?.url;
    const isExcluded = EXCLUDED_ENDPOINTS.some((endpoint) =>
      requestUrl?.includes(endpoint),
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
  },
);
