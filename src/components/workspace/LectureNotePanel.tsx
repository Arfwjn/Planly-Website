/**
 * =============================================================================
 * Planly — LectureNotePanel.tsx
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


import { FileText } from 'lucide-react';

interface LectureNotePanelProps {
  activeLectureCourseId: number | null;
  lectureNoteContent: string;
  setLectureNoteContent: (val: string) => void;
}

/**
 * Komponen LectureNotePanel
 * 
 * Panel catatan khusus saat mengikuti sesi kuliah live.
 * Mengontrol input area teks ringkasan materi kuliah mahasiswa.
 */
export default function LectureNotePanel({
  activeLectureCourseId,
  lectureNoteContent,
  setLectureNoteContent
}: LectureNotePanelProps) {
  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col flex-1 min-h-[250px] text-left">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-card-border dark:border-slate-800 pb-2.5 mb-3 select-none">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-on-surface">Catatan Kuliah (Materi)</h3>
        </div>
        <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 dark:border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Materi
        </span>
      </div>

      {/* Textarea Editor */}
      <textarea
        className="flex-1 w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant placeholder:font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[150px] font-sans"
        placeholder="Ketik ringkasan materi, teori, rumus, atau poin penjelasan dosen langsung di sini..."
        value={lectureNoteContent}
        onChange={(e) => setLectureNoteContent(e.target.value)}
        disabled={!activeLectureCourseId}
      />
    </div>
  );
}
