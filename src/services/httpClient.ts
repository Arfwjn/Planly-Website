// =============================================================================
// Planly — Axios HTTP Client
// File ini berfungsi sebagai HTTP client terpusat menggunakan Axios untuk 
// berkomunikasi dengan REST API Laravel Sanctum. Di sini kita mengonfigurasi 
// base URL, interceptor request untuk menyisipkan token Bearer, dan interceptor 
// response untuk menangani auto-logout jika terjadi error 401 (Unauthorized).
// =============================================================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Di sini kita membuat instance Axios baru dengan konfigurasi dasar,
// seperti base URL yang diambil dari environment variable, tipe konten
// default berupa JSON, serta batas waktu (timeout) request.
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// --- Request Interceptor: Menyisipkan token Bearer ---
// Interceptor ini berguna untuk secara otomatis mengambil token dari localStorage
// dan menyisipkannya ke dalam header Authorization pada setiap request yang dikirimkan.
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

// --- Response Interceptor: Menangani auto-logout ketika error 401 ---
// Interceptor ini berguna untuk memantau respon dari server. Jika server
// mengembalikan status 401 (Unauthorized) yang menandakan token kedaluwarsa atau tidak valid,
// kita akan menghapus data autentikasi dari localStorage dan memuat ulang (reload) halaman
// agar pengguna diarahkan kembali ke alur login.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token kedaluwarsa atau tidak valid — bersihkan status autentikasi
      localStorage.removeItem('planly_token');
      localStorage.removeItem('planly_auth');
      // Muat ulang halaman untuk memicu tampilan autentikasi
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default httpClient;
