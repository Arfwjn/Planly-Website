/**
 * =============================================================================
 * Planly — LandingFooter.tsx
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


import { GraduationCap, ExternalLink } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-200 dark:border-slate-900 bg-slate-100 dark:bg-[#0B0F19] py-12 text-center text-xs text-slate-500 font-semibold select-none">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-350">Planly App</span>
        </div>

        <div>
          &copy; {new Date().getFullYear()} Planly. Hak Cipta Dilindungi Undang-Undang.
        </div>

        <div className="flex gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-800 dark:hover:text-slate-350 flex items-center gap-1 transition-colors">
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
