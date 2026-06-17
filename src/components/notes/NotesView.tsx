/**
 * =============================================================================
 * Planly — NotesView.tsx
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

import { useState } from 'react';
import { Plus, FileText, PenLine, BookMarked } from 'lucide-react';
import EmptyState from '../ui/InteractiveEmptyState';
import { Note, Course } from '../../types';
import Skeleton from '../ui/Skeleton';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import NoteInspectorModal from './NoteInspectorModal';
import CustomSelect from '../ui/CustomSelect';

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
  const [courseFilter, setCourseFilter] = useState<string>('all');

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

  // Generate course options for select
  const courseOptions = [
    { value: 'all', label: 'Semua Mata Kuliah' },
    ...courses.map((c) => ({
      value: String(c.id),
      label: `${c.course_code} - ${c.course_name}`
    }))
  ];

  // 3. Saring Catatan Berdasarkan Query Pencarian dan Mata Kuliah
  const filteredNotes = notes.filter((note) => {
    const matchSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCourse = courseFilter === 'all' || String(note.course_id) === courseFilter;
    return matchSearch && matchCourse;
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
      
      {/* Controls Row */}
      <div className="flex justify-end border-b border-[#E2E8F0] dark:border-slate-800 pb-4 mb-6">
        <div className="w-full sm:w-64">
          <CustomSelect
            value={courseFilter}
            onChange={setCourseFilter}
            options={courseOptions}
            placeholder="Saring Mata Kuliah"
            position="down"
          />
        </div>
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
          <div className="break-inside-avoid w-full">
            <EmptyState
              icons={[
                <PenLine className="w-5 h-5" />,
                <FileText className="w-5 h-5" />,
                <BookMarked className="w-5 h-5" />,
              ]}
              title={searchQuery ? 'Tidak ada catatan ditemukan' : 'Belum ada catatan'}
              description={searchQuery ? 'Coba gunakan kata kunci pencarian yang berbeda.' : 'Mulai catat ide, rangkuman kuliah, atau rencana belajar Anda.'}
              action={{
                label: 'Catatan Baru',
                icon: <Plus className="w-4 h-4" />,
                onClick: () => setIsAdding(true)
              }}
            />
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
