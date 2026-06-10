import React from 'react';
import { Palette, Download, Upload, LogOut, Sun, Moon } from 'lucide-react';

interface BackupRecoveryPanelProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Komponen BackupRecoveryPanel
 * 
 * Bagian pengaturan sistem yang menangani preferensi visual (ganti tema gelap/terang),
 * portabilitas data (ekspor & impor backup JSON lokal), dan keluar sesi aktif (log out).
 */
export default function BackupRecoveryPanel({
  theme,
  onThemeChange,
  onExportData,
  onImportData
}: BackupRecoveryPanelProps) {
  return (
    <div className="space-y-6">
      {/* Pilihan Tema Tampilan */}
      <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
            <Palette className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-base font-bold text-on-surface">Tema Tampilan</h3>
        </div>
 
        <div className="grid grid-cols-2 gap-3 mt-2">
          {/* Mode Terang */}
          <div
            onClick={() => onThemeChange('light')}
            className={`border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 group hover:scale-[1.03] active:scale-[0.97] ${
              theme === 'light'
                ? 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'border-white/60 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60 hover:border-amber-300 dark:hover:border-amber-800/40 hover:bg-amber-50/10 dark:hover:bg-amber-950/5 text-on-surface-variant'
            }`}
          >
            <Sun className={`w-6 h-6 transition-transform duration-500 group-hover:rotate-45 ${
              theme === 'light' ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400 group-hover:text-amber-500'
            }`} />
            <span className={`text-xs font-bold transition-colors duration-200 ${theme === 'light' ? 'text-amber-600 dark:text-amber-400' : 'text-on-surface-variant group-hover:text-amber-600 dark:group-hover:text-amber-400'}`}>
              Mode Terang
            </span>
          </div>
          
          {/* Mode Gelap */}
          <div
            onClick={() => onThemeChange('dark')}
            className={`border rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 group hover:scale-[1.03] active:scale-[0.97] ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-500/5 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'border-white/60 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-800/40 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/5 text-on-surface-variant'
            }`}
          >
            <Moon className={`w-6 h-6 transition-transform duration-500 group-hover:-rotate-12 ${
              theme === 'dark' ? 'text-indigo-500 fill-indigo-500/20' : 'text-slate-400 group-hover:text-indigo-550'
            }`} />
            <span className={`text-xs font-bold transition-colors duration-200 ${theme === 'dark' ? 'text-indigo-650 dark:text-indigo-400' : 'text-on-surface-variant group-hover:text-indigo-650 dark:group-hover:text-indigo-400'}`}>
              Mode Gelap
            </span>
          </div>
        </div>
      </div>

      {/* Ekspor & Impor Data (Cadangan Lokal) */}
      <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
              <Download className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Ekspor & Impor Data</h3>
          </div>
          
          <p className="text-xs leading-relaxed text-on-surface-variant font-medium mb-4">
            Semua data akademis Planly disimpan secara lokal di peramban browser kamu. Ekspor secara berkala ke berkas JSON untuk mengamankan cadangan data kuliah kamu.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Tombol Ekspor */}
            <button
              type="button"
              onClick={onExportData}
              className="flex-1 h-9 px-4 bg-white dark:bg-slate-850 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-on-surface"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Cadangan</span>
            </button>

            {/* Tombol Impor */}
            <label
              className="flex-1 h-9 px-4 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>Impor Cadangan</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportData}
              />
            </label>
          </div>
        </div>

        {/* Peringatan Impor */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-[#94A3B8] font-bold flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Peringatan: Mengimpor data akan menimpa seluruh data saat ini secara permanen.</span>
        </div>
      </div>
    </div>
  );
}
