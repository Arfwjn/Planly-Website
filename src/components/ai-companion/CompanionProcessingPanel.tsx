import React from 'react';
import { FileVideo, Brain, Globe, RefreshCw as SpinnerIcon } from 'lucide-react';
import { ProcessingStage } from './types';

interface CompanionProcessingPanelProps {
  stage: ProcessingStage;
  progress: number;
}

/**
 * Komponen CompanionProcessingPanel
 * 
 * Menampilkan status progres analisis AI dari video kuliah yang diunggah.
 * Mencakup visualisasi lingkaran progres (progress ring) dan detail tahapan proses.
 */
export default function CompanionProcessingPanel({ stage, progress }: CompanionProcessingPanelProps) {
  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 min-h-[450px] flex flex-col justify-center items-center relative shadow-xs">
      <div className="w-full max-w-[500px] space-y-8 text-center py-6">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            {stage === 'extracting' && <FileVideo className="w-9 h-9" />}
            {stage === 'transcribing' && <SpinnerIcon className="w-9 h-9 animate-spin" />}
            {stage === 'summarizing' && <Brain className="w-9 h-9" />}
            {stage === 'enriching' && <Globe className="w-9 h-9" />}
          </div>
          
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
          <svg className="absolute w-20 h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-primary transition-all duration-300"
              style={{
                strokeDasharray: `${2 * Math.PI * 36}`,
                strokeDashoffset: `${2 * Math.PI * 36 * (1 - progress / 100)}`
              }}
            />
          </svg>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-base font-extrabold text-on-surface">
            {stage === 'extracting' && 'Mengekstrak Audio Kuliah'}
            {stage === 'transcribing' && 'Menyalin Suara ke Teks'}
            {stage === 'summarizing' && 'Menganalisis Konsep & Rangkuman'}
            {stage === 'enriching' && 'Mencari & Memperkaya Materi Akademik'}
          </h3>
          <p className="text-xs font-semibold text-on-surface-variant max-w-[380px] mx-auto leading-relaxed">
            {stage === 'extracting' && 'Membaca data audio dari berkas MP4 kuliah untuk diserahkan ke mesin AI...'}
            {stage === 'transcribing' && 'AI sedang menyusun kalimat transkrip perkuliahan dan menyematkan timestamp...'}
            {stage === 'summarizing' && 'AI mengekstrak topik utama, pembahasan bab, dan poin rangkuman penting...'}
            {stage === 'enriching' && 'Mencari penjelasan tambahan, referensi rumus, dan konteks teoretis di internet...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            <span>Progres Analisis</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
