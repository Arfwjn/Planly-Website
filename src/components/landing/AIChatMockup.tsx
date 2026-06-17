/**
 * =============================================================================
 * Planly — AIChatMockup.tsx
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


import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIChatMockup() {
  return (
    <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0E1322] shadow-xl dark:shadow-2xl dark:shadow-indigo-950/10 overflow-hidden min-h-[380px] sm:min-h-[420px] flex flex-col justify-between transition-all duration-500 hover:scale-[1.01] hover:shadow-purple-500/5 group w-full">
      {/* Header bar */}
      <div className="h-10 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center px-4 justify-between select-none">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
        </div>
        <div className="bg-slate-200/50 dark:bg-slate-950/40 text-[10px] text-slate-500 dark:text-slate-400 px-6 sm:px-12 py-1 rounded-md max-w-[150px] sm:max-w-xs truncate font-mono">
          planly.app/ai-assistant
        </div>
        <div className="w-10" />
      </div>
      
      {/* Chat workspace */}
      <div className="flex-1 p-4 space-y-4 text-xs overflow-y-auto bg-slate-50/50 dark:bg-[#090D16]/40 flex flex-col justify-end">
        {/* Lecture Video uploaded pill */}
        <div className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900/40 p-2 rounded-xl text-indigo-700 dark:text-indigo-300 w-fit mx-auto mb-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="font-semibold text-[10px]">Rekaman_Kuliah_JST.mp4 berhasil dianalisis oleh Gemini AI</span>
        </div>

        {/* User Message */}
        <div className="flex gap-2.5 items-end justify-end pl-8">
          <div className="bg-indigo-600 dark:bg-indigo-600 text-white rounded-2xl rounded-br-none p-3 shadow-sm font-medium">
            Bagaimana formula fungsi aktivasi ReLU dan apa kelebihannya dibanding Sigmoid?
          </div>
        </div>

        {/* AI Message */}
        <div className="flex gap-2.5 items-start pr-8">
          <div className="w-7 h-7 rounded-lg bg-purple-600 dark:bg-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-purple-600/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-none p-3.5 shadow-sm text-slate-700 dark:text-slate-300 space-y-2">
            <p className="font-bold text-purple-600 dark:text-purple-400">Asisten AI Planly:</p>
            <p>Tentu! Formula fungsi <strong>ReLU (Rectified Linear Unit)</strong> adalah:</p>
            <div className="bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg font-mono text-[11px] text-center border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
              f(x) = max(0, x)
            </div>
            <p className="leading-relaxed">
              <strong>Kelebihan utama ReLU:</strong> Menghindari masalah <em>vanishing gradient</em> pada jaringan yang dalam karena gradien positifnya konstan bernilai 1. Hal ini membuat komputasi pelatihan model jauh lebih cepat dibanding Sigmoid yang memetakan output ke rentang (0, 1).
            </p>
          </div>
        </div>
      </div>

      {/* Input bar mockup */}
      <div className="p-3 bg-white dark:bg-[#0E1322] border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2">
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-400 dark:text-slate-500 text-[11px] select-none text-left">
          Tanyakan sesuatu tentang video kuliah Anda...
        </div>
        <button className="p-2 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-colors">
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
