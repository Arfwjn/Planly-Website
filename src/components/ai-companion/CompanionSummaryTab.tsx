/**
 * =============================================================================
 * Planly — CompanionSummaryTab.tsx
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
import { Globe, BookOpen, Lightbulb, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { LectureChapter, AcademicEnrichment } from './types';

interface CompanionSummaryTabProps {
  handleSeek: (timeInSeconds: number) => void;
  chapters?: LectureChapter[];
  takeaways?: string[];
  enrichment?: AcademicEnrichment;
}

/**
 * Komponen CompanionSummaryTab
 * 
 * Menampilkan ringkasan otomatis kecerdasan buatan (AI) yang mencakup bab pembahasan (Chapters),
 * poin rangkuman penting (Key Takeaways), serta pengayaan akademis eksternal (Google Grounding).
 */
export default function CompanionSummaryTab({ 
  handleSeek, 
  chapters = [], 
  takeaways = [], 
  enrichment 
}: CompanionSummaryTabProps) {
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 p-5 space-y-6 custom-scrollbar text-left">
      
      {/* Bagian 1: Daftar Bab Kuliah (Chapters) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 pb-1 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>Daftar Pembahasan Kuliah (Chapters)</span>
        </h4>
        {chapters.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic font-medium">
            Belum ada pembahasan yang terdeteksi dari audio kuliah.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {chapters.map((chapter, index) => (
              <div 
                key={index}
                onClick={() => handleSeek(chapter.time)}
                className="flex items-start gap-3 p-3 bg-slate-50/50 dark:bg-slate-850/25 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary/40 transition-colors cursor-pointer"
              >
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-mono font-bold mt-0.5">
                  {formatTimestamp(chapter.time)}
                </span>
                <div>
                  <span className="text-xs font-extrabold text-on-surface block leading-tight">{formatText(chapter.title)}</span>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">{formatText(chapter.desc)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bagian 2: Ringkasan Inti (Key Takeaways) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 pb-1 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
          <span>Poin Rangkuman AI (Key Takeaways)</span>
        </h4>
        {takeaways.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic font-medium">
            Belum ada poin rangkuman penting.
          </p>
        ) : (
          <ul className="space-y-2.5 text-xs text-on-surface-variant font-medium pl-1">
            {takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg className="w-1.5 h-1.5 text-primary mt-1.5 flex-shrink-0" viewBox="0 0 8 8" fill="currentColor">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span>{formatText(takeaway)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bagian 3: AI Academic Enrichment (Wawasan Tambahan dari Internet) */}
      {enrichment && (
        <div className="p-5 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-pink-50/10 dark:from-indigo-950/10 dark:via-purple-950/5 dark:to-transparent border border-primary/15 dark:border-primary/5 rounded-3xl space-y-4 shadow-xs w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-2.5 text-primary border-b border-primary/10 pb-2">
            <Globe className="w-5 h-5 text-primary stroke-[2.5px] animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Wawasan Akademik Tambahan (Sumber Internet & Google Search)
            </span>
          </div>
          
          {enrichment.explanation && (
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium pl-3 border-l-2 border-primary/30">
              {formatText(enrichment.explanation)}
            </p>
          )}

          {enrichment.cards && enrichment.cards.length > 0 && (
            <div className="relative group/slider pt-1 w-full overflow-hidden">
              {/* Arrow Left */}
              {enrichment.cards.length > 1 && (
                <button
                  onClick={() => scrollSlider('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 flex items-center justify-center shadow-xs hover:bg-primary hover:text-white dark:hover:bg-primary transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3px]" />
                </button>
              )}

              {/* Arrow Right */}
              {enrichment.cards.length > 1 && (
                <button
                  onClick={() => scrollSlider('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 flex items-center justify-center shadow-xs hover:bg-primary hover:text-white dark:hover:bg-primary transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100"
                  type="button"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3px]" />
                </button>
              )}

              {/* Scrollable Container */}
              <div 
                ref={sliderRef}
                className="flex overflow-x-auto gap-4 py-2 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar w-full"
              >
                {enrichment.cards.map((card, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 w-[280px] md:w-[320px] snap-start bg-white/70 dark:bg-slate-900/75 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-primary block uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                        {formatText(card.title)}
                      </span>
                      <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                        {formatText(card.description)}
                      </p>
                    </div>
                    {card.formula && (
                      <div className="w-full overflow-hidden flex-shrink-0">
                        <KatexRenderer formula={card.formula} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {enrichment.sources && enrichment.sources.length > 0 && (
            <div className="pt-3 border-t border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-bold text-primary">
              <span className="text-on-surface-variant font-extrabold uppercase tracking-wider">Sumber Tambahan Terkait:</span>
              <div className="flex flex-wrap gap-1.5">
                {enrichment.sources.map((source, index) => (
                  <a 
                    key={index}
                    href={source.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-2.5 py-1 bg-primary/5 hover:bg-primary hover:text-white border border-primary/15 rounded-full hover:underline flex items-center gap-1 transition-all"
                  >
                    <span>{source.label}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Komponen pembantu untuk merender rumus LaTeX menggunakan KaTeX
const KatexRenderer = ({ formula }: { formula: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const katex = (window as any).katex;
    if (katex && containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
      }
    }
  }, [formula]);

  const hasKatex = typeof (window as any).katex !== 'undefined';

  if (!hasKatex) {
    return (
      <div className="bg-slate-50 dark:bg-slate-850 p-1.5 rounded font-mono text-[10px] text-center text-on-surface">
        {formula}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded overflow-x-auto flex justify-center text-xs text-on-surface custom-scrollbar">
      <div ref={containerRef} />
    </div>
  );
};
