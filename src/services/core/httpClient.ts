// =============================================================================
// Planly — Axios HTTP Client (Buat Penghubung ke Server Backend)
//
// File ini tuh fungsinya sebagai HTTP client terpusat pake Axios. Tugas utamanya
// adalah buat ngobrol/komunikasi sama REST API Laravel Sanctum milik temen kita.
// Di sini kita setting base URL, interceptor request (buat nempelin token Bearer),
// dan interceptor response (buat auto-logout kalau token-nya udah expired / error 401).
// =============================================================================

import axios from 'axios';

// Ambil Base URL API dari file .env. Kalau gak ada, kita fallback ke localhost port 8000.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-plany-production.up.railway.app/api';

// Kita bikin instance Axios baru dengan konfigurasi default.
// Accept & Content-Type diset ke JSON biar server tahu kita kirim dan minta data JSON.
// ngrok-skip-browser-warning ditaruh buat jaga-jaga kalau temen kita pake ngrok buat hosting backend-nya.
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Biar gak keblokir screen warning dari ngrok pas di-fetch
  },
  timeout: 30000, // Maksimal nunggu respon server 30 detik. Lewat dari itu, request-nya auto-cancel (timeout).
});

// --- Request Interceptor: Nempelin Token Bearer Otomatis ---
// Sebelum request-nya beneran dikirim ke server, interceptor ini bakal nge-cek
// apakah ada token auth (planly_token) di localStorage. Kalau ada, token tersebut
// bakal langsung ditempel di header 'Authorization' sebagai Bearer token. Jadi kita
// gak perlu nulis header token manual tiap kali manggil API. Praktis banget!
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

// --- Response Interceptor: Jaga-Jaga kalau Token Expired (Error 401) ---
// Pas respon dari server balik, interceptor ini bakal ngintip status-nya dulu.
// Kalau responnya sukses, ya aman, langsung diterusin aja. Tapi kalau dapet error 401 (Unauthorized),
// itu artinya token kita udah gak valid atau udah expired di server. Biar aman dan gak error terus,
// kita hapus token dan status login dari localStorage, terus auto-reload halaman biar user
// langsung balik ke halaman login secara otomatis.
httpClient.interceptors.response.use(
  (response) => {
    // Jika body response memiliki format wrapper laravel API { success: true, data: ... }
    // kita secara otomatis men-unwrap property 'data' tersebut agar modul service
    // langsung menerima raw data model/array sesuai tipe kembaliannya.
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Hapus sisa-sisa data autentikasi yang udah gak valid dari browser
      localStorage.removeItem('planly_token');
      localStorage.removeItem('planly_auth');
      // Muat ulang aplikasi biar user auto-redirect ke halaman login/register
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default httpClient;
