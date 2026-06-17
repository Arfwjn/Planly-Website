/**
 * =============================================================================
 * Planly — CompanionVideoPanel.tsx
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

import React from 'react';
import { FileVideo, Video, Clock } from 'lucide-react';
import { ProcessedVideoMetadata } from './types';

interface CompanionVideoPanelProps {
  videoUrl: string | null;
  videoMeta: ProcessedVideoMetadata;
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onTimeUpdate: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Komponen CompanionVideoPanel
 * 
 * Mengelola pemutar video rekaman kuliah (.mp4).
 * Menampilkan pesan reconnect apabila tautan video lokal terputus karena keterbatasan keamanan browser.
 */
export default function CompanionVideoPanel({
  videoUrl,
  videoMeta,
  currentTime,
  videoRef,
  fileInputRef,
  onTimeUpdate,
  onFileChange,
}: CompanionVideoPanelProps) {

  // Format detik menjadi MM:SS
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="lg:col-span-5 space-y-6">
      <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-4 shadow-sm space-y-4 text-left">
        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-1.5">
          Video Rekaman Kuliah
        </span>
        
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={onTimeUpdate}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
          />
        ) : (
          <div className="w-full aspect-video rounded-xl bg-slate-100 dark:bg-slate-800/60 flex flex-col items-center justify-center p-6 text-center gap-3 border border-slate-200 dark:border-slate-800">
            <FileVideo className="w-8 h-8 text-[#94A3B8] opacity-80" />
            <div>
              <p className="text-xs font-extrabold text-on-surface">Video Memerlukan Koneksi Ulang</p>
              <p className="text-[10px] text-on-surface-variant mt-1 max-w-[280px] leading-relaxed font-semibold">
                Demi keamanan browser, silakan hubungkan kembali file video asli <strong>{videoMeta.name}</strong> untuk memutarnya.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 bg-primary hover:bg-[#4F46E5] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs border-none"
            >
              Hubungkan File Video
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="video/mp4"
              className="hidden"
            />
          </div>
        )}

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-extrabold block text-on-surface truncate">
                {videoMeta.name}
              </span>
              <span className="text-[10px] text-on-surface-variant font-semibold mt-0.5 block">
                Ukuran: {videoMeta.size} • Waktu Putar: {formatTimestamp(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50/50 dark:bg-slate-850/20 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-[11px] text-on-surface-variant leading-relaxed text-left">
        <div className="flex gap-2">
          <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span className="font-semibold">
            Klik penanda waktu (<b>timestamp</b>) pada baris transkrip di sebelah kanan untuk melompat langsung ke penjelasan materi dosen pada video.
          </span>
        </div>
      </div>
    </div>
  );
}
