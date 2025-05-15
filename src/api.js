import axios from "axios";

export const BASE_URL = process.env.REACT_APP_BASE_URL;
// export const BASE_URL = 'https://870e-46-19-227-186.ngrok-free.app/api'
// export const BASE_URL = 'http://192.168.1.3:8000/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL, 
  // baseURL: "https://870e-46-19-227-186.ngrok-free.app/api",
  // baseURL: "http://192.168.1.3:8000/api",

  // baseURL: "https://dark-1.infinityfreeapp.com/api", 
  // baseURL: "https://cors-anywhere.herokuapp.com/http://dark-1.infinityfreeapp.com/api",
  timeout: 500000, 
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // 👈 THIS LINE fixes the warning

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

export const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
export const PAYPAL_SECRET_KEY = process.env.REACT_APP_PAYPAL_SECRET;

export const STORAGE_URL = process.env.REACT_APP_STORAGE_URL;
// export const STORAGE_URL = "https://870e-46-19-227-186.ngrok-free.app/storage";
// export const STORAGE_URL = "http://192.168.1.3:8000/storage";

// export const STORAGE_URL = "https://dark-1.infinityfreeapp.com/storage";
// export const STORAGE_URL = 'https://cors-anywhere.herokuapp.com/http://dark-1.infinityfreeapp.com/storage'
// export const PUSHER_APP_KEY = "5fa2841f32689bcde49e";
// export const PUSHER_CLUSTER = "eu";
export const PUSHER_APP_KEY = process.env.REACT_APP_PUSHER_APP_KEY;
export const PUSHER_CLUSTER = process.env.REACT_APP_PUSHER_CLUSTER_KEY;
export default api;
