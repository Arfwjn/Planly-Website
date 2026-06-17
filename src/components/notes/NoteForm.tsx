/**
 * =============================================================================
 * Planly — NoteForm.tsx
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

import React, { useState } from 'react';
import { X, Paperclip, AlertCircle } from 'lucide-react';
import { Note, Course, AttachmentFile } from '../../types';
import CustomSelect from '../ui/CustomSelect';
import type { SelectOption } from '../ui/CustomSelect';
import FormattingToolbar from './FormattingToolbar';
import NoteContentPreview from './NoteContentPreview';

interface NoteFormProps {
  courses: Course[];
  onAddNote: (note: Omit<Note, 'id'>) => void;
  onClose: () => void;
}

/**
 * Komponen NoteForm
 * 
 * Form pembuatan catatan kuliah baru.
 * Mendukung:
 * - Templat Cepat (Kuliah, Kelompok, To-Do) biar gak repot ketik manual dari awal.
 * - Kaitkan dengan mata kuliah (dropdown CustomSelect).
 * - Live Preview (tab Tulis dan Pratinjau).
 * - Bilah format Markdown (FormattingToolbar) yang memanipulasi kursor input textarea.
 * - Berkas lampiran berkas maksimal 1.5MB dengan Base64 converter.
 */
export default function NoteForm({
  courses,
  onAddNote,
  onClose
}: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState<string>('');
  const [noteAttachments, setNoteAttachments] = useState<AttachmentFile[]>([]);
  const [newFormTab, setNewFormTab] = useState<'write' | 'preview'>('write');
  const [errorMsg, setErrorMsg] = useState('');

  // Buat pilihan matakuliah dinamis dari props courses
  const courseSelectOptions: SelectOption[] = [
    { value: '', label: 'Catatan Umum' },
    ...courses.map(c => ({ value: String(c.id), label: `${c.course_code} - ${c.course_name}` }))
  ];

  // Handler templat cepat
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

  // Handler upload file & konversi base64
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const files = e.target.files;
    if (!files) return;

    const limitBytes = 1.5 * 1024 * 1024; // 1.5MB batas ukuran
    const loadedList: AttachmentFile[] = [...noteAttachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > limitBytes) {
        setErrorMsg(`Berkas "${file.name}" melebihi batas ukuran 1.5MB.`);
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
        setErrorMsg('Gagal membaca berkas.');
        return;
      }
    }

    setNoteAttachments(loadedList);
    e.target.value = '';
  };

  // Simpan catatan baru
  const handleSubmit = (e: React.FormEvent) => {
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

    // Reset state & tutup form
    setTitle('');
    setContent('');
    setCourseId('');
    setNoteAttachments([]);
    setNewFormTab('write');
    onClose();
  };

  return (
    <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm relative animate-fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-primary/10 pb-3">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Buat Catatan Kuliah Baru</h3>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-full bg-white border border-[#E2E8F0] dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Tombol templat cepat */}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Judul Catatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Kuliah Psikologi Kognitif 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                Isi / Catatan Materi <span className="text-red-500">*</span>
              </label>
              
              {/* Switcher Tab */}
              <div className="flex bg-[#E2E8F0] dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setNewFormTab('write')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    newFormTab === 'write'
                      ? 'bg-white dark:bg-slate-750 text-primary shadow-xs'
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
                      ? 'bg-white dark:bg-slate-750 text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Pratinjau
                </button>
              </div>
            </div>

            {/* Toolbar format (Hanya muncul saat tab Tulis aktif) */}
            {newFormTab === 'write' && (
              <FormattingToolbar
                textareaId="new-note-textarea"
                value={content}
                onChange={setContent}
              />
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
              className="w-full p-4 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
            ></textarea>
          ) : (
            <div className="w-full p-4 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg min-h-[220px] max-h-[400px] overflow-y-auto">
              <NoteContentPreview
                note={{
                  id: 0,
                  title: title || 'Catatan Baru',
                  content: content || '*Belum ada isi catatan. Mulai ketik di tab Tulis.*',
                  course_id: courseId === '' ? null : Number(courseId),
                  user_id: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  attachments: noteAttachments
                }}
                isCard={false}
              />
            </div>
          )}
        </div>

        {/* Lampiran berkas */}
        <div>
          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
            Lampiran Berkas (Maks 1.5MB)
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-center gap-2 w-full h-10 border border-dashed border-[#C7C4D8] dark:border-slate-700 hover:border-primary rounded-lg text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer transition-colors bg-white dark:bg-slate-900">
              <Paperclip className="w-4 h-4" />
              <span>Pilih Berkas</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            
            {noteAttachments.length > 0 && (
              <div className="space-y-1.5 mt-1">
                {noteAttachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[11px] font-sans">
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

        {/* Tombol aksi */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              setNewFormTab('write');
            }}
            className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-on-surface rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer"
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
  );
}
