import React, { useState } from 'react';
import { Notebook, Search, Plus, X, MessageSquare, BookOpen, AlertCircle, Trash2, Edit2, Paperclip, Download, CheckSquare, List, ListOrdered, Bold, Italic, Heading1, Heading2 } from 'lucide-react';
import { Note, Course, AttachmentFile } from '../types';
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
  const [noteAttachments, setNoteAttachments] = useState<AttachmentFile[]>([]);
  const [newFormTab, setNewFormTab] = useState<'write' | 'preview'>('write');
  // State ini kita pakai untuk menyimpan pesan kesalahan saat validasi formulir tambah catatan
  const [errorMsg, setErrorMsg] = useState('');

  // Di sini kita melacak catatan yang sedang dipilih/dilihat detailnya, serta status editnya
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State ini kita gunakan untuk menyimpan data input saat menyunting/mengedit catatan yang sedang kita pilih
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCourseId, setEditCourseId] = useState<string>('');
  const [editNoteAttachments, setEditNoteAttachments] = useState<AttachmentFile[]>([]);
  const [editFormTab, setEditFormTab] = useState<'write' | 'preview'>('write');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Build course select options dynamically from courses prop
  const courseSelectOptions: SelectOption[] = [
    { value: '', label: 'Catatan Umum' },
    ...courses.map(c => ({ value: String(c.id), label: `${c.course_code} - ${c.course_name}` }))
  ];

  // Helper to insert markdown format at cursor position
  const insertTextAtCursor = (
    textareaId: string,
    textToInsert: string,
    value: string,
    setValue: (val: string) => void
  ) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!textarea) {
      setValue(value + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end, value.length);

    setValue(before + textToInsert + after);

    // Re-focus and update cursor selection
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  // Helper to toggle a checkpoint inside a note
  const handleToggleNoteTodo = (note: Note, lineIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const lines = note.content.split('\n');
    const line = lines[lineIndex];

    if (line.includes('[ ]')) {
      lines[lineIndex] = line.replace('[ ]', '[x]');
    } else if (line.includes('[x]')) {
      lines[lineIndex] = line.replace('[x]', '[ ]');
    }

    if (note.id === 0) {
      setContent(lines.join('\n'));
      return;
    }

    if (isEditing && selectedNote && selectedNote.id === note.id) {
      setEditContent(lines.join('\n'));
      return;
    }

    onEditNote(note.id, {
      ...note,
      content: lines.join('\n')
    });

    // If selectedNote is currently active, sync it as well
    if (selectedNote && selectedNote.id === note.id) {
      setSelectedNote({
        ...selectedNote,
        content: lines.join('\n')
      });
    }
  };

  // Structured Note Content Render Parser
  const renderNoteContentPreview = (note: Note, isCard = false) => {
    const lines = note.content.split('\n');
    // Limit to 6 lines on card to prevent overflow
    const displayLines = isCard ? lines.slice(0, 6) : lines;

    return (
      <div className="space-y-1 text-xs text-on-surface-variant font-medium text-left">
        {displayLines.map((line, idx) => {
          const isChecklist = line.includes('[ ]') || line.includes('[x]');
          if (isChecklist) {
            const isChecked = line.includes('[x]');
            const label = line
              .replace(/\[\s*\]/, '')
              .replace(/\[\s*x\s*\]/i, '')
              .replace(/^-?\s*/, '')
              .trim();
            return (
              <div
                key={idx}
                className="flex items-start gap-2 py-0.5 cursor-pointer select-none group/todo"
                onClick={(e) => handleToggleNoteTodo(note, idx, e)}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // Controlled by onClick container
                  className="w-3.5 h-3.5 mt-0.5 rounded border-[#C7C4D8] text-primary focus:ring-primary cursor-pointer accent-primary flex-shrink-0"
                />
                <span className={`flex-1 break-words leading-tight transition-colors ${isChecked ? 'line-through text-[#94A3B8]' : 'text-on-surface group-hover/todo:text-primary'}`}>
                  {label || <span className="text-slate-350 italic">Checkpoint kosong</span>}
                </span>
              </div>
            );
          }

          // Bullet Point
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const label = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1">
                <span className="text-primary mt-1 text-[8px] flex-shrink-0">&bull;</span>
                <span className="flex-1 break-words leading-tight text-on-surface-variant">{label}</span>
              </div>
            );
          }

          // Numbered Point
          const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1">
                <span className="text-primary font-bold flex-shrink-0">{numMatch[1]}.</span>
                <span className="flex-1 break-words leading-tight text-on-surface-variant">{numMatch[2]}</span>
              </div>
            );
          }

          // Headers
          if (line.trim().startsWith('### ')) {
            return (
              <h4 key={idx} className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider pt-2 pb-0.5 border-b border-slate-100 dark:border-slate-800">
                {line.trim().substring(4)}
              </h4>
            );
          }
          if (line.trim().startsWith('## ')) {
            return (
              <h3 key={idx} className="text-xs font-black text-on-surface pt-2 pb-0.5">
                {line.trim().substring(3)}
              </h3>
            );
          }
          if (line.trim().startsWith('# ')) {
            return (
              <h2 key={idx} className="text-sm font-black text-on-surface pt-3 pb-0.5">
                {line.trim().substring(2)}
              </h2>
            );
          }

          // Empty Line
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Regular Paragraph
          return (
            <p key={idx} className="leading-relaxed text-on-surface-variant break-words py-0.5 pl-0.5">
              {line}
            </p>
          );
        })}
        {isCard && lines.length > 6 && (
          <p className="text-[10px] text-[#94A3B8] italic font-semibold pt-1 pl-1">
            + {lines.length - 6} baris lagi...
          </p>
        )}
      </div>
    );
  };

  const handleApplyTemplate = (type: 'kuliah' | 'kelompok' | 'todo') => {
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (type === 'kuliah') {
      setTitle(`Catatan Kuliah: [Topik]`);
      setContent(`# Catatan Kuliah: [Nama Topik]\nTanggal: ${today}\n\n## Agenda & Target Belajar\n- [ ] Memahami konsep dasar [Topik]\n- [ ] Mengikuti penjelasan dosen & studi kasus\n- [ ] Mencoba contoh latihan secara mandiri\n\n## Ringkasan Materi Kuliah\nTulis poin-poin penjelasan penting di sini...\n\n## Istilah & Formula Penting\n- **Istilah 1**: Deskripsi singkat.\n- **Formula/Poin penting**: Catatan detail.\n\n## Kesimpulan & Tindak Lanjut\n- [ ] Mengerjakan latihan tugas terkait\n- [ ] Membaca kembali catatan sebelum kuis`);
    } else if (type === 'kelompok') {
      setTitle(`Tugas Kelompok: [Nama Proyek]`);
      setContent(`# Proyek Kelompok: [Nama Tugas]\nMata Kuliah: [Nama Matakuliah]\n\n## Pembagian Peran & Tugas\n- [ ] **Anggota 1**: Mengerjakan Desain Wireframe\n- [ ] **Anggota 2**: Mengerjakan Skema Database & API\n- [ ] **Anggota 3**: Menyusun Dokumen Laporan Akhir\n\n## Rencana Timeline & Progres\n- [ ] Tahap 1: Analisis Kebutuhan (Selesai)\n- [ ] Tahap 2: Desain & Implementasi (Sedang Berjalan)\n- [ ] Tahap 3: Pengujian & Finalisasi Laporan\n\n## Catatan Diskusi & Ide\nTulis hasil rapat kelompok di sini...`);
    } else if (type === 'todo') {
      setTitle(`To-Do List Harian: ${today.split(',')[1]?.trim() || today}`);
      setContent(`# Rencana Belajar Harian\nHari/Tanggal: ${today}\n\n## Prioritas Utama (Wajib Selesai)\n- [ ] Selesaikan praktikum [Nama Matakuliah]\n- [ ] Review materi kuliah kemarin selama 15 menit\n\n## Kegiatan Lainnya (Fokus Mandiri)\n- [ ] Olahraga ringan pagi hari\n- [ ] Membaca buku non-akademik (10 halaman)\n\n## Evaluasi Akhir Hari\nTulis refleksi pencapaian belajar hari ini di sini...`);
    }
  };

  // Fungsi ini berguna untuk menangani pemilihan salah satu catatan agar kita bisa melihat detailnya.
  // Di sini, kita memuat data catatan tersebut ke dalam state penyuntingan dan menutup mode edit terlebih dahulu.
  const handleInspectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCourseId(note.course_id !== null ? String(note.course_id) : '');
    setEditNoteAttachments(note.attachments || []);
    setEditFormTab('write');
    setEditErrorMsg('');
  };

  // Helper untuk memproses unggah file ke Base64
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    currentAttachments: AttachmentFile[],
    setAttachments: React.Dispatch<React.SetStateAction<AttachmentFile[]>>,
    setError: (msg: string) => void
  ) => {
    setError('');
    const files = e.target.files;
    if (!files) return;

    const limitBytes = 1.5 * 1024 * 1024; // 1.5MB
    const loadedList: AttachmentFile[] = [...currentAttachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > limitBytes) {
        setError(`Berkas "${file.name}" melebihi batas ukuran 1.5MB.`);
        return;
      }

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });

        loadedList.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data_url: dataUrl
        });
      } catch (err) {
        setError('Gagal membaca berkas.');
        return;
      }
    }

    setAttachments(loadedList);
    e.target.value = '';
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
      user_id: 1,
      attachments: noteAttachments
    });

    setTitle('');
    setContent('');
    setCourseId('');
    setNoteAttachments([]);
    setNewFormTab('write');
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
      user_id: 1,
      attachments: editNoteAttachments
    });

    setSelectedNote(null);
    setIsEditing(false);
    setEditFormTab('write');
    setEditNoteAttachments([]);
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
          <div className="flex items-center justify-between border-b border-primary/10 pb-3">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Buat Catatan Kuliah Baru</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-white border border-[#E2E8F0] cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center bg-white/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-primary/10">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mr-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
              </svg>
              Templat Cepat:
            </span>
            <button
              type="button"
              onClick={() => handleApplyTemplate('kuliah')}
              className="px-3 py-1.5 bg-white dark:bg-slate-850 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-on-surface"
            >
              <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span>Kuliah</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('kelompok')}
              className="px-3 py-1.5 bg-white dark:bg-slate-850 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-on-surface"
            >
              <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Kelompok</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('todo')}
              className="px-3 py-1.5 bg-white dark:bg-slate-850 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-on-surface"
            >
              <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>To-Do List</span>
            </button>
          </div>

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-4">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                    Isi / Catatan Materi
                  </label>
                  {/* Tab Switcher */}
                  <div className="flex bg-[#E2E8F0] dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setNewFormTab('write')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        newFormTab === 'write'
                          ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Tulis
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewFormTab('preview')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        newFormTab === 'preview'
                          ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Pratinjau
                    </button>
                  </div>
                </div>

                {/* Formatting Toolbar */}
                {newFormTab === 'write' && (
                  <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/60 px-1.5 py-0.5 rounded-xl shadow-xs self-start sm:self-auto">
                    <button
                      type="button"
                      title="Tambah Checkpoint (Todo)"
                      onClick={() => insertTextAtCursor('new-note-textarea', '\n- [ ] ', content, setContent)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Daftar Bullet"
                      onClick={() => insertTextAtCursor('new-note-textarea', '\n- ', content, setContent)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Daftar Angka"
                      onClick={() => insertTextAtCursor('new-note-textarea', '\n1. ', content, setContent)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                    <button
                      type="button"
                      title="Teks Tebal"
                      onClick={() => insertTextAtCursor('new-note-textarea', '**Tebal**', content, setContent)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Teks Miring"
                      onClick={() => insertTextAtCursor('new-note-textarea', '*Miring*', content, setContent)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                    <button
                      type="button"
                      title="Heading 1"
                      onClick={() => insertTextAtCursor('new-note-textarea', '\n# ', content, setContent)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Heading 2"
                      onClick={() => insertTextAtCursor('new-note-textarea', '\n## ', content, setContent)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {newFormTab === 'write' ? (
                <textarea
                  id="new-note-textarea"
                  required
                  rows={10}
                  placeholder="Mulai tulis catatan Anda di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-white border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
                ></textarea>
              ) : (
                <div className="w-full p-4 bg-white border border-[#E2E8F0] rounded-lg min-h-[220px] max-h-[400px] overflow-y-auto">
                  {renderNoteContentPreview({
                    id: 0,
                    title: title || 'Catatan Baru',
                    content: content || '*Belum ada isi catatan. Mulai ketik di tab Tulis.*',
                    course_id: courseId === '' ? null : Number(courseId),
                    user_id: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    attachments: noteAttachments
                  }, false)}
                </div>
              )}
            </div>

            {/* Lampiran Berkas Catatan */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Lampiran Berkas (Maks 1.5MB)
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-center gap-2 w-full h-10 border border-dashed border-[#C7C4D8] hover:border-primary rounded-lg text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer transition-colors bg-white">
                  <Paperclip className="w-4 h-4" />
                  <span>Pilih Berkas</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, noteAttachments, setNoteAttachments, setErrorMsg)}
                  />
                </label>
                {noteAttachments.length > 0 && (
                  <div className="space-y-1.5 mt-1">
                    {noteAttachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border border-[#E2E8F0] rounded-lg text-[11px] font-sans">
                        <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
                          <Paperclip className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-semibold truncate text-on-surface">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          <button
                            type="button"
                            onClick={() => setNoteAttachments(noteAttachments.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 font-bold px-1 py-0.5 rounded cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewFormTab('write');
                }}
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

                {/* Tampilan Konten Catatan Terstruktur */}
                {renderNoteContentPreview(note, true)}

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
                  {note.attachments && note.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-[9px] bg-[#F1F5F9] dark:bg-slate-805 text-on-surface-variant px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-slate-700/80">
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
                      onClick={() => {
                        setIsEditing(true);
                        setEditFormTab('write');
                      }}
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-4">
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                        Isi Catatan
                      </label>
                      {/* Tab Switcher */}
                      <div className="flex bg-[#E2E8F0] dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setEditFormTab('write')}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            editFormTab === 'write'
                              ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Tulis
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditFormTab('preview')}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            editFormTab === 'preview'
                              ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Pratinjau
                        </button>
                      </div>
                    </div>

                    {/* Formatting Toolbar */}
                    {editFormTab === 'write' && (
                      <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/60 px-1.5 py-0.5 rounded-xl shadow-xs self-start sm:self-auto">
                        <button
                          type="button"
                          title="Tambah Checkpoint (Todo)"
                          onClick={() => insertTextAtCursor('edit-note-textarea', '\n- [ ] ', editContent, setEditContent)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Daftar Bullet"
                          onClick={() => insertTextAtCursor('edit-note-textarea', '\n- ', editContent, setEditContent)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Daftar Angka"
                          onClick={() => insertTextAtCursor('edit-note-textarea', '\n1. ', editContent, setEditContent)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                        <button
                          type="button"
                          title="Teks Tebal"
                          onClick={() => insertTextAtCursor('edit-note-textarea', '**Tebal**', editContent, setEditContent)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Teks Miring"
                          onClick={() => insertTextAtCursor('edit-note-textarea', '*Miring*', editContent, setEditContent)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                        <button
                          type="button"
                          title="Heading 1"
                          onClick={() => insertTextAtCursor('edit-note-textarea', '\n# ', editContent, setEditContent)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <Heading1 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Heading 2"
                          onClick={() => insertTextAtCursor('edit-note-textarea', '\n## ', editContent, setEditContent)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editFormTab === 'write' ? (
                    <textarea
                      id="edit-note-textarea"
                      required
                      rows={12}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
                    ></textarea>
                  ) : (
                    <div className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg min-h-[260px] max-h-[450px] overflow-y-auto">
                      {renderNoteContentPreview({
                        ...selectedNote!,
                        title: editTitle || 'Edit Catatan',
                        content: editContent || '*Belum ada isi catatan.*',
                        course_id: editCourseId === '' ? null : Number(editCourseId),
                        attachments: editNoteAttachments
                      }, false)}
                    </div>
                  )}
                </div>

                {/* Lampiran Berkas Catatan Edit */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Lampiran Berkas (Maks 1.5MB)
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 w-full h-10 border border-dashed border-[#C7C4D8] hover:border-primary rounded-lg text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer transition-colors bg-[#F8FAFC]">
                      <Paperclip className="w-4 h-4" />
                      <span>Pilih Berkas</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, editNoteAttachments, setEditNoteAttachments, setEditErrorMsg)}
                      />
                    </label>
                    {editNoteAttachments.length > 0 && (
                      <div className="space-y-1.5 mt-1">
                        {editNoteAttachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-855 rounded-lg text-[11px] font-sans">
                            <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
                              <Paperclip className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="font-semibold truncate text-on-surface">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                              <button
                                type="button"
                                onClick={() => setEditNoteAttachments(editNoteAttachments.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-bold px-1 py-0.5 rounded cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditFormTab('write');
                    }}
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
                
                {/* Scrollable Note Body (Structured Render) */}
                <div className="pt-2">
                  {renderNoteContentPreview(selectedNote, false)}
                </div>

                {/* Lampiran Berkas Detail Catatan */}
                {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2 text-left">
                    <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider mb-2">Lampiran Berkas ({selectedNote.attachments.length})</p>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedNote.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-sans hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate pr-2 flex-1">
                            <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-bold truncate text-on-surface">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            <button
                              type="button"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.data_url;
                                link.download = file.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="text-primary hover:text-indigo-700 font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
