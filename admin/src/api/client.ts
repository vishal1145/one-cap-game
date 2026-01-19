import axios from "axios";
import { getToken } from "../utils/storage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  get: (url: string, config = {}) => apiClient.get(url, config),
  post: (url: string, data?: any, config = {}) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config = {}) => apiClient.put(url, data, config),
  delete: (url: string, config = {}) => apiClient.delete(url, config),
};

export default api;
