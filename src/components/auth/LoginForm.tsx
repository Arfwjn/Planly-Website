/**
 * =============================================================================
 * Planly — LoginForm.tsx
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
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  onForgotPasswordClick: (e: React.MouseEvent) => void;
}

/**
 * Komponen LoginForm
 * 
 * Mengelola input email, kata sandi, dan tombol masuk (login).
 * Menyediakan tautan lupa kata sandi dengan pemicu toast notifikasi.
 */
export default function LoginForm({ onSubmit, loading, onForgotPasswordClick }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#94A3B8]">
            <Mail className="w-4 h-4" />
          </span>
          <input
            className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.com"
            type="email"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-on-surface" htmlFor="password">
            Kata Sandi
          </label>
          <a
            href="#"
            onClick={onForgotPasswordClick}
            className="text-xs text-primary hover:text-primary-container-high transition-colors font-medium"
          >
            Lupa kata sandi?
          </a>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#94A3B8]">
            <Lock className="w-4 h-4" />
          </span>
          <input
            className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            required
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          className="w-full h-10 bg-[#4F46E5] hover:bg-primary text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:opacity-50 border-none"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </div>
    </form>
  );
}
