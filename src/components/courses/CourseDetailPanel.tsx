/**
 * =============================================================================
 * Planly — CourseDetailPanel.tsx
 * 
 * Kegunaan:
 * Komponen antarmuka modul Mata Kuliah terdaftar (daftar grid kelas, ruangan, dosen, absensi, & detail materi).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan CoursesView.tsx (orkestrator) dan berkomunikasi dengan server via coursesService.
 * 
 * Aliran Data / State:
 * - Mengambil data detail perkuliahan user aktif, menghitung kelas terdekat hari berjalan, dan mendaftarkan kelas baru.
 * =============================================================================
 */


import { Calendar, Clock, MapPin, User, GraduationCap, X, Edit2, Trash2, CheckSquare } from 'lucide-react';
import { Course, Task } from '../../types';
import { dayNameIndonesian, getNextClassDate } from './courseHelpers';

interface CourseDetailPanelProps {
  selectedCourse: Course;
  tasks: Task[];
  onToggleTaskState?: (taskId: number) => void;
  onClose: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

/**
 * Komponen CourseDetailPanel
 * 
 * Panel atas yang menampilkan detail lengkap dari salah satu mata kuliah yang kita klik.
 * Menampilkan rincian SKS, ruangan, dosen, jadwal mendatang yang terhitung otomatis,
 * serta checklist interaktif dari tugas-tugas kuliah yang berkaitan.
 */
export default function CourseDetailPanel({
  selectedCourse,
  tasks,
  onToggleTaskState,
  onClose,
  onEditClick,
  onDeleteClick
}: CourseDetailPanelProps) {
  return (
    <div className="p-6 bg-primary/[0.02] dark:bg-slate-900/40 border-2 border-primary/20 dark:border-slate-800 rounded-2xl relative shadow-xs animate-fade-in">
      
      {/* Tombol Aksi: Edit, Hapus, dan Tutup Panel */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={onEditClick}
          className="text-on-surface-variant hover:text-primary p-2 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F1F5F9] dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-3xs"
          title="Edit informasi mata kuliah"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDeleteClick}
          className="text-red-500 hover:text-red-700 p-2 bg-white dark:bg-slate-800 border border-red-105 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-3xs"
          title="Batalkan pendaftaran mata kuliah"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg cursor-pointer bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center shadow-3xs hover:bg-[#F1F5F9] dark:hover:bg-slate-750"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Baris Kode & Status */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-extrabold px-3 py-1 rounded text-white shadow-xs"
          style={{ backgroundColor: selectedCourse.color_hex }}
        >
          {selectedCourse.course_code}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-indigo-400 border border-primary/15">
          Mata Kuliah Aktif
        </span>
      </div>

      <h3 className="text-xl font-bold text-on-surface mt-3">{selectedCourse.course_name}</h3>
      
      {/* Parameter Grid Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs font-semibold text-on-surface-variant pb-4 border-b border-dashed border-[#C7C4D8] dark:border-slate-750">
        <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 shadow-2xs">
          <User className="w-3.5 h-3.5 text-primary" />
          <span className="truncate">{selectedCourse.lecturer_name}</span>
        </span>
        <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>
            {dayNameIndonesian[selectedCourse.day_of_week] || selectedCourse.day_of_week}, {selectedCourse.start_time} - {selectedCourse.end_time}
          </span>
        </span>
        <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>{selectedCourse.room}</span>
        </span>
        <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-primary" />
          <span>{selectedCourse.sks} SKS (Kredit)</span>
        </span>
      </div>

      {/* Row Bawah: Jadwal & Tugas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Kelas Berikutnya */}
        <div>
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            Jadwal Mendatang
          </h4>
          <div className="bg-white dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 p-4 rounded-xl shadow-2xs">
            <p className="text-sm font-bold text-on-surface">
              Jadwal Seri Kuliah
            </p>
            <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
              Kelas Berikutnya: <span className="text-primary dark:text-indigo-400 font-bold">{getNextClassDate(selectedCourse.day_of_week)}</span>
            </p>
            <p className="text-[10px] text-[#94A3B8] font-bold mt-1 uppercase">
              Waktu: {selectedCourse.start_time} - {selectedCourse.end_time} ({selectedCourse.room})
            </p>
          </div>
        </div>

        {/* Tugas Kuliah Terkait */}
        <div>
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-primary" />
            Checklist Tugas Terbaru
          </h4>
          {tasks.filter((t) => t.course_id === selectedCourse.id).length === 0 ? (
            <div className="bg-white dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 p-4 rounded-xl shadow-2xs">
              <p className="text-xs text-on-surface-variant italic font-medium">Tidak ada tugas tertunda yang terkait dengan mata kuliah ini.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {tasks
                .filter((t) => t.course_id === selectedCourse.id)
                .map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-2 bg-white dark:bg-slate-900/50 p-2.5 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-800 shadow-3xs cursor-pointer select-none"
                    onClick={() => onToggleTaskState && onToggleTaskState(task.id)}
                  >
                    <input
                      type="checkbox"
                      checked={task.is_finished}
                      onChange={() => onToggleTaskState && onToggleTaskState(task.id)}
                      className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span className={`truncate ${task.is_finished ? 'line-through text-[#94A3B8]' : 'text-on-surface'}`}>
                      {task.task_title}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
