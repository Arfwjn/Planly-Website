/**
 * =============================================================================
 * Planly — TaskFormDrawer.tsx
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

import React, { useState } from 'react';
import { X, AlertCircle, Paperclip } from 'lucide-react';
import { Course, Task, AttachmentFile } from '../../types';
import CustomSelect from '../ui/CustomSelect';
import type { SelectOption } from '../ui/CustomSelect';
import DatePicker from '../ui/DatePicker';
import TimePicker from '../ui/TimePicker';

interface TaskFormDrawerProps {
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

/**
 * Komponen TaskFormDrawer
 * 
 * Panel slide-over dari kanan layar untuk membuat tugas baru.
 * Menyediakan input:
 * - Judul/Nama Tugas.
 * - Mata kuliah terkait (CustomSelect).
 * - Tanggal batas waktu (DatePicker) & jam batas waktu (TimePicker).
 * - Toggle switch prioritas.
 * - Tab switcher status awal.
 * - Area deskripsi / catatan tambahan.
 * - Lampiran file base64 dengan pembatasan 1.5MB.
 */
export default function TaskFormDrawer({
  courses,
  isOpen,
  onClose,
  onAddTask
}: TaskFormDrawerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState<number | null>(null);
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [newDeadlineTime, setNewDeadlineTime] = useState('23:59');
  const [newIsPriority, setNewIsPriority] = useState(false);
  const [newIsFinished, setNewIsFinished] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newAttachments, setNewAttachments] = useState<AttachmentFile[]>([]);
  const [validationError, setValidationError] = useState('');

  const courseOptions: SelectOption[] = [
    { value: '', label: 'Tugas Umum / Pribadi' },
    ...courses.map((c) => ({
      value: String(c.id),
      label: `${c.course_code} - ${c.course_name}`,
    })),
  ];

  // Helper upload file & konversi base64
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError('');
    const files = e.target.files;
    if (!files) return;

    const limitBytes = 1.5 * 1024 * 1024; // 1.5MB
    const loadedList: AttachmentFile[] = [...newAttachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > limitBytes) {
        setValidationError(`Berkas "${file.name}" melebihi batas ukuran 1.5MB.`);
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
        setValidationError('Gagal membaca berkas.');
        return;
      }
    }

    setNewAttachments(loadedList);
    e.target.value = '';
  };

  // Submit tugas baru
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!newTitle.trim()) {
      setValidationError('Harap masukkan judul tugas.');
      return;
    }
    if (!newDeadlineDate) {
      setValidationError('Harap tentukan tanggal batas waktu (deadline).');
      return;
    }

    onAddTask({
      task_title: newTitle,
      description: newDescription,
      deadline: `${newDeadlineDate} ${newDeadlineTime}:00`,
      is_finished: newIsFinished,
      is_priority: newIsPriority,
      course_id: newCourseId,
      user_id: 0,
      attachments: newAttachments
    });

    // Reset seluruh state
    setNewTitle('');
    setNewCourseId(null);
    setNewDeadlineDate('');
    setNewDeadlineTime('23:59');
    setNewIsPriority(false);
    setNewIsFinished(false);
    setNewDescription('');
    setNewAttachments([]);
    
    onClose();
  };

  if (!isOpen) return null;

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
          <h2 className="text-lg font-bold text-on-surface">Tugas Baru</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-[#F1F5F9] dark:hover:bg-slate-800 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Judul tugas */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Nama / Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Apa yang perlu dikerjakan?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
            />
          </div>

          {/* Pemetaan Mata Kuliah */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Mata Kuliah Terkait
            </label>
            <CustomSelect
              value={newCourseId === null ? '' : String(newCourseId)}
              onChange={(val) => setNewCourseId(val === '' ? null : Number(val))}
              options={courseOptions}
              position="down"
            />
          </div>

          {/* Batas waktu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Tanggal Batas Waktu <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={newDeadlineDate}
                onChange={setNewDeadlineDate}
                required
                position="down"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Waktu <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={newDeadlineTime}
                onChange={setNewDeadlineTime}
                required
              />
            </div>
          </div>

          {/* Toggle Prioritas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Tugas Prioritas Tinggi
              </label>
              <button
                type="button"
                onClick={() => setNewIsPriority(!newIsPriority)}
                className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${
                  newIsPriority ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  newIsPriority ? 'left-5' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Status Awal */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Status Awal
            </label>
            <div className="flex bg-[#F1F5F9] dark:bg-slate-800 p-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700 gap-1">
              <button
                type="button"
                onClick={() => setNewIsFinished(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  !newIsFinished ? 'bg-white dark:bg-slate-700 text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Belum Selesai
              </button>
              <button
                type="button"
                onClick={() => setNewIsFinished(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  newIsFinished ? 'bg-white dark:bg-slate-700 text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Catatan / Deskripsi (Opsional)
            </label>
            <textarea
              placeholder="Tambahkan detail, daftar tugas, atau sumber daya..."
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-medium"
            ></textarea>
          </div>

          {/* Upload lampiran */}
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
              
              {newAttachments.length > 0 && (
                <div className="space-y-1.5 mt-1">
                  {newAttachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-lg text-[11px] font-sans">
                      <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
                        <Paperclip className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="font-semibold truncate text-on-surface">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={() => setNewAttachments(newAttachments.filter((_, i) => i !== idx))}
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
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex justify-end gap-3 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-xs font-semibold text-on-surface dark:bg-slate-800 hover:bg-[#F1F5F9] dark:hover:bg-slate-750 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
            >
              Buat Tugas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
