/**
 * =============================================================================
 * Planly — LandingView.tsx
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


import { ArrowRight } from 'lucide-react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import FeatureShowcase from './FeatureShowcase';
import InteractiveSandbox from './InteractiveSandbox';
import LandingFaq from './LandingFaq';
import LandingFooter from './LandingFooter';

interface LandingViewProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onGoToAuth: (isRegister: boolean) => void;
}

export default function LandingView({ theme, onThemeChange, onGoToAuth }: LandingViewProps) {
  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300">
      
      {/* Background Decorative Grid and Glowing Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Decorative Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/[0.06] dark:bg-indigo-600/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/[0.06] dark:bg-purple-600/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-blue-600/[0.06] dark:bg-blue-600/10 blur-[120px] pointer-events-none z-0" />

      {/* --- HEADER NAVBAR --- */}
      <LandingNavbar 
        theme={theme} 
        onThemeChange={onThemeChange} 
        onGoToAuth={onGoToAuth} 
      />

      {/* --- HERO SECTION --- */}
      <LandingHero 
        theme={theme} 
        onGoToAuth={onGoToAuth} 
      />

      {/* --- CORE FEATURES TOUR (ALTERNATING SHOWCASE) --- */}
      <FeatureShowcase theme={theme} />

      {/* --- INTERACTIVE PLAYGROUND SANDBOX --- */}
      <InteractiveSandbox />

      {/* --- FAQ SECTION --- */}
      <LandingFaq />

      {/* --- CTA BANNER --- */}
      <section className="relative z-10 py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-gradient-to-r dark:from-indigo-950/20 dark:via-slate-900/30 dark:to-indigo-950/20 p-8 sm:p-16 backdrop-blur-md relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Siap Mengatur Kuliahmu Secara Maksimal?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-medium mb-8">
            Daftarkan diri Anda sekarang dan buat workspace perkuliahan Anda sendiri. Rasakan kemudahan belajar dan kelola aktivitas kampus secara fleksibel.
          </p>

          <button
            onClick={() => onGoToAuth(true)}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white rounded-2xl shadow-xl shadow-indigo-600/25 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            Mulai Sekarang — Gratis
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <LandingFooter />

    </div>
  );
}
