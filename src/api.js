import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
  timeout: 500000, 
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const STORAGE_URL = "http://127.0.0.1:8000/storage";
export const PUSHER_APP_KEY = "5fa2841f32689bcde49e";
export const PUSHER_CLUSTER = "eu";

export default api;
