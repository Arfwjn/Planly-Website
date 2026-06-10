import React, { useState } from 'react';
import { Plus, X, FileText } from 'lucide-react';
import { Note, Course } from '../../types';
import Skeleton from '../ui/Skeleton';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import NoteInspectorModal from './NoteInspectorModal';

interface NotesViewProps {
  notes: Note[];
  courses: Course[];
  onAddNote: (note: Omit<Note, 'id'>) => void;
  onEditNote: (noteId: number, updatedNote: Note) => void;
  onDeleteNote: (noteId: number) => void;
  searchQuery: string;
  loading?: boolean;
}

/**
 * Komponen NotesView (Orkestrator)
 * 
 * Halaman utama pengelolaan Catatan Kuliah.
 * Tanggung jawab:
 * - Menampilkan loading skeleton saat data masih diunduh.
 * - Mengelola pembukaan form tambah catatan baru (`isAdding`).
 * - Mengelola pembukaan modal detail catatan yang dipilih (`selectedNote`).
 * - Melakukan pemfilteran data secara real-time berdasarkan pencarian (`searchQuery`).
 * - Menangani checklist interaktif cepat langsung dari kartu catatan.
 */
export default function NotesView({
  notes,
  courses,
  onAddNote,
  onEditNote,
  onDeleteNote,
  searchQuery,
  loading = false
}: NotesViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // 1. Tampilan Loading Skeleton
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="w-32 h-8 rounded-lg" />
            <Skeleton className="w-72 h-4 rounded-md" />
          </div>
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {[120, 160, 200, 140, 180, 150].map((height, i) => (
            <div key={i} className="break-inside-avoid bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden" style={{ height: `${height}px` }}>
              <Skeleton className="w-3/4 h-5 rounded-md animate-pulse" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-full h-3 rounded-md animate-pulse" />
                <Skeleton className="w-5/6 h-3 rounded-md animate-pulse" />
                {height > 150 && <Skeleton className="w-4/5 h-3 rounded-md animate-pulse" />}
              </div>
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#F1F5F9] dark:border-slate-800/60">
                <Skeleton className="w-12 h-4 rounded-md animate-pulse" />
                <Skeleton className="w-16 h-3 rounded-md ml-auto animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Fungsi Checklist Interaktif dari Luar (Kartu Catatan)
  const handleToggleNoteTodo = (note: Note, lineIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const lines = note.content.split('\n');
    const line = lines[lineIndex];

    if (line.includes('[ ]')) {
      lines[lineIndex] = line.replace('[ ]', '[x]');
    } else if (line.includes('[x]')) {
      lines[lineIndex] = line.replace('[x]', '[ ]');
    }

    const updatedContent = lines.join('\n');
    
    // Pemicu callback penyuntingan ke API / State global
    onEditNote(note.id, {
      ...note,
      content: updatedContent
    });

    // Jika catatan yang sedang di-inspect adalah catatan yang sama, sinkronisasikan detailnya
    if (selectedNote && selectedNote.id === note.id) {
      setSelectedNote({
        ...selectedNote,
        content: updatedContent
      });
    }
  };

  // 3. Saring Catatan Berdasarkan Query Pencarian
  const filteredNotes = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
              <FileText className="w-8 h-8 text-primary" />
              <span>Catatan</span>
            </h1>
            <span className="bg-primary/10 text-primary dark:bg-primary/20 text-xs px-2.5 py-1 rounded-full font-semibold">
              {notes.length} Catatan
            </span>
          </div>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Catat ide, rangkum materi kuliah, dan atur riset Anda.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catatan Baru</span>
        </button>
      </div>

      {/* Formulir Tambah Catatan Baru */}
      {isAdding && (
        <NoteForm
          courses={courses}
          onAddNote={onAddNote}
          onClose={() => setIsAdding(false)}
        />
      )}

      {/* Grid Masonry Catatan */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredNotes.length === 0 ? (
          /* Tampilan Kosong (Empty State) */
          <div className="break-inside-avoid bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm w-full flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 mb-3 flex items-center justify-center text-primary/30">
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 11H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="absolute -top-1 -right-1 animate-pulse">
                <svg className="w-5 h-5 text-yellow-500/60" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.85 8.56L22 9.27L16.5 14L18.18 21L12 17.27L5.82 21L7.5 14L2 9.27L9.15 8.56L12 2Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-bold text-on-surface">Tidak ada catatan ditemukan</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs font-medium leading-relaxed">
              {searchQuery ? 'Coba gunakan kata kunci pencarian yang berbeda.' : 'Mulai catat ide, rangkuman kuliah, atau rencana belajar Anda.'}
            </p>
          </div>
        ) : (
          /* Render kartu catatan */
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              courses={courses}
              onClick={() => setSelectedNote(note)}
              onDeleteClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
                if (selectedNote?.id === note.id) {
                  setSelectedNote(null);
                }
              }}
              onToggleTodo={handleToggleNoteTodo}
            />
          ))
        )}
      </div>

      {/* Modal Detail & Edit Catatan */}
      {selectedNote && (
        <NoteInspectorModal
          selectedNote={selectedNote}
          courses={courses}
          onClose={() => setSelectedNote(null)}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      )}

    </div>
  );
}
