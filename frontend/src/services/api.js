// src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 detik
});

// Request interceptor — tambahkan token JWT ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle error 401 (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid — hapus token dan redirect ke login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper untuk format pesan error dari API
export const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (Array.isArray(detail)) {
      // Pydantic validation errors
      return detail.map((d) => d.msg || d.message).join(", ");
    }
    return detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message === "Network Error") {
    return "Tidak dapat terhubung ke server. Pastikan backend berjalan.";
  }
  return "Terjadi kesalahan. Coba lagi.";
};

export default api;
