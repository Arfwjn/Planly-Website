/**
 * =============================================================================
 * Planly — CompanionIdlePanel.tsx
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
import { Upload, FileVideo, Sparkles } from 'lucide-react';
import { ProcessedSession } from './types';

interface CompanionIdlePanelProps {
  sessions: ProcessedSession[];
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadDemo: () => void;
  onLoadHistorySession: (sess: ProcessedSession) => void;
  onDeleteSessionClick: (e: React.MouseEvent, id: string) => void;
}

/**
 * Komponen CompanionIdlePanel
 * 
 * Menampilkan antarmuka awal untuk mengunggah berkas rekaman video kuliah (.mp4)
 * serta menampilkan riwayat sesi kuliah yang telah diproses sebelumnya.
 */
export default function CompanionIdlePanel({
  sessions,
  dragActive,
  onDrag,
  onDrop,
  fileInputRef,
  onFileChange,
  onLoadDemo,
  onLoadHistorySession,
  onDeleteSessionClick,
}: CompanionIdlePanelProps) {
  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 min-h-[450px] flex flex-col justify-center items-center relative shadow-xs gap-6">
      <div 
        className="w-full max-w-[650px] text-center space-y-6"
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="video/mp4"
          className="hidden"
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ${
            dragActive 
              ? 'border-primary bg-primary/5 scale-98 shadow-inner' 
              : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-800'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F5F2FF] dark:bg-slate-850 flex items-center justify-center text-primary shadow-xs">
            <Upload className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-on-surface">
              Tarik & Lepas Video Rekaman Kuliah
            </p>
            <p className="text-xs font-semibold text-on-surface-variant">
              atau klik untuk menelusuri berkas dari komputer Anda (Format: .mp4)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <span className="text-xs font-bold text-on-surface-variant">Belum punya rekaman video?</span>
          <button
            type="button"
            onClick={onLoadDemo}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/25 text-primary font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors border-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gunakan Demo Rekaman Kuliah</span>
          </button>
        </div>
      </div>

      {/* Riwayat Sesi Kuliah Terproses */}
      {sessions.length > 0 && (
        <div className="w-full max-w-[650px] bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-left space-y-3 mt-4">
          <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 pb-1.5">
            Riwayat Kuliah Terproses
          </span>
          
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {sessions.map((sess) => (
              <div 
                key={sess.id}
                onClick={() => onLoadHistorySession(sess)}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary/50 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <FileVideo className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-on-surface truncate">
                      {sess.name}
                    </span>
                    <span className="text-[9px] text-on-surface-variant font-semibold mt-0.5 block">
                      {sess.dateStr} • {sess.size}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    sess.isDemo 
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/35 dark:text-purple-400' 
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-950/35 dark:text-blue-400'
                  }`}>
                    {sess.isDemo ? 'Demo' : 'Lokal'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => onDeleteSessionClick(e, sess.id)}
                    className="p-1 text-[#94A3B8] hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
                    title="Hapus dari riwayat"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
