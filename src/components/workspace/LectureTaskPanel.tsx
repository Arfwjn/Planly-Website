/**
 * =============================================================================
 * Planly — LectureTaskPanel.tsx
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

import React, { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import DatePicker from '../ui/DatePicker';
import { useToast } from '../ui/Toast';

interface LocalTask {
  title: string;
  deadline: string;
}

interface LectureTaskPanelProps {
  activeLectureCourseId: number | null;
  localTasks: LocalTask[];
  onAddTaskSubmit: (title: string, deadline: string) => void;
  onRemoveLocalTask: (index: number) => void;
  onFinishLecture: () => void;
}

/**
 * Komponen LectureTaskPanel
 * 
 * Panel pencatat tugas kuliah baru saat kuliah live.
 * Memfasilitasi pembuatan draf tugas, visualisasi daftar draf, dan trigger simpan massal.
 */
export default function LectureTaskPanel({
  activeLectureCourseId,
  localTasks,
  onAddTaskSubmit,
  onRemoveLocalTask,
  onFinishLecture
}: LectureTaskPanelProps) {
  const toast = useToast();

  const [taskInputTitle, setTaskInputTitle] = useState('');
  
  // Set default deadline 7 hari dari sekarang
  const getDefaultDeadlineDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };
  
  const [taskInputDeadline, setTaskInputDeadline] = useState(getDefaultDeadlineDate());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInputTitle.trim()) {
      toast.warning('Nama tugas tidak boleh kosong!');
      return;
    }
    onAddTaskSubmit(taskInputTitle.trim(), taskInputDeadline);
    setTaskInputTitle('');
    setTaskInputDeadline(getDefaultDeadlineDate());
  };

  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-3.5 text-left">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-card-border dark:border-slate-800 pb-2.5 select-none">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-on-surface">Daftar Tugas Baru dari Kuliah Ini</h3>
        </div>
        <span className="text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Tugas / PR
        </span>
      </div>

      {/* Form Tambah Tugas Draf */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5 items-end sm:items-center">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Contoh: Membuat laporan Bab 3..."
            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant font-medium"
            value={taskInputTitle}
            onChange={(e) => setTaskInputTitle(e.target.value)}
            disabled={!activeLectureCourseId}
          />
        </div>
        
        <div className="w-full sm:w-auto min-w-[160px]">
          <DatePicker
            value={taskInputDeadline}
            onChange={setTaskInputDeadline}
            disabled={!activeLectureCourseId}
            position="up"
            placeholder="Batas Tanggal"
          />
        </div>

        <button
          type="submit"
          disabled={!activeLectureCourseId || !taskInputTitle.trim()}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-on-surface-variant text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 border-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </form>

      {/* List Tugas Baru */}
      {localTasks.length > 0 ? (
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
          {localTasks.map((t, index) => (
            <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="font-bold text-on-surface">{t.title}</span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-850 px-1.5 py-0.5 rounded text-on-surface-variant font-semibold">
                  Deadline: {t.deadline}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveLocalTask(index)}
                className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors bg-transparent border-none"
                title="Hapus tugas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-slate-50/50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs text-on-surface-variant font-medium">
            Belum ada tugas baru yang ditambahkan selama perkuliahan ini.
          </span>
        </div>
      )}

      {/* Baris Selesaikan Kuliah */}
      <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span className="text-[10px] text-on-surface-variant font-semibold">
          Menyelesaikan kuliah akan merekam catatan materi dan semua tugas di atas sekaligus.
        </span>
        
        <button
          type="button"
          onClick={onFinishLecture}
          disabled={!activeLectureCourseId}
          className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-on-surface-variant text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 border-none"
        >
          <span>Selesaikan Perkuliahan</span>
        </button>
      </div>

    </div>
  );
}
