/**
 * =============================================================================
 * Planly — LandingHero.tsx
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

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import BrowserMockup from './BrowserMockup';

interface LandingHeroProps {
  theme: 'light' | 'dark';
  onGoToAuth: (isRegister: boolean) => void;
}

export default function LandingHero({ theme, onGoToAuth }: LandingHeroProps) {
  const [stats, setStats] = useState({ users: 1200, studyHours: 8500, tasksCompleted: 24000 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        studyHours: prev.studyHours + Math.floor(Math.random() * 2),
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 4)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative z-10 pt-16 pb-12 sm:pt-24 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Banner Pill */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold mb-8 animate-fade-in hover:border-slate-350 dark:hover:border-slate-700 transition-all select-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>Platform Produktivitas Akademik #1 Mahasiswa</span>
      </div>

      {/* Hero Headline */}
      <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
        Kelola Kuliah & Aktivitas Kampus Lebih{' '}
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient-flow">
          Cerdas & Terorganisir
        </span>
      </h1>

      {/* Hero Subtitle */}
      <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed mb-10 text-wrap-pretty">
        Satu-satunya workspace akademik mahasiswa yang mengintegrasikan Manajemen Kuliah, Catatan Markdown, Asisten AI (RAG Video), Pomodoro Timer, hingga Absensi Wajah GPS dalam satu platform terpadu.
      </p>

      {/* Call To Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 max-w-md mx-auto sm:max-w-none">
        <button 
          onClick={() => onGoToAuth(true)}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-600 active:bg-indigo-700 text-base font-bold text-white rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          Mulai Secara Gratis
          <ArrowRight className="w-5 h-5" />
        </button>
        <a 
          href="#playground"
          className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-base font-bold text-slate-700 dark:text-slate-200 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          Coba Demo Interaktif
        </a>
      </div>

      {/* --- Browser Mockup Dashboard Screenshot --- */}
      <div className="max-w-5xl mx-auto">
        <BrowserMockup 
          src={theme === 'dark' ? '/planly_today_dark.png' : '/planly_today_light.png'} 
          alt="Dasbor Hari Ini Planly"
          maxHeightClass="max-h-[380px] sm:max-h-[500px]"
        />
      </div>

      {/* --- STATS COUNTER BAR --- */}
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mt-20 border-t border-slate-200 dark:border-slate-800/80 pt-12 text-center select-none">
        <div>
          <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.users.toLocaleString()}+
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
            Mahasiswa Aktif
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
            {stats.studyHours.toLocaleString()}+
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
            Jam Fokus Belajar
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.tasksCompleted.toLocaleString()}+
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
            Tugas Terselesaikan
          </div>
        </div>
      </div>
    </section>
  );
}
