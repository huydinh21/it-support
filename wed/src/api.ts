import axios from 'axios';

// Kết nối đến Backend API thực tế
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm JWT Token vào Header của mọi request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('app-jwt-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
