import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { LoginResponse } from '../types';
import { api } from '../services/api';

interface AuthViewProps {
  onLoginSuccess: (loginResponse: LoginResponse) => void;
}

/**
 * Komponen AuthView yang menangani proses autentikasi pengguna,
 * termasuk masuk ke akun lama (login) dan pendaftaran akun baru (register).
 */
export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  // --- STATE UNTUK TOGGLE LOGIN ATAU REGISTER ---
  // Menentukan form mana yang aktif (true untuk pendaftaran/register, false untuk masuk/login)
  const [isRegister, setIsRegister] = useState(false);

  // --- STATE Halaman Form dengan Nilai Bawaan (Default Values) ---
  // Email dan Kata Sandi bawaan diisi di awal untuk memudahkan pengujian login
  const [email, setEmail] = useState('arfwjn@gmail.com');
  const [password, setPassword] = useState('••••••••');
  
  // State khusus yang hanya digunakan pada form pendaftaran (Register)
  const [name, setName] = useState('Alex Mercer');
  const [nim, setNim] = useState('202303392');
  const [confirmPassword, setConfirmPassword] = useState('••••••••');
  
  // State penanganan pesan galat (error) dan status memuat (loading)
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- HANDLER KIRIM FORM (SUBMIT) ---
  // Fungsi ini menangani aksi pengiriman data form untuk login maupun registrasi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // --- VALIDASI VALIDITAS INPUT ---
    // Memastikan kolom email dan kata sandi terisi
    if (!email || !password) {
      setError('Harap isi semua kolom wajib.');
      setLoading(false);
      return;
    }

    if (isRegister) {
      // --- VALIDASI PENDAFTARAN ---
      // Memastikan kolom nama lengkap terisi
      if (!name) {
        setError('Harap lengkapi semua data pendaftaran.');
        setLoading(false);
        return;
      }
      // Memastikan panjang kata sandi tidak kurang dari 6 karakter
      if (password.length < 6) {
        setError('Kata sandi minimal harus 6 karakter.');
        setLoading(false);
        return;
      }
      // Memastikan kata sandi konfirmasi sama persis dengan kata sandi utama
      if (password !== confirmPassword) {
        setError('Konfirmasi kata sandi tidak cocok.');
        setLoading(false);
        return;
      }

      // Melakukan pemanggilan API registrasi
      api.auth.register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        nim: nim || undefined,
      })
        .then(() => {
          alert('Pendaftaran berhasil! Silakan masuk.');
          setIsRegister(false); // Kembalikan ke form masuk setelah pendaftaran berhasil
          setError(null);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Pendaftaran gagal.');
          setLoading(false);
        });
    } else {
      // Melakukan pemanggilan API login
      api.auth.login(email, password)
        .then((loginResponse) => {
          onLoginSuccess(loginResponse); // Meneruskan data login berhasil ke komponen utama (App.tsx)
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Gagal masuk.');
          setLoading(false);
        });
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-8">
        
        {/* Logo & Kepala Halaman */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
            {isRegister ? 'Buat Akun' : 'Selamat Datang'}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {isRegister ? 'Bergabung dengan Platform Akademik Mahasiswa Planly' : 'Masuk untuk melanjutkan ke Planly'}
          </p>
        </div>

        {/* Tampilan Pesan Galat jika Terjadi Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Input Autentikasi */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="nim">
                  NIM (Nomor Induk Mahasiswa)
                </label>
                <input
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="nim"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Masukkan NIM"
                  type="text"
                />
              </div>
            </>
          )}

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
              {!isRegister && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert('Tautan pemulihan kata sandi telah dikirim.'); }}
                  className="text-xs text-primary hover:text-primary-container-high transition-colors font-medium"
                >
                  Lupa kata sandi?
                </a>
              )}
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

          {isRegister && (
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
          )}

          <div className="pt-2">
            <button
              className="w-full h-10 bg-[#4F46E5] hover:bg-primary text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar' : 'Masuk'}
            </button>
          </div>
        </form>

        {/* Bilah Tombol Pengalih Form Pendaftaran/Masuk */}
        <div className="mt-6 text-center">
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

      </div>
    </div>
  );
}
