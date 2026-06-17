/**
 * =============================================================================
 * Planly — CompanionProcessingPanel.tsx
 * 
 * Kegunaan:
 * Komponen asisten kuliah AI interaktif (RAG chatbot, pemutar video, sinkronisasi transkrip kuliah, & key takeaways).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan AICompanionView.tsx (orkestrator) dan menggunakan layanan Gemini AI di aiCompanionService.ts.
 * 
 * Aliran Data / State:
 * - Mengunggah video kuliah (.mp4), memutar transkrip seekable timestamp [MM:SS], merender rumus LaTeX KaTeX, & chat RAG.
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import { FileVideo, Brain, Globe, RefreshCw as SpinnerIcon, Terminal, Sparkles } from 'lucide-react';
import { ProcessingStage } from './types';

interface CompanionProcessingPanelProps {
  stage: ProcessingStage;
  progress: number;
}

const STUDY_TIPS = [
  "Sambil menunggu, Anda bisa menggunakan teknik Pomodoro di Ruang Kerja untuk menjaga produktivitas belajar tetap optimal.",
  "Asisten AI Planly menggunakan model Gemini untuk memahami konsep rekaman kuliah Anda secara mendalam.",
  "Catatan Planly mendukung LaTeX. Coba ketik $$ f(x) = max(0, x) $$ untuk merender rumus matematika yang indah.",
  "Anda dapat mengekspor jadwal perkuliahan langsung ke Google Calendar atau Apple Calendar.",
  "Absensi wajah menggunakan verifikasi ganda (Face Landmark & Titik Georeferensi GPS) untuk keamanan tingkat tinggi.",
  "Setelah pemrosesan audio/video selesai, chatbot asisten AI akan aktif dan siap menjawab konsep tersulit dari kuliah Anda.",
  "Lampiran materi kuliah pada Catatan Planly mendukung pengunggahan dokumen hingga ukuran 1.5MB per berkas.",
  "Selalu tinjau poin-poin utama perkuliahan yang diekstrak oleh AI secara teratur untuk memperkuat memori jangka panjang."
];

// Interactive Animated SVG Icons replacing emoticons
const AnimatedBulbIcon = () => (
  <div className="relative flex-shrink-0 mt-0.5 w-5 h-5">
    <svg 
      className="w-5 h-5 text-amber-500 animate-[pulse_1.5s_infinite_ease-in-out]" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
    </svg>
    <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full border border-amber-500/30 animate-ping pointer-events-none" />
  </div>
);

const SuccessLogIcon = () => (
  <svg 
    className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 inline-block mr-1.5 shrink-0 animate-[pulse_1s_infinite]" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AILogIcon = () => (
  <svg 
    className="w-3 h-3 text-purple-500 dark:text-purple-400 inline-block mr-1.5 shrink-0 animate-[spin_3s_linear_infinite]" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
  >
    <path d="M12 2c0 5.5-4.5 10-10 10 5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z" fill="currentColor" />
  </svg>
);

const SystemLogIcon = () => (
  <svg 
    className="w-3 h-3 text-blue-500 dark:text-blue-400 inline-block mr-1.5 shrink-0 animate-[bounce_1.2s_infinite]" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const DefaultLogIcon = () => (
  <span className="w-1.5 h-3 bg-slate-400 dark:bg-slate-600 inline-block mr-1.5 shrink-0 animate-[pulse_1s_infinite]" />
);

export default function CompanionProcessingPanel({ stage, progress }: CompanionProcessingPanelProps) {
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate simulated console logs based on current stage and progress percentage
  const getSimulatedLogs = (): string[] => {
    const logs: string[] = [];
    
    // Stage 1: extracting
    if (stage === 'extracting' || progress > 0) {
      logs.push('[SYSTEM] Menginisialisasi decoder audio...');
      if (progress > 5) logs.push('[SYSTEM] Membuka wadah video MP4...');
      if (progress > 12) logs.push('[SYSTEM] Menemukan track audio AAC/PCM.');
      if (progress > 18) logs.push('[DECODER] Mendekode gelombang suara audio...');
    }
    
    // Stage 2: transcribing
    if (stage === 'transcribing' || progress > 25) {
      logs.push('[SYSTEM] Selesai melakukan dekode audio.');
      logs.push('[GEMINI AI] Menghubungi API Gemini Flash...');
      if (progress > 32) logs.push('[GEMINI AI] Berhasil terhubung dengan token aman.');
      if (progress > 40) logs.push('[AI_COMPANION] Mengirimkan data audio...');
      if (progress > 48) logs.push('[AI_COMPANION] Menyusun kalimat transkrip teks...');
      if (progress > 56) logs.push('[AI_COMPANION] Menautkan timestamp transkrip...');
    }
    
    // Stage 3: summarizing
    if (stage === 'summarizing' || progress > 65) {
      logs.push('[AI_COMPANION] Transkrip teks berhasil dikompilasi.');
      logs.push('[ANALYZER] Mengekstrak bab-bab penting...');
      if (progress > 72) logs.push('[ANALYZER] Merangkum poin-poin utama perkuliahan...');
      if (progress > 78) logs.push('[ANALYZER] Rangkuman konsep berhasil disusun.');
    }
    
    // Stage 4: enriching
    if (stage === 'enriching' || progress > 85) {
      logs.push('[RAG_ENGINE] Membaca sumber daya internet tambahan...');
      if (progress > 90) logs.push('[RAG_ENGINE] Menautkan referensi & rumus LaTeX...');
      if (progress > 95) logs.push('[RAG_ENGINE] Menyelesaikan paket materi perkuliahan...');
    }

    // Take the last 5 logs for scrolling console effect
    return logs.slice(-5);
  };

  const currentLogs = getSimulatedLogs();

  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 min-h-[480px] flex flex-col justify-between items-center relative shadow-xs w-full">
      
      {/* CSS Keyframes for custom wave high performance animations */}
      <style>{`
        @keyframes grow-wave {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1.2); }
        }
        .animate-wave-bar {
          animation: grow-wave 1.2s ease-in-out infinite;
          transform-origin: bottom;
        }
        @keyframes border-glow {
          0%, 100% { border-color: rgba(99, 102, 241, 0.2); }
          50% { border-color: rgba(99, 102, 241, 0.6); }
        }
        .animate-border-glow {
          animation: border-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Header Info & Rotating Tips */}
      <div className="w-full max-w-[500px] text-center space-y-4 pt-4">
        <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Sistem Analisis Cerdas Gemini</span>
        </div>
        
        <h3 className="text-lg font-extrabold text-on-surface">
          {stage === 'extracting' && 'Mengekstrak Audio Kuliah'}
          {stage === 'transcribing' && 'Menyalin Suara ke Teks'}
          {stage === 'summarizing' && 'Menganalisis Konsep & Rangkuman'}
          {stage === 'enriching' && 'Mencari & Memperkaya Materi Akademik'}
        </h3>
        
        <p className="text-xs font-semibold text-on-surface-variant max-w-[380px] mx-auto leading-relaxed h-10">
          {stage === 'extracting' && 'Membaca data audio dari berkas MP4 kuliah untuk diserahkan ke mesin AI...'}
          {stage === 'transcribing' && 'AI sedang menyusun kalimat transkrip perkuliahan dan menyematkan timestamp...'}
          {stage === 'summarizing' && 'AI mengekstrak topik utama, pembahasan bab, dan poin rangkuman penting...'}
          {stage === 'enriching' && 'Mencari penjelasan tambahan, referensi rumus, dan konteks teoretis di internet...'}
        </p>
      </div>

      {/* 2. Central Interactive Loading Visuals */}
      <div className="w-full max-w-[500px] flex flex-col items-center justify-center py-4 space-y-6">
        
        {/* Pulsating Stage Orb & Audio Wave */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse relative z-10">
            {stage === 'extracting' && <FileVideo className="w-9 h-9" />}
            {stage === 'transcribing' && <SpinnerIcon className="w-9 h-9 animate-spin" />}
            {stage === 'summarizing' && <Brain className="w-9 h-9 text-indigo-650 dark:text-indigo-400" />}
            {stage === 'enriching' && <Globe className="w-9 h-9" />}
          </div>
          
          {/* Circular SVG Progress Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
          <svg className="absolute w-24 h-24 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-primary transition-all duration-500"
              style={{
                strokeDasharray: `${2 * Math.PI * 44}`,
                strokeDashoffset: `${2 * Math.PI * 44 * (1 - progress / 100)}`
              }}
            />
          </svg>
        </div>

        {/* Animated Audio Equalizer Wave */}
        <div className="flex items-end justify-center gap-1.5 h-10 select-none">
          {[0.1, 0.4, 0.2, 0.6, 0.3, 0.7, 0.5, 0.2].map((delay, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-8 rounded-full transition-all duration-300 animate-wave-bar ${
                stage === 'extracting' ? 'bg-slate-350 dark:bg-slate-700' :
                stage === 'transcribing' ? 'bg-indigo-500 dark:bg-indigo-400' :
                stage === 'summarizing' ? 'bg-purple-500 dark:bg-purple-400' :
                'bg-emerald-500 dark:bg-emerald-400'
              }`}
              style={{ 
                animationDelay: `${delay}s`,
                animationPlayState: stage === 'extracting' ? 'paused' : 'running'
              }}
            />
          ))}
        </div>

        {/* Traditional Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800/80">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            <span>Analisis Progres</span>
            <span className="text-primary">{progress}%</span>
          </div>
        </div>
      </div>

      {/* 3. Console Logs Feed (Simulated live update console) */}
      <div className="w-full max-w-[500px] console-terminal rounded-xl border p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 shadow-inner flex flex-col gap-1.5 min-h-[110px] text-left transition-colors duration-250">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-450 dark:text-slate-500 border-b border-slate-150 dark:border-slate-900 pb-1.5 mb-1 font-bold uppercase tracking-wider select-none">
          <Terminal className="w-3.5 h-3.5" />
          <span>Konsol Pemrosesan AI</span>
        </div>
        {currentLogs.map((log, idx) => {
          const isSuccess = log.includes('Selesai') || log.includes('Berhasil') || log.includes('dikompilasi') || log.includes('disusun');
          const isSystem = log.includes('[SYSTEM]') || log.includes('[DECODER]');
          const isAI = log.includes('[GEMINI AI]') || log.includes('[AI_COMPANION]') || log.includes('[ANALYZER]') || log.includes('[RAG_ENGINE]');
          
          let colorClass = 'text-slate-600 dark:text-slate-400';
          if (isSuccess) colorClass = 'text-emerald-600 dark:text-emerald-400';
          else if (isSystem) colorClass = 'text-blue-600 dark:text-blue-400';
          else if (isAI) colorClass = 'text-purple-600 dark:text-purple-400';
          
          return (
            <div key={idx} className={`${colorClass} animate-fade-in truncate flex items-center`}>
              {isSuccess && <SuccessLogIcon />}
              {isSystem && !isSuccess && <SystemLogIcon />}
              {isAI && !isSuccess && <AILogIcon />}
              {!isSuccess && !isSystem && !isAI && <DefaultLogIcon />}
              <span>{log}</span>
            </div>
          );
        })}
      </div>

      {/* 4. Tips Carousel Footer banner */}
      <div className="w-full max-w-[500px] mt-4 mb-2 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3 select-none">
        <AnimatedBulbIcon />
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 leading-relaxed text-wrap-pretty transition-all duration-500 text-left flex-1">
          {STUDY_TIPS[tipIndex]}
        </p>
      </div>

    </div>
  );
}
