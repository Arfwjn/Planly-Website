/**
 * =============================================================================
 * Planly — ApiKeyModal.tsx
 * 
 * Kegunaan:
 * Komponen antarmuka (UI) umum reusable (CustomSelect, DatePicker, Skeleton loader, alert toast, EmptyState, dll.).
 * 
 * Relasi & Dependency:
 * - Digunakan berulang kali (shared components) oleh berbagai modul halaman View di aplikasi.
 * 
 * Aliran Data / State:
 * - Menerima props input, trigger event handler, dan mengontrol transisi visual antarmuka agar konsisten.
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, ShieldCheck, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentKey: string;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onSave,
  currentKey
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  // Sinkronkan state lokal saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setApiKey(currentKey || '');
      setShowKey(false);
      setError('');
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Kunci API tidak boleh kosong.');
      return;
    }
    
    // Validasi format dasar API Key Gemini (biasanya 39 karakter diawali AIzaSy)
    if (trimmed.length < 20) {
      setError('Format API Key tampaknya tidak valid (terlalu pendek).');
      return;
    }

    setError('');
    onSave(trimmed);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in text-left flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4.5 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Key className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-on-surface">Konfigurasi API Key</h3>
              <p className="text-[10px] text-on-surface-variant font-medium">Asisten Belajar AI & Analisis Kuliah</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 flex-1">
          {/* Informasi Edukatif */}
          <div className="bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2 text-left">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privasi & Keamanan Terjamin</span>
            </div>
            <p className="text-[10px] leading-relaxed text-on-surface-variant font-semibold">
              Kunci API disimpan secara lokal di browser Anda dengan enkripsi berbasis sidik jari browser unik. Data Anda tidak dikirimkan ke server kami dan hanya digunakan langsung untuk menghubungi API Google Gemini.
            </p>
          </div>

          {/* Form Input API Key */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Gemini API Key
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Masukkan API Key (AIzaSy...)"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-xs font-mono bg-slate-50/50 dark:bg-slate-900/50 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${
                  error ? 'border-red-500/60 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {error && (
              <p className="text-[10px] font-bold text-red-500 mt-1 animate-pulse">
                ⚠️ {error}
              </p>
            )}
            
            {/* Indikator Karakter Tersamarkan (Privasi Feedback) */}
            {apiKey && !showKey && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-on-surface-variant/70 font-mono">
                <span>Enkripsi Aktif:</span>
                <span className="text-emerald-500">••••••••••••••••••••••••</span>
              </div>
            )}
          </div>

          {/* Tautan ke Google AI Studio */}
          <div className="pt-1 text-center">
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors hover:underline"
            >
              <span>Dapatkan Gemini API Key Gratis di Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-on-surface-variant font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Gunakan Demo / Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Simpan Kunci API</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
