/**
 * =============================================================================
 * Planly — NoteCard.tsx
 * 
 * Kegunaan:
 * Komponen modul pencatatan kuliah (catatan belajar) dengan editor Markdown & pratinjau live.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan NotesView.tsx (orkestrator) dan menggunakan notesService untuk sinkronisasi catatan.
 * 
 * Aliran Data / State:
 * - Melakukan CRUD data catatan, parsing format teks Markdown, dan checklist interaktif langsung dari kartu.
 * =============================================================================
 */

import React from 'react';
import { Trash2, Paperclip } from 'lucide-react';
import { Note, Course } from '../../types';
import { hexToRgb } from '../../utils/color';
import NoteContentPreview from './NoteContentPreview';

interface NoteCardProps {
  note: Note;
  courses: Course[];
  onClick: () => void;
  onDeleteClick: (e: React.MouseEvent) => void;
  onToggleTodo: (note: Note, lineIndex: number, e: React.MouseEvent) => void;
}

/**
 * Komponen NoteCard
 * 
 * Render kartu tunggal catatan kuliah di dalam layout masonry.
 * Mendukung:
 * - Aksen warna glow dinamis sesuai mata kuliah yang terkait.
 * - Tombol hapus cepat (Trash2).
 * - Render preview isi catatan (NoteContentPreview) dengan checklist interaktif.
 * - Hiasan gambar geometris kalau catatannya ada kata "Architecture".
 */
export default function NoteCard({
  note,
  courses,
  onClick,
  onDeleteClick,
  onToggleTodo
}: NoteCardProps) {
  // Ambil warna matakuliah terkait untuk efek glow premium
  const course = courses.find((c) => c.id === note.course_id);
  const courseColor = course?.color_hex || '#3525cd';
  
  // Dapatkan kode/nama tag matakuliah
  const courseTagName = course ? course.course_code : 'Umum';

  return (
    <div
      onClick={onClick}
      style={{ '--glow-color': hexToRgb(courseColor) } as React.CSSProperties}
      className="break-inside-avoid bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.08)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_20px_40px_rgba(var(--glow-color),0.12)] transition-all duration-300 cursor-pointer group flex flex-col gap-3 relative overflow-visible"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors cursor-pointer text-on-surface">
          {note.title}
        </h3>
        
        {/* Tombol hapus cepat */}
        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onDeleteClick}
            className="text-red-500 hover:text-red-700 bg-transparent border-none p-0 cursor-pointer"
            title="Hapus catatan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Markdown Preview dengan Checklist support */}
      <NoteContentPreview
        note={note}
        isCard={true}
        onToggleTodo={onToggleTodo}
      />

      {/* Hiasan gambar tambahan khusus catatan berlabel/berjudul Architecture */}
      {note.title.includes('Architecture') && (
        <div className="w-full h-28 bg-slate-100 rounded-lg overflow-hidden relative border border-[#E2E8F0] mt-1">
          <img
            src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600"
            alt="Geometric Notebook drawings"
            className="w-full h-full object-cover grayscale opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}

      {/* Footer kartu catatan */}
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#F1F5F9] dark:border-slate-800/60">
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors ${
            course
              ? 'text-white border-white/10'
              : 'bg-[#F1F5F9] dark:bg-slate-800 text-on-surface-variant border-[#E2E8F0] dark:border-slate-700/80'
          }`}
          style={
            course
              ? {
                  backgroundColor: course.color_hex,
                  boxShadow: `0 2px 8px rgba(var(--glow-color), 0.2)`
                }
              : undefined
          }
        >
          {courseTagName}
        </span>
        
        {note.attachments && note.attachments.length > 0 && (
          <span className="flex items-center gap-1 text-[9px] bg-[#F1F5F9] dark:bg-slate-800 text-on-surface-variant px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-slate-700/80">
            <Paperclip className="w-3 h-3 text-primary" />
            <span>{note.attachments.length} Berkas</span>
          </span>
        )}
        
        <span className="text-[10px] font-medium ml-auto text-[#94A3B8]">
          Baru diperbarui
        </span>
      </div>
    </div>
  );
}
