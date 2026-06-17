/**
 * =============================================================================
 * Planly — NoteInspectorModal.tsx
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

import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, AlertCircle, Paperclip, Download } from 'lucide-react';
import { Note, Course, AttachmentFile } from '../../types';
import CustomSelect from '../ui/CustomSelect';
import type { SelectOption } from '../ui/CustomSelect';
import FormattingToolbar from './FormattingToolbar';
import NoteContentPreview from './NoteContentPreview';

interface NoteInspectorModalProps {
  selectedNote: Note;
  courses: Course[];
  onClose: () => void;
  onEditNote: (noteId: number, updatedNote: Note) => void;
  onDeleteNote: (noteId: number) => void;
}

/**
 * Komponen NoteInspectorModal
 * 
 * Modal popup detail catatan kuliah.
 * Mendukung 2 mode utama:
 * 1. Read Mode: Menampilkan konten catatan hasil parsing markdown, daftar berkas lampiran beserta tombol download berkas.
 * 2. Edit Mode: Mengubah isi catatan, judul, mata kuliah, mengunggah/menghapus lampiran berkas, dilengkapi pratinjau langsung.
 */
export default function NoteInspectorModal({
  selectedNote,
  courses,
  onClose,
  onEditNote,
  onDeleteNote
}: NoteInspectorModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(selectedNote.title);
  const [editContent, setEditContent] = useState(selectedNote.content);
  const [editCourseId, setEditCourseId] = useState(selectedNote.course_id !== null ? String(selectedNote.course_id) : '');
  const [editNoteAttachments, setEditNoteAttachments] = useState<AttachmentFile[]>(selectedNote.attachments || []);
  const [editFormTab, setEditFormTab] = useState<'write' | 'preview'>('write');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Sinkronisasi data ketika catatan yang dipilih berganti
  useEffect(() => {
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setEditCourseId(selectedNote.course_id !== null ? String(selectedNote.course_id) : '');
    setEditNoteAttachments(selectedNote.attachments || []);
    setIsEditing(false);
    setEditFormTab('write');
    setEditErrorMsg('');
  }, [selectedNote]);

  const courseSelectOptions: SelectOption[] = [
    { value: '', label: 'Catatan Umum' },
    ...courses.map(c => ({ value: String(c.id), label: `${c.course_code} - ${c.course_name}` }))
  ];

  // Helper mendapatkan kode matakuliah
  const getCourseTagName = (cid: number | null) => {
    if (cid === null) return 'Umum';
    const c = courses.find((item) => item.id === cid);
    return c ? c.course_code : 'Akademik';
  };

  // Helper upload berkas lampiran
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditErrorMsg('');
    const files = e.target.files;
    if (!files) return;

    const limitBytes = 1.5 * 1024 * 1024; // 1.5MB
    const loadedList: AttachmentFile[] = [...editNoteAttachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > limitBytes) {
        setEditErrorMsg(`Berkas "${file.name}" melebihi batas ukuran 1.5MB.`);
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
        setEditErrorMsg('Gagal membaca berkas.');
        return;
      }
    }

    setEditNoteAttachments(loadedList);
    e.target.value = '';
  };

  // Simpan perubahan pengeditan catatan
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg('');

    if (!editTitle.trim() || !editContent.trim()) {
      setEditErrorMsg('Harap isi judul catatan dan isi materi.');
      return;
    }

    onEditNote(selectedNote.id, {
      ...selectedNote,
      title: editTitle,
      content: editContent,
      course_id: editCourseId === '' ? null : Number(editCourseId),
      attachments: editNoteAttachments
    });

    setIsEditing(false);
  };

  // Menangani klik tombol hapus di dalam modal detail
  const handleDeleteClick = () => {
    onDeleteNote(selectedNote.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Kontrol Modal */}
        <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-850 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F1F5F9] dark:bg-slate-800 text-on-surface-variant border border-[#E2E8F0] dark:border-slate-700/80">
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
                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit catatan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Hapus catatan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-105 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Isi detail catatan / Formulir penyuntingan */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {editErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Judul Catatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                    Isi Catatan <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Switcher Tab */}
                  <div className="flex bg-[#E2E8F0] dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEditFormTab('write')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        editFormTab === 'write'
                          ? 'bg-white dark:bg-slate-750 text-primary shadow-xs'
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
                          ? 'bg-white dark:bg-slate-750 text-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Pratinjau
                    </button>
                  </div>
                </div>

                {/* Toolbar Format */}
                {editFormTab === 'write' && (
                  <FormattingToolbar
                    textareaId="edit-note-textarea"
                    value={editContent}
                    onChange={setEditContent}
                  />
                )}
              </div>

              {editFormTab === 'write' ? (
                <textarea
                  id="edit-note-textarea"
                  required
                  rows={12}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed"
                ></textarea>
              ) : (
                <div className="w-full p-4 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg min-h-[260px] max-h-[450px] overflow-y-auto">
                  <NoteContentPreview
                    note={{
                      ...selectedNote,
                      title: editTitle || 'Edit Catatan',
                      content: editContent || '*Belum ada isi catatan.*',
                      course_id: editCourseId === '' ? null : Number(editCourseId),
                      attachments: editNoteAttachments
                    }}
                    isCard={false}
                  />
                </div>
              )}
            </div>

            {/* Lampiran berkas penyuntingan */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Lampiran Berkas (Maks 1.5MB)
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-center gap-2 w-full h-10 border border-dashed border-[#C7C4D8] dark:border-slate-700 hover:border-primary rounded-lg text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer transition-colors bg-[#F8FAFC] dark:bg-slate-900">
                  <Paperclip className="w-4 h-4" />
                  <span>Pilih Berkas</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                
                {editNoteAttachments.length > 0 && (
                  <div className="space-y-1.5 mt-1">
                    {editNoteAttachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-lg text-[11px] font-sans">
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

            {/* Tombol aksi */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditFormTab('write');
                }}
                className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 dark:bg-slate-800 text-on-surface rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-750 cursor-pointer"
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
          // Mode Baca Detail (Read Mode)
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-2xl font-bold text-on-surface leading-tight">
              {selectedNote.title}
            </h3>
            
            {/* Render isi catatan terstruktur */}
            <div className="pt-2">
              <NoteContentPreview
                note={selectedNote}
                isCard={false}
              />
            </div>

            {/* Lampiran berkas (Unduh) */}
            {selectedNote.attachments && selectedNote.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-left">
                <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider mb-2">
                  Lampiran Berkas ({selectedNote.attachments.length})
                </p>
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
                          className="text-primary hover:text-indigo-755 font-extrabold flex items-center gap-1 cursor-pointer"
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
  );
}
