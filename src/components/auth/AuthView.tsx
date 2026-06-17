/**
 * =============================================================================
 * Planly — AuthView.tsx
 * 
 * Kegunaan:
 * Komponen antarmuka (UI) khusus modul Autentikasi (seperti form masuk, pendaftaran akun, & header auth).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan AuthView.tsx (orkestrator) dan menggunakan layanan authService di frontend.
 * 
 * Aliran Data / State:
 * - Klien mengirimkan kredensial masuk/daftar, kemudian menerima token JWT (Sanctum) untuk disimpan di localStorage.
 * =============================================================================
 */

import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { LoginResponse } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';

// Impor sub-komponen modular
import AuthHeader from './AuthHeader';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthViewProps {
  onLoginSuccess: (loginResponse: LoginResponse) => void;
  onBackToLanding: () => void;
  initialRegister?: boolean;
}

/**
 * Komponen AuthView (Orchestrator)
 * 
 * Mengatur jalannya proses masuk (login) dan pendaftaran (register) akun pengguna.
 * Menghubungkan visualisasi error, status memuat data, serta integrasi pemanggilan API backend/services.
 */
export default function AuthView({ onLoginSuccess, onBackToLanding, initialRegister = false }: AuthViewProps) {
  const toast = useToast();

  // State pengalih form pendaftaran (true) atau login (false)
  const [isRegister, setIsRegister] = useState(initialRegister);
  
  // State manajemen error dan pemrosesan loading
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Aksi penanganan pengiriman data Login
  const handleLoginSubmit = (emailVal: string, passwordVal: string) => {
    setError(null);
    setLoading(true);

    if (!emailVal || !passwordVal) {
      setError('Harap isi semua kolom wajib.');
      setLoading(false);
      return;
    }

    api.auth.login(emailVal, passwordVal)
      .then((loginResponse) => {
        onLoginSuccess(loginResponse);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Gagal masuk.');
        setLoading(false);
      });
  };

  // Aksi penanganan pengiriman data Register
  const handleRegisterSubmit = (data: {
    name: string;
    nim: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError(null);
    setLoading(true);

    if (!data.name || !data.email || !data.password) {
      setError('Harap lengkapi semua data pendaftaran.');
      setLoading(false);
      return;
    }

    if (data.password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      setLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      setLoading(false);
      return;
    }

    api.auth.register({
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.confirmPassword,
      nim: data.nim || undefined,
    })
      .then(() => {
        toast.success('Pendaftaran berhasil! Silakan masuk.');
        setIsRegister(false);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Pendaftaran gagal.');
        setLoading(false);
      });
  };

  // Aksi penanganan Lupa Kata Sandi
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success('Tautan pemulihan kata sandi telah dikirim.');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-8">
        
        {/* Kepala Logo & Judul Halaman */}
        <AuthHeader isRegister={isRegister} />

        {/* Tampilan Pesan Galat jika Terjadi Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Aktif (Login vs Register) */}
        {isRegister ? (
          <RegisterForm onSubmit={handleRegisterSubmit} loading={loading} />
        ) : (
          <LoginForm 
            onSubmit={handleLoginSubmit} 
            loading={loading} 
            onForgotPasswordClick={handleForgotPassword} 
          />
        )}

        {/* Pengalih Tipe Form */}
        <div className="mt-6 text-center select-none">
          <p className="text-sm text-on-surface-variant">
            {isRegister ? (
              <>
                Sudah punya akun?{' '}
                <button
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className="text-primary hover:text-on-primary-fixed-variant font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Masuk
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{' '}
                <button
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-primary hover:text-on-primary-fixed-variant font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Daftar
                </button>
              </>
            )}
          </p>
        </div>

        {/* Tombol kembali ke landing page */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center select-none">
          <button
            onClick={onBackToLanding}
            className="text-xs text-[#64748B] hover:text-[#334155] font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            ← Kembali ke Halaman Utama
          </button>
        </div>

      </div>
    </div>
  );
}
