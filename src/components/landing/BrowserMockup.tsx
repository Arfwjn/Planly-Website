/**
 * =============================================================================
 * Planly — BrowserMockup.tsx
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



interface BrowserMockupProps {
  src: string;
  alt: string;
  url?: string;
  className?: string;
  maxHeightClass?: string;
}

export default function BrowserMockup({
  src,
  alt,
  url = 'planly.app/dashboard',
  className = '',
  maxHeightClass = 'max-h-[320px] sm:max-h-[420px]'
}: BrowserMockupProps) {
  return (
    <div className={`relative rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1322] shadow-xl dark:shadow-2xl dark:shadow-indigo-950/10 overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:shadow-indigo-500/5 group ${className}`}>
      {/* Header bar */}
      <div className="h-10 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center px-4 justify-between select-none">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
        </div>
        <div className="bg-slate-200/50 dark:bg-slate-950/40 text-[10px] text-slate-500 dark:text-slate-400 px-6 sm:px-12 py-1 rounded-md max-w-[150px] sm:max-w-xs truncate font-mono">
          {url}
        </div>
        <div className="w-10" /> {/* Spacer to balance dots */}
      </div>
      
      {/* Screenshot wrapper */}
      <div className="overflow-hidden bg-slate-50 dark:bg-[#090D16] flex items-start justify-center">
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-auto object-cover object-top transition-transform duration-700 group-hover:scale-[1.02] ${maxHeightClass}`} 
        />
      </div>
    </div>
  );
}
