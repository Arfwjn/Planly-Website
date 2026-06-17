/**
 * =============================================================================
 * Planly — RegisterForm.tsx
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
import { Mail, Lock, User as UserIcon, IdCard } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (data: {
    name: string;
    nim: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  loading: boolean;
}

/**
 * Komponen RegisterForm
 * 
 * Mengelola kolom pendaftaran pengguna baru, meliputi:
 * nama lengkap, NIM, email, kata sandi, dan konfirmasi kata sandi.
 */
export default function RegisterForm({ onSubmit, loading }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, nim, email, password, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="name">
          Nama Lengkap
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#94A3B8]">
            <UserIcon className="w-4 h-4" />
          </span>
          <input
            className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            type="text"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="nim">
          NIM (Nomor Induk Mahasiswa)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#94A3B8]">
            <IdCard className="w-4 h-4" />
          </span>
          <input
            className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            id="nim"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            placeholder="Masukkan NIM"
            type="text"
          />
        </div>
      </div>

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
        <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="password">
          Kata Sandi
        </label>
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

      <div>
        <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="confirm-password">
          Konfirmasi Kata Sandi
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#94A3B8]">
            <Lock className="w-4 h-4" />
          </span>
          <input
            className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </div>
    </form>
  );
}
