import React, { useState } from 'react';
import { Notebook, Search, Plus, X, MessageSquare, BookOpen, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { Note, Course } from '../types';
import Skeleton from './ui/Skeleton';
import CustomSelect from './ui/CustomSelect';
import type { SelectOption } from './ui/CustomSelect';
import { hexToRgb } from '../utils/color';

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
 * Komponen NotesView
 * 
 * Di sini kita mengelola visualisasi daftar catatan kuliah (notes). Komponen ini berguna untuk
 * menampilkan, mencari, menyaring, menambah, mengedit, dan menghapus catatan kuliah. 
 * Catatan dapat kita kaitkan dengan mata kuliah tertentu (courses) serta mendukung beberapa
 * visualisasi khusus seperti daftar tugas (to-do list) dan gambar ilustrasi.
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
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        {/* Header Halaman Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="w-32 h-8 rounded-lg" />
            <Skeleton className="w-72 h-4 rounded-md" />
          </div>
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>

        {/* Masonry Columns Skeleton */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {[120, 160, 200, 140, 180, 150].map((height, i) => (
            <div key={i} className="break-inside-avoid bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden" style={{ height: `${height}px` }}>
              <Skeleton className="w-3/4 h-5 rounded-md animate-pulse" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-full h-3 rounded-md animate-pulse" />
                <Skeleton className="w-5/6 h-3 rounded-md animate-pulse" />
                {height > 150 && <Skeleton className="w-4/5 h-3 rounded-md animate-pulse" />}
              </div>
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#F1F5F9]">
                <Skeleton className="w-12 h-4 rounded-md animate-pulse" />
                <Skeleton className="w-16 h-3 rounded-md ml-auto animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // Di sini kita menggunakan state untuk melacak apakah formulir tambah catatan baru sedang terbuka
  const [isAdding, setIsAdding] = useState(false);
  // State ini kita gunakan untuk menyimpan judul dan isi catatan baru yang sedang diinput oleh pengguna
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // State ini berguna untuk menyimpan ID mata kuliah yang kita pilih untuk catatan baru
  const [courseId, setCourseId] = useState<string>('');
  // State ini kita pakai untuk menyimpan pesan kesalahan saat validasi formulir tambah catatan
  const [errorMsg, setErrorMsg] = useState('');

  // Di sini kita melacak catatan yang sedang dipilih/dilihat detailnya, serta status editnya
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State ini kita gunakan untuk menyimpan data input saat menyunting/mengedit catatan yang sedang kita pilih
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCourseId, setEditCourseId] = useState<string>('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Build course select options dynamically from courses prop
  const courseSelectOptions: SelectOption[] = [
    { value: '', label: 'Catatan Umum' },
    ...courses.map(c => ({ value: String(c.id), label: `${c.course_code} - ${c.course_name}` }))
  ];

  // Fungsi ini berguna untuk menangani pemilihan salah satu catatan agar kita bisa melihat detailnya.
  // Di sini, kita memuat data catatan tersebut ke dalam state penyuntingan dan menutup mode edit terlebih dahulu.
  const handleInspectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCourseId(note.course_id !== null ? String(note.course_id) : '');
    setEditErrorMsg('');
  };

  // Fungsi ini berguna untuk menangani pengiriman form saat kita membuat catatan baru.
  // Di sini kita memvalidasi input, memanggil fungsi callback onAddNote, dan mereset form kembali ke kondisi awal.
  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !content.trim()) {
      setErrorMsg('Harap isi judul catatan dan isi materi.');
      return;
    }

    onAddNote({
      title,
      content,
      course_id: courseId === '' ? null : Number(courseId),
      user_id: 1
    });

    setTitle('');
    setContent('');
    setCourseId('');
    setIsAdding(false);
  };

  // Fungsi ini berguna untuk menangani pengiriman form saat kita mengedit catatan yang dipilih.
  // Di sini kita memvalidasi perubahan lalu memperbarui catatan melalui callback onEditNote.
  const handleEditNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg('');

    if (!editTitle.trim() || !editContent.trim()) {
      setEditErrorMsg('Harap isi judul catatan dan isi materi.');
      return;
    }

    onEditNote(selectedNote!.id, {
      ...selectedNote!,
      title: editTitle,
      content: editContent,
      course_id: editCourseId === '' ? null : Number(editCourseId),
      user_id: 1
    });

    setSelectedNote(null);
    setIsEditing(false);
  };

  // Fungsi ini berguna untuk menangani penghapusan catatan yang ada.
  // Kita menggunakan e.stopPropagation() di sini agar klik tombol tidak memicu event klik pada kartu catatan (handleInspectNote).
  const handleDeleteClick = (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation();
    onDeleteNote(noteId);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  // Fungsi penolong ini berguna untuk menghubungkan catatan dengan mata kuliah.
  // Kita akan mengembalikan kode mata kuliah jika ID cocok, atau 'Umum' jika tidak terhubung ke mata kuliah spesifik.
  const getCourseTagName = (cid: number | null) => {
    if (cid === null) return 'Umum';
    const c = courses.find((item) => item.id === cid);
    return c ? c.course_code : 'Akademik';
  };

  // Di sini kita menyaring catatan berdasarkan query pencarian secara real-time.
  // Pencarian yang kita lakukan mencakup judul catatan (title) dan konten catatan (content).
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Catatan</h2>
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

      {/* Formulir inline untuk menambah catatan baru */}
      {isAdding && (
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm relative animate-fade-in space-y-4">
          <button
            onClick={() => setIsAdding(false)}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-white border border-[#E2E8F0] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Buat Catatan Kuliah Baru</h3>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateNoteSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Judul Catatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kuliah Psikologi Kognitif 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Kaitkan Mata Kuliah (Opsional)
                </label>
                <CustomSelect
                  value={courseId}
                  onChange={(val) => setCourseId(val)}
                  options={courseSelectOptions}
                  placeholder="Catatan Umum"
                  position="down"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Isi / Catatan Materi
              </label>
              <textarea
                required
                rows={10}
                placeholder="Mulai tulis catatan Anda di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 bg-white border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-[#E2E8F0] bg-white rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-[#4F46E5] cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tampilan Grid Masonry Catatan */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredNotes.length === 0 ? (
          <div className="break-inside-avoid bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm w-full flex flex-col items-center justify-center">
            {/* Custom SVG Illustration for Empty Notes */}
            <div className="relative w-20 h-20 mb-3 flex items-center justify-center text-primary/30">
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 11H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {/* Floating element */}
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
          filteredNotes.map((note) => {
            // Di sini kita menggunakan visualisasi khusus: mendeteksi jika catatan adalah daftar tugas (to-do list)
            const isTodoNote = note.title.toLowerCase().includes('to-do list');
            const courseColor = courses.find((c) => c.id === note.course_id)?.color_hex || '#3525cd';
            return (
              <div
                key={note.id}
                onClick={() => handleInspectNote(note)}
                style={{ '--glow-color': hexToRgb(courseColor) } as React.CSSProperties}
                className="break-inside-avoid bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.08)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_20px_40px_rgba(var(--glow-color),0.12)] transition-all duration-300 cursor-pointer group flex flex-col gap-3 relative overflow-visible"
              >

                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors cursor-pointer text-on-surface">
                    {note.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteClick(e, note.id)}
                      className="text-red-500 hover:text-red-700 bg-transparent border-none p-0 cursor-pointer"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tampilan Konten Catatan: Di sini, jika catatan berupa to-do list, kita render sebagai checkbox interaktif (readOnly); jika teks biasa, kita render normal dengan batas baris */}
                {isTodoNote ? (
                  <ul className="text-xs space-y-1 text-on-surface-variant font-medium">
                    {note.content.split('\n').map((item, id) => {
                      const isChecked = item.includes('[x]');
                      const label = item.replace('[ ]', '').replace('[x]', '').trim();
                      return (
                        <li key={id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded border-[#C7C4D8] text-primary focus:ring-primary grayscale scale-95 opacity-60 pointer-events-none"
                          />
                          <span className={isChecked ? 'line-through text-[#94A3B8]' : ''}>
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs leading-relaxed line-clamp-6 text-on-surface-variant">
                    {note.content}
                  </p>
                )}

                {/* Di sini kita tambahkan aksen grafis/gambar tambahan jika catatan berisi tentang "Architecture" */}
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

                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#F1F5F9]">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-on-surface-variant border border-[#E2E8F0]">
                    {getCourseTagName(note.course_id)}
                  </span>
                  <span className="text-[10px] font-medium ml-auto text-[#94A3B8]">
                    Baru diperbarui
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal Detail Catatan (Note Inspection & Editing) */}
      {selectedNote && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setSelectedNote(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden border border-[#E2E8F0] animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Header Controls */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-on-surface-variant border border-[#E2E8F0]">
                  {getCourseTagName(selectedNote.course_id)}
                </span>
                <span className="text-[10px] text-[#94A3B8] ml-2 font-medium">Baru diperbarui</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                      title="Edit catatan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, selectedNote.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Note Content / Editing Form */}
            {isEditing ? (
              <form onSubmit={handleEditNoteSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {editErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{editErrorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                      Judul Catatan
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                      Kaitan Mata Kuliah
                    </label>
                    <CustomSelect
                      value={editCourseId}
                      onChange={(val) => setEditCourseId(val)}
                      options={courseSelectOptions}
                      placeholder="Catatan Umum"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Isi Catatan
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-[#4F46E5] cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-2xl font-bold text-on-surface leading-tight">
                  {selectedNote.title}
                </h3>
                
                {/* Scrollable Note Body */}
                <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap pt-2 font-medium">
                  {selectedNote.content}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
