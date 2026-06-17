/**
 * =============================================================================
 * Planly — CourseTimelineCard.tsx
 * 
 * Kegunaan:
 * Komponen visualisasi jadwal perkuliahan, agenda rutin, reschedule, & kalender interaktif bulanan/mingguan.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan CalendarView.tsx (orkestrator) dan terintegrasi dengan Google / Outlook Calendar.
 * 
 * Aliran Data / State:
 * - Membaca kueri jadwal kuliah harian/bulanan mahasiswa, memicu form reschedule kelas, dan check-in kehadiran.
 * =============================================================================
 */

import React from 'react';
import { Clock, User, MapPin, Info, CheckSquare, Check, UserCheck, Undo2, Calendar as CalendarIcon } from 'lucide-react';
import { Course, Task } from '../../types';
import { hexToRgb } from '../../utils/color';

interface CourseTimelineCardProps {
  course: Course;
  status: 'in-progress' | 'completed' | 'upcoming';
  selectedISODate: string;
  tasks: Task[];
  onToggleTaskState: (taskId: number) => void;
  hasCheckedInSelectedDate: boolean;
  onTabChange?: (tab: any) => void;
  onDeleteReschedule: (courseId: number, originalDate: string) => void;
  onOpenRescheduleModal: (course: Course) => void;
  isInProgressDayToday: boolean;
}

/**
 * Komponen CourseTimelineCard
 * 
 * Kartu jadwal matakuliah di dalam timeline harian.
 * Menampilkan kode matakuliah, durasi kuliah, nama dosen, ruang kelas,
 * tugas-tugas kuliah terikat yang tersisa, serta tombol aksi kontekstual
 * seperti "Presensi Wajah" (jika kelas sedang berlangsung) dan "Pindahkan Sesi" (reschedule).
 */
export default function CourseTimelineCard({
  course,
  status,
  selectedISODate,
  tasks,
  onToggleTaskState,
  hasCheckedInSelectedDate,
  onTabChange,
  onDeleteReschedule,
  onOpenRescheduleModal,
  isInProgressDayToday
}: CourseTimelineCardProps) {
  const c = course as any;
  const isCanceled = c.is_canceled;
  const isRescheduledIn = c.is_rescheduled_in;
  const isTimeShifted = c.is_time_shifted;
  const originalStartTime = c.original_start_time;
  const isTimeAdvanced = isTimeShifted && originalStartTime && course.start_time < originalStartTime;
  
  const isCompleted = status === 'completed' && !isCanceled;
  const isInProgress = status === 'in-progress' && !isCanceled && isInProgressDayToday;

  // Saring tugas terikat matakuliah ini yang belum selesai
  const courseTasks = tasks.filter(t => t.course_id === course.id && !t.is_finished);

  return (
    <div className={`flex gap-4 lg:gap-6 relative group transition-opacity duration-300 ${isCompleted || isCanceled ? 'opacity-60' : ''}`}>
      
      {/* Indikator Waktu di Kiri */}
      <div className="w-[50px] lg:w-[60px] flex-shrink-0 text-right pt-4">
        <span className={`text-xs font-bold block ${isInProgress ? 'text-primary' : 'text-on-surface'}`}>
          {isCanceled ? '-' : course.start_time}
        </span>
        <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest block">
          {isCanceled ? 'BATAL' : 'WIB'}
        </span>
      </div>

      {/* Titik Indikator Timeline */}
      <div className="relative flex items-start justify-center z-10 pt-4.5">
        <div className={`w-[12px] h-[12px] rounded-full bg-white border-2 ${
          isCanceled
            ? 'border-red-400 bg-red-400'
            : isInProgress 
              ? 'border-primary ring-4 ring-primary/20 animate-pulse bg-primary' 
              : isCompleted 
                ? 'border-[#94A3B8] bg-[#94A3B8]' 
                : 'border-primary bg-white'
        }`}></div>
      </div>

      {/* Kartu Detail Mata Kuliah */}
      <div
        style={{ '--glow-color': hexToRgb(course.color_hex) } as React.CSSProperties}
        className={`flex-1 border backdrop-blur-md rounded-2xl p-5 relative transition-all duration-300 shadow-[0_8px_30px_rgba(var(--glow-color),0.04)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] ${
          isInProgress 
            ? 'border-primary/45 bg-primary/[0.03] ring-1 ring-primary/10' 
            : isCanceled 
              ? 'border-red-200 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/10 opacity-60'
              : 'bg-white/65 dark:bg-slate-900/70 border-white/60 dark:border-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-900/85'
        }`}
      >
        <div className="flex justify-between items-start mb-3 pl-2">
          <div>
            <h3 className={`text-base font-bold text-on-surface ${isCanceled ? 'line-through text-[#94A3B8]' : ''}`}>
              {course.course_name}
            </h3>
            {/* Tag Status Dinamis */}
            {isCanceled ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Batal Sesi
              </span>
            ) : isTimeShifted ? (
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                isTimeAdvanced ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isTimeAdvanced ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {isTimeAdvanced ? 'Jadwal Maju' : 'Jadwal Mundur'}
              </span>
            ) : isRescheduledIn ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Kuliah Pengganti
              </span>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Sedang Berlangsung
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Selesai
              </span>
            ) : null}
          </div>
          {/* Badge Kode Kelas */}
          <span
            className="text-[11px] font-black px-3 py-1 rounded-lg text-white tracking-wider uppercase border border-white/10"
            style={{
              backgroundColor: isCanceled ? '#64748B' : course.color_hex,
              boxShadow: isCanceled ? undefined : `0 4px 12px rgba(var(--glow-color), 0.25)`
            }}
          >
            {course.course_code}
          </span>
        </div>

        {/* Info detail jam, SKS, dosen, ruang */}
        <div className="pl-2 space-y-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {course.start_time} - {course.end_time} ({course.sks} SKS)
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{course.lecturer_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{course.room}</span>
            </div>
          </div>

          {/* Catatan Reschedule */}
          {c.reschedule_note && (
            <div className="mt-2.5 p-2 bg-[#F8FAFC] dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] text-on-surface-variant flex items-start gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span>Catatan: {c.reschedule_note}</span>
            </div>
          )}
        </div>

        {/* List Tugas Terkait */}
        {courseTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-slate-800/50 space-y-2 pl-2">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tugas Terkait ({courseTasks.length})</span>
            </div>
            <div className="space-y-1.5">
              {courseTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2.5 text-[11px] text-on-surface-variant font-medium bg-slate-50/50 dark:bg-slate-800/20 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/35 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={task.is_finished}
                    onChange={() => onToggleTaskState(task.id)}
                    className="w-3.5 h-3.5 rounded border-[#C7C4D8] dark:border-slate-700 text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface truncate">
                      {task.task_title}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Tenggat: {task.deadline.split(' ')[0]} {task.deadline.split(' ')[1]?.slice(0, 5) || '23:59'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Baris Tombol Aksi */}
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-slate-800/50 flex justify-end gap-2 text-[10px] font-bold">
          {isInProgress && onTabChange && (
            hasCheckedInSelectedDate ? (
              <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px]" />
                <span>Sudah Presensi</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onTabChange('attendance')}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.05)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Presensi Wajah</span>
              </button>
            )
          )}
          
          {isCanceled || isRescheduledIn || isTimeShifted ? (
            <button
              type="button"
              onClick={() => {
                onDeleteReschedule(course.id, c.reschedule_original_date || selectedISODate);
              }}
              className="px-2.5 py-1 text-primary hover:bg-primary/5 rounded border border-primary/20 cursor-pointer transition-colors flex items-center gap-1"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Pulihkan Sesi Normal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenRescheduleModal(course)}
              className="px-3.5 py-1.5 border border-[#4F46E5]/20 dark:border-slate-850 bg-primary/5 dark:bg-primary/20 hover:bg-primary text-primary dark:text-white/70 hover:text-white rounded-xl cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(79,70,229,0.05)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.2)]"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Pindahkan Sesi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
