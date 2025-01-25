
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",  // Replace this with your actual backend API URL
  timeout: 10000,  // Optional: Set timeout duration
});

export default api;
