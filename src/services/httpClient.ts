// =============================================================================
// Planly — Axios HTTP Client
// Centralized Axios instance configured for the Laravel Sanctum REST API.
// Auto-attaches Bearer token and handles 401 auto-logout.
// =============================================================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// --- Request Interceptor: attach Bearer token ---
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('planly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: handle 401 auto-logout ---
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('planly_token');
      localStorage.removeItem('planly_auth');
      // Reload to trigger the auth view
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default httpClient;
