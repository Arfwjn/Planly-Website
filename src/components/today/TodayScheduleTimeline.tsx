/**
 * =============================================================================
 * Planly — TodayScheduleTimeline.tsx
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

import { MapPin, Users, Info, CheckSquare, Notebook, Coffee, Smile, CalendarCheck, BookOpen } from 'lucide-react';
import { Course, Task, SidebarTab } from '../../types';
import { hexToRgb } from '../../utils/color';
import EmptyState from '../ui/InteractiveEmptyState';

interface TodayScheduleTimelineProps {
  todayCourses: Course[];
  todayDayName: string;
  tasks: Task[];
  onToggleTaskState: (taskId: number) => void;
  onOpenNotesWithCourse: (courseId: number | null) => void;
  currentTime: Date;
  onTabChange: (tab: SidebarTab) => void;
}

/**
 * Komponen TodayScheduleTimeline
 * 
 * Menampilkan jadwal perkuliahan untuk hari ini dalam format urutan timeline waktu.
 */
export default function TodayScheduleTimeline({
  todayCourses,
  todayDayName,
  tasks,
  onToggleTaskState,
  onOpenNotesWithCourse,
  currentTime,
  onTabChange
}: TodayScheduleTimelineProps) {
  
  // Deteksi jika hari ini ada jadwal kuliah
  const hasCoursesToday = todayCourses.length > 0;

  // Nama hari dalam bahasa Indonesia untuk label penanda
  const getIndonesianDayName = (day: string): string => {
    const dayMap: { [key: string]: string } = {
      'Monday': 'Senin',
      'Tuesday': 'Selasa',
      'Wednesday': 'Rabu',
      'Thursday': 'Kamis',
      'Friday': 'Jumat',
      'Saturday': 'Sabtu',
      'Sunday': 'Minggu',
    };
    return dayMap[day] || day;
  };

  // Logika penentu status waktu mata kuliah aktif
  const getCourseStatus = (course: Course): 'upcoming' | 'in-progress' | 'completed' => {
    const nowTimeStr = currentTime.toTimeString().split(' ')[0].substring(0, 5); // format HH:MM
    if (nowTimeStr < course.start_time) return 'upcoming';
    if (nowTimeStr >= course.start_time && nowTimeStr <= course.end_time) return 'in-progress';
    return 'completed';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header Widget */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-lg font-bold text-on-surface">Jadwal Hari Ini</h3>
        </div>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold text-on-surface-variant">
          Hari {getIndonesianDayName(todayDayName)}
        </span>
      </div>

      {/* Rincian Timeline */}
      <div className="relative pl-4 md:pl-8">
        {/* Garis Penghubung Timeline */}
        {hasCoursesToday && (
          <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-px bg-[#E2E8F0] dark:bg-slate-850"></div>
        )}

        {!hasCoursesToday ? (
          /* Fallback Kosong */
          <EmptyState
            icons={[
              <Coffee className="w-5 h-5" />,
              <CalendarCheck className="w-5 h-5" />,
              <Smile className="w-5 h-5" />,
            ]}
            title="Tidak ada kelas hari ini"
            description="Nikmati hari libur kamu atau kerjakan tugas-tugas yang belum selesai."
            className="border-none shadow-none bg-transparent"
            action={{
              label: 'Kelola Mata Kuliah',
              icon: <BookOpen className="w-4 h-4" />,
              onClick: () => onTabChange('courses')
            }}
          />
        ) : (
          /* Render List Kelas */
          todayCourses.map((course) => {
            const status = getCourseStatus(course);
            const c = course as any;
            const isCanceled = c.is_canceled;
            const isRescheduledIn = c.is_rescheduled_in;
            const isTimeShifted = c.is_time_shifted;
            const originalStartTime = c.original_start_time;
            const isTimeAdvanced = isTimeShifted && originalStartTime && course.start_time < originalStartTime;
            
            const isCompleted = status === 'completed' && !isCanceled;
            const isInProgress = status === 'in-progress' && !isCanceled;

            // Saring tugas terkait kelas ini yang belum selesai
            const courseTasks = tasks.filter(t => t.course_id === course.id && !t.is_finished);

            return (
              <div 
                key={course.id} 
                className={`relative flex gap-6 md:gap-8 mb-8 transition-opacity duration-300 ${
                  isCompleted || isCanceled ? 'opacity-60' : ''
                }`}
              >
                {/* Waktu Mulai di Kiri */}
                <div className="w-16 flex-shrink-0 text-right pt-4">
                  <span className={`text-sm font-bold block ${isInProgress ? 'text-primary' : 'text-on-surface'}`}>
                    {isCanceled ? '-' : course.start_time}
                  </span>
                  <span className="text-[10px] font-semibold text-on-surface-variant block">
                    {isCanceled ? 'BATAL' : 'WIB'}
                  </span>
                </div>                  
                
                {/* Kartu Detail Mata Kuliah */}
                <div
                  style={{ '--glow-color': hexToRgb(course.color_hex) } as React.CSSProperties}
                  className={`flex-1 border backdrop-blur-md rounded-2xl p-4 md:p-5 relative transition-all duration-300 shadow-[0_8px_30px_rgba(var(--glow-color),0.04)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] ${
                    isInProgress 
                      ? 'border-primary/45 bg-primary/[0.03] ring-1 ring-primary/10' 
                      : isCanceled 
                        ? 'border-red-200 dark:border-red-900/30 bg-red-50/10 dark:bg-red-955/10 opacity-60' 
                        : 'bg-white/65 dark:bg-slate-900/70 border-white/60 dark:border-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-900/85'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 text-left">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Kode Mata Kuliah */}
                      <span
                        className="text-[11px] font-black px-3 py-1 rounded-lg text-white tracking-wider uppercase border border-white/10"
                        style={{
                          backgroundColor: isCanceled ? '#64748B' : course.color_hex,
                          boxShadow: isCanceled ? undefined : `0 4px 12px rgba(var(--glow-color), 0.25)`
                        }}
                      >
                        {course.course_code}
                      </span>
                      {/* Nama Mata Kuliah */}
                      <h4 className={`text-base font-bold text-on-surface inline ${isCompleted || isCanceled ? 'line-through text-on-surface-variant/80' : ''}`}>
                        {course.course_name}
                      </h4>
                    </div>
                    
                    {/* Status Lencana */}
                    {isCanceled ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-955/40 text-red-700 dark:text-red-400 rounded-full text-xs font-bold border border-red-205 dark:border-transparent">
                        Batal Sesi
                      </span>
                    ) : isTimeShifted ? (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                        isTimeAdvanced 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-205 dark:border-transparent' 
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-205 dark:border-transparent'
                      }`}>
                        {isTimeAdvanced ? 'Jadwal Maju' : 'Jadwal Mundur'}
                      </span>
                    ) : isRescheduledIn ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-955/40 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-205 dark:border-transparent">
                        Kuliah Pengganti
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-xs font-bold shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Sedang Berlangsung
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-on-surface-variant rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">
                        Selesai
                      </span>
                    ) : null}
                  </div>
                  
                  {/* Ruang & Nama Dosen */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant mt-2 pt-2 border-t border-slate-50 dark:border-slate-850 font-medium text-left">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" /> {course.room}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#94A3B8]" /> {course.lecturer_name}
                    </p>
                  </div>

                  {/* Reschedule Note */}
                  {c.reschedule_note && (
                    <div className="mt-2.5 p-2 bg-[#F8FAFC] dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] text-on-surface-variant flex items-start gap-1.5 font-medium text-left">
                      <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Catatan: {c.reschedule_note}</span>
                    </div>
                  )}

                  {/* Tugas Terkait (Checklist) */}
                  {courseTasks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-slate-800/50 space-y-2 text-left">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wider pl-1">
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

                  {/* Pintasan Buka Catatan */}
                  <div className="flex items-center gap-4 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => onOpenNotesWithCourse(course.id)}
                      className="text-primary font-bold hover:underline flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      <Notebook className="w-3.5 h-3.5" /> Buka Catatan
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
