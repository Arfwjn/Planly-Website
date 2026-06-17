/**
 * =============================================================================
 * Planly — LandingNavbar.tsx
 * 
 * Kegunaan:
 * Berkas kode dalam proyek Planly.
 * 
 * Relasi & Dependency:
 * - Berhubungan dengan modul utama aplikasi.
 * 
 * Aliran Data / State:
 * - Mengikuti alur data terpadu (REST API / local mock storage).
 * =============================================================================
 */


import { GraduationCap, ArrowRight, Sun, Moon } from 'lucide-react';

interface LandingNavbarProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onGoToAuth: (isRegister: boolean) => void;
}

export default function LandingNavbar({ theme, onThemeChange, onGoToAuth }: LandingNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/60 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Planly</span>
            <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 block tracking-widest uppercase">Academic Workspace</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer flex items-center justify-center"
            title={theme === 'light' ? 'Ubah ke Mode Gelap' : 'Ubah ke Mode Terang'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => onGoToAuth(false)}
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
          >
            Masuk
          </button>
          <button 
            onClick={() => onGoToAuth(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
          >
            Daftar Sekarang
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
