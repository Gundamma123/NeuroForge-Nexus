import axios from "axios";

// Base URL for the Spring Boot backend gateway.
// Update this to match your backend's actual host/port.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (issued by Keycloak / User Service) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling -> send the user back to login
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem("nf_token");
//       localStorage.removeItem("nf_user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Log exactly which call expired/failed auth, so this is debuggable
      // from the console instead of only from screenshots.
      // eslint-disable-next-line no-console
      console.warn(
        "[auth] 401 received, logging out. URL:",
        error.config?.url,
        "Method:",
        error.config?.method
      );
      localStorage.removeItem("nf_token");
      localStorage.removeItem("nf_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);



export default api;