/**
 * =============================================================================
 * Planly — TaskDetailModal.tsx
 * 
 * Kegunaan:
 * Komponen manajemen tugas kuliah akademik (daftar tugas tertunggak & selesai, prioritas, & unduh berkas lampiran).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan TasksView.tsx (orkestrator) dan berkomunikasi dengan backend via tasksService.
 * 
 * Aliran Data / State:
 * - Menampilkan daftar tugas terstruktur, upload lampiran Base64, dan mengubah status pengerjaan tugas.
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, AlertCircle, Paperclip, Download, GraduationCap, Clock } from 'lucide-react';
import { Course, Task, AttachmentFile } from '../../types';
import CustomSelect from '../ui/CustomSelect';
import type { SelectOption } from '../ui/CustomSelect';
import DatePicker from '../ui/DatePicker';
import TimePicker from '../ui/TimePicker';
import { getCourseName, formatRelDeadline } from './taskHelpers';

interface TaskDetailModalProps {
  selectedTask: Task;
  courses: Course[];
  onClose: () => void;
  onEditTask: (taskId: number, updatedTask: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onToggleTaskState: (taskId: number) => void;
}

/**
 * Komponen TaskDetailModal
 * 
 * Panel slide-over atau modal inspektor dari kanan untuk melihat rincian tugas akademik.
 * Mendukung 2 mode utama:
 * 1. Read Mode: Melihat info tugas (tenggat waktu relatif, prioritas, file lampiran, deskripsi).
 * 2. Edit Mode: Memodifikasi metadata tugas secara lengkap (penanggalan, judul, priority switch, dll).
 */
export default function TaskDetailModal({
  selectedTask,
  courses,
  onClose,
  onEditTask,
  onDeleteTask,
  onToggleTaskState
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(selectedTask.task_title);
  const [editCourseId, setEditCourseId] = useState<number | null>(selectedTask.course_id);
  const [editDeadlineDate, setEditDeadlineDate] = useState(selectedTask.deadline.split(' ')[0]);
  const [editDeadlineTime, setEditDeadlineTime] = useState(selectedTask.deadline.split(' ')[1]?.slice(0, 5) || '23:59');
  const [editIsPriority, setEditIsPriority] = useState(selectedTask.is_priority);
  const [editIsFinished, setEditIsFinished] = useState(selectedTask.is_finished);
  const [editDescription, setEditDescription] = useState(selectedTask.description || '');
  const [editAttachments, setEditAttachments] = useState<AttachmentFile[]>(selectedTask.attachments || []);
  const [editValidationError, setEditValidationError] = useState('');

  // Sinkronisasi data ketika tugas yang dipilih berganti
  useEffect(() => {
    setEditTitle(selectedTask.task_title);
    setEditCourseId(selectedTask.course_id);
    setEditDeadlineDate(selectedTask.deadline.split(' ')[0]);
    setEditDeadlineTime(selectedTask.deadline.split(' ')[1]?.slice(0, 5) || '23:59');
    setEditIsPriority(selectedTask.is_priority);
    setEditIsFinished(selectedTask.is_finished);
    setEditDescription(selectedTask.description || '');
    setEditAttachments(selectedTask.attachments || []);
    setIsEditing(false);
    setEditValidationError('');
  }, [selectedTask]);

  const courseOptions: SelectOption[] = [
    { value: '', label: 'Tugas Umum / Pribadi' },
    ...courses.map((c) => ({
      value: String(c.id),
      label: `${c.course_code} - ${c.course_name}`,
    })),
  ];

  // Helper upload berkas
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValidationError('');
    const files = e.target.files;
    if (!files) return;

    const limitBytes = 1.5 * 1024 * 1024; // 1.5MB
    const loadedList: AttachmentFile[] = [...editAttachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > limitBytes) {
        setEditValidationError(`Berkas "${file.name}" melebihi batas ukuran 1.5MB.`);
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
        setEditValidationError('Gagal membaca berkas.');
        return;
      }
    }

    setEditAttachments(loadedList);
    e.target.value = '';
  };

  // Simpan perubahan edit tugas
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditValidationError('');

    if (!editTitle.trim()) {
      setEditValidationError('Judul tugas tidak boleh kosong.');
      return;
    }
    if (!editDeadlineDate) {
      setEditValidationError('Tanggal batas waktu wajib diisi.');
      return;
    }

    onEditTask(selectedTask.id, {
      ...selectedTask,
      task_title: editTitle,
      description: editDescription,
      deadline: `${editDeadlineDate} ${editDeadlineTime}:00`,
      is_finished: editIsFinished,
      is_priority: editIsPriority,
      course_id: editCourseId,
      attachments: editAttachments
    });

    setIsEditing(false);
  };

  // Menghapus tugas
  const handleDeleteClick = () => {
    onDeleteTask(selectedTask.id);
    onClose();
  };

  // Toggle status tugas selesai / belum selesai
  const handleToggleStatus = () => {
    onToggleTaskState(selectedTask.id);
  };

  return (
    <div
      className="fixed inset-0 bg-[#1b1b24]/30 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0] dark:border-slate-800 transform transition-transform duration-300 animate-slide-over"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-850">
          <h2 className="text-lg font-bold text-on-surface">
            {isEditing ? 'Edit Tugas' : 'Detail Tugas'}
          </h2>
          <div className="flex items-center gap-1.5">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-[#F1F5F9] dark:hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                  title="Ubah metadata tugas"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Hapus tugas secara permanen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:bg-[#F1F5F9] dark:hover:bg-slate-850 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Konten Utama */}
        {isEditing ? (
          /* Mode Edit */
          <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {editValidationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{editValidationError}</span>
              </div>
            )}

            {/* Edit Judul */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Nama / Judul Tugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            {/* Edit Mata Kuliah */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Mata Kuliah Terkait
              </label>
              <CustomSelect
                value={editCourseId === null ? '' : String(editCourseId)}
                onChange={(val) => setEditCourseId(val === '' ? null : Number(val))}
                options={courseOptions}
              />
            </div>

            {/* Edit Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Tanggal Batas Waktu <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={editDeadlineDate}
                  onChange={setEditDeadlineDate}
                  required
                  position="down"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Waktu <span className="text-red-500">*</span>
                </label>
                <TimePicker
                  value={editDeadlineTime}
                  onChange={setEditDeadlineTime}
                  required
                />
              </div>
            </div>

            {/* Edit Prioritas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Tugas Prioritas Tinggi
                </label>
                <button
                  type="button"
                  onClick={() => setEditIsPriority(!editIsPriority)}
                  className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${
                    editIsPriority ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    editIsPriority ? 'left-5' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Edit Status */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Status Tugas
              </label>
              <div className="flex bg-[#F1F5F9] dark:bg-slate-800 p-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700 gap-1">
                <button
                  type="button"
                  onClick={() => setEditIsFinished(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    !editIsFinished ? 'bg-white dark:bg-slate-700 text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Belum Selesai
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsFinished(true)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    editIsFinished ? 'bg-white dark:bg-slate-700 text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Edit Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Catatan / Deskripsi
              </label>
              <textarea
                placeholder="Detail tentang tugas..."
                rows={6}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-medium"
              ></textarea>
            </div>

            {/* Edit Lampiran */}
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
                {editAttachments.length > 0 && (
                  <div className="space-y-1.5 mt-1">
                    {editAttachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-lg text-[11px] font-sans">
                        <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
                          <Paperclip className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-semibold truncate text-on-surface">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          <button
                            type="button"
                            onClick={() => setEditAttachments(editAttachments.filter((_, i) => i !== idx))}
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

            {/* Aksi Form */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:bg-slate-800 text-on-surface cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        ) : (
          /* Mode Baca */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                selectedTask.is_finished 
                  ? 'bg-green-50 text-green-600 border border-green-100'
                  : 'bg-primary-container text-primary border border-primary/20'
              }`}>
                {selectedTask.is_finished ? 'Selesai' : 'Belum Selesai'}
              </span>
              {selectedTask.is_priority && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                  Prioritas Tinggi
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-on-surface leading-tight">
                {selectedTask.task_title}
              </h3>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-on-surface-variant" />
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Mata Kuliah / Subjek</p>
                  <p className="font-semibold text-on-surface mt-0.5">{getCourseName(selectedTask.course_id, courses)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-on-surface-variant" />
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Batas Waktu</p>
                  <p className="font-semibold text-on-surface mt-0.5">
                    {formatRelDeadline(selectedTask.deadline.split(' ')[0], selectedTask.deadline.split(' ')[1]?.slice(0, 5) || '23:59', selectedTask.is_finished)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider mb-2">Deskripsi</p>
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-xs text-on-surface leading-relaxed min-h-24 whitespace-pre-wrap">
                {selectedTask.description || 'Tidak ada catatan tambahan yang diberikan untuk tugas ini.'}
              </div>
            </div>

            {/* Lampiran berkas */}
            {selectedTask.attachments && selectedTask.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider mb-2">Lampiran Berkas ({selectedTask.attachments.length})</p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedTask.attachments.map((file, idx) => (
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

            {/* Tombol toggle status */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleToggleStatus}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                  selectedTask.is_finished 
                    ? 'border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant'
                    : 'bg-primary hover:bg-[#4F46E5] text-white'
                }`}
              >
                {selectedTask.is_finished ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
