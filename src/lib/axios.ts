import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("privy:token");
      if (token) {
        config.headers.Authorization = `Bearer ${token.slice(1, -1)}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
