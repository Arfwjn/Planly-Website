/**
 * =============================================================================
 * Planly — CompanionTranscriptTab.tsx
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
import { Search } from 'lucide-react';
import { TranscriptLine } from './types';

interface CompanionTranscriptTabProps {
  transcriptSearch: string;
  setTranscriptSearch: (val: string) => void;
  transcript: TranscriptLine[];
  activeIndex: number;
  handleSeek: (timeInSeconds: number) => void;
  transcriptContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Komponen CompanionTranscriptTab
 * 
 * Menampilkan transkrip perkuliahan interaktif yang dapat dicari.
 * Baris transkrip yang sedang diputar akan disorot (highlight) secara otomatis.
 */
export default function CompanionTranscriptTab({
  transcriptSearch,
  setTranscriptSearch,
  transcript,
  activeIndex,
  handleSeek,
  transcriptContainerRef,
}: CompanionTranscriptTabProps) {

  // Format detik menjadi MM:SS
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper untuk memformat teks dengan bold (<b> atau **) menjadi tag b
  const formatText = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(<b>[\s\S]*?<\/b>|\*\*[\s\S]*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        return <b key={i} className="font-bold">{part.slice(3, -4)}</b>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <b key={i} className="font-bold">{part.slice(2, -2)}</b>;
      }
      return part;
    });
  };

  // Filter transkrip berdasarkan pencarian kata kunci
  const filteredTranscript = transcript.filter(line => 
    line.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    line.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 text-left">
      {/* Kolom pencarian kata kunci di transkrip */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-855 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Cari materi atau kata kunci kuliah..."
            value={transcriptSearch}
            onChange={(e) => setTranscriptSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
          />
        </div>
      </div>

      {/* Kontainer transkrip yang dapat digulirkan (scrollable) */}
      <div 
        ref={transcriptContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        {filteredTranscript.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Search className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
            <p className="text-xs font-bold text-on-surface-variant">Tidak ditemukan transkrip terkait</p>
            <p className="text-[10px] text-slate-400 font-semibold">Coba kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          filteredTranscript.map((line, idx) => {
            const originalIndex = transcript.indexOf(line);
            const isActive = originalIndex === activeIndex;

            return (
              <div 
                key={idx}
                onClick={() => handleSeek(line.time)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                  isActive 
                    ? 'active-transcript-line border-primary bg-primary/5 text-on-surface shadow-2xs' 
                    : 'border-slate-100 dark:border-slate-850 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850/20'
                }`}
              >
                <button
                  type="button"
                  className={`h-6 px-2 rounded-lg font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors border-none ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-on-surface-variant'
                  }`}
                >
                  {formatTimestamp(line.time)}
                </button>
                
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    line.speaker === 'Dosen' ? 'text-primary' : 'text-emerald-500'
                  }`}>
                    {line.speaker}
                  </span>
                  <p className={`text-xs font-medium leading-relaxed ${
                    isActive ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                  }`}>
                    {formatText(line.text)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
