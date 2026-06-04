import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { LoginResponse } from '../types';
import { api } from '../services/api';

interface AuthViewProps {
  onLoginSuccess: (loginResponse: LoginResponse) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('name@example.com');
  const [password, setPassword] = useState('••••••••');
  
  // Register Fields
  const [name, setName] = useState('Alex Mercer');
  const [nim, setNim] = useState('202303392');
  const [confirmPassword, setConfirmPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Harap isi semua kolom wajib.');
      setLoading(false);
      return;
    }

    if (isRegister) {
      if (!name) {
        setError('Harap lengkapi semua data pendaftaran.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password minimal harus 6 karakter.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        setLoading(false);
        return;
      }

      api.auth.register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        nim: nim || undefined,
      })
        .then(() => {
          alert('Pendaftaran berhasil! Silakan masuk.');
          setIsRegister(false);
          setError(null);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Pendaftaran gagal.');
          setLoading(false);
        });
    } else {
      api.auth.login(email, password)
        .then((loginResponse) => {
          onLoginSuccess(loginResponse);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Login gagal.');
          setLoading(false);
        });
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-8">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {isRegister ? 'Join Planly Academic Workspace' : 'Sign in to continue to Planly'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="name">
                  Full Name
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
                    placeholder="Alex Mercer"
                    type="text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="nim">
                  NIM (Student ID)
                </label>
                <input
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="nim"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="202303392"
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
                placeholder="name@example.com"
                type="email"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-on-surface" htmlFor="password">
                Password
              </label>
              {!isRegister && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert('Password recovery link simulated.'); }}
                  className="text-xs text-primary hover:text-primary-container-high transition-colors font-medium"
                >
                  Forgot password?
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
                Confirm Password
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
              {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Footer Switch */}
        <div className="mt-6 text-center">
          <p className="text-sm text-on-surface-variant">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className="text-primary hover:text-on-primary-fixed-variant font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-primary hover:text-on-primary-fixed-variant font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
