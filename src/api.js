import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
  // baseURL: "http://dark-1.infinityfreeapp.com/api", 
  // baseURL: "https://cors-anywhere.herokuapp.com/http://dark-1.infinityfreeapp.com/api",
  timeout: 500000, 
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    // "Origin": "https://dark-vault-frontend.vercel.app", 
    // "X-Requested-With": "XMLHttpRequest", 
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
// export const STORAGE_URL = "http://dark-1.infinityfreeapp.com/storage";
// export const STORAGE_URL = 'https://cors-anywhere.herokuapp.com/http://dark-1.infinityfreeapp.com/storage'
// export const PUSHER_APP_KEY = "5fa2841f32689bcde49e";
// export const PUSHER_CLUSTER = "eu";
export const PUSHER_APP_KEY = "c4cccdd2ca56f815ed9e";
export const PUSHER_CLUSTER = "eu";
export default api;
