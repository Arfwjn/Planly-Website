/**
 * Komponen TodayView
 * 
 * Komponen ini berfungsi sebagai dasbor harian mahasiswa untuk melihat jadwal kuliah hari ini,
 * memantau progres tugas, serta mengelola timer fokus (Focus Timer).
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, AlertTriangle, MapPin, Users, Notebook, Calendar, 
  Info, Undo2, BookOpen, Flame, CheckSquare, Sparkles 
} from 'lucide-react';
import { Course, Task, SidebarTab, CampusEvent, RescheduledSession } from '../types';
import NotificationBanner from './ui/NotificationBanner';
import { getCoursesForDate } from '../utils/reschedule';
import { hexToRgb } from '../utils/color';

interface TodayViewProps {
  user: { name: string };
  courses: Course[];
  tasks: Task[];
  onToggleTaskState: (taskId: number) => void;
  onTabChange: (tab: SidebarTab) => void;
  onOpenNotesWithCourse: (courseId: number | null) => void;
  focusTimeLeft: number;
  isFocusTimerRunning: boolean;
  setIsFocusTimerRunning: (running: boolean) => void;
  onResetFocusTimer: () => void;
  loading?: boolean;
  events?: CampusEvent[];
  rescheduledSessions: RescheduledSession[];
  pomodoroStage: 'work' | 'short-break' | 'long-break';
  pomodoroTaskId: number | null;
  completedPomodoroCount: number;
}

export default function TodayView({
  user,
  courses,
  tasks,
  onToggleTaskState,
  onTabChange,
  onOpenNotesWithCourse,
  focusTimeLeft,
  isFocusTimerRunning,
  setIsFocusTimerRunning,
  onResetFocusTimer,
  loading = false,
  events = [],
  rescheduledSessions,
  pomodoroStage,
  pomodoroTaskId,
  completedPomodoroCount
}: TodayViewProps) {

  // Tampilkan loading skeleton jika data sedang dimuat
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        {/* Header Halaman Skeleton */}
        <div className="space-y-2">
          <div className="w-48 h-8 bg-slate-200 animate-pulse rounded-lg" />
          <div className="w-32 h-4 bg-slate-200 animate-pulse rounded-md" />
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[160px]">
            <div className="flex items-center justify-between">
              <div className="w-28 h-4 bg-slate-200 animate-pulse rounded-md" />
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="w-12 h-10 bg-slate-200 animate-pulse rounded-lg" />
              <div className="w-28 h-4 bg-slate-200 animate-pulse rounded-md" />
            </div>
          </div>
          
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm md:col-span-2 flex flex-col justify-between h-[160px]">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-slate-200 animate-pulse rounded-md" />
              <div className="w-20 h-6 bg-slate-200 animate-pulse rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="w-2/3 h-6 bg-slate-200 animate-pulse rounded-md" />
              <div className="w-full h-2 bg-slate-200 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* Schedule List Skeleton */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div className="w-32 h-6 bg-slate-200 animate-pulse rounded-md" />
            <div className="w-24 h-6 bg-slate-200 animate-pulse rounded-full" />
          </div>
          <div className="space-y-6 relative pl-4 md:pl-8">
            <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-px bg-[#E2E8F0]"></div>
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 md:gap-6 relative">
                <div className="w-[50px] md:w-[66px] space-y-1 pt-1.5 flex-shrink-0">
                  <div className="w-10 h-4 bg-slate-200 animate-pulse rounded-md ml-auto" />
                  <div className="w-8 h-3 bg-slate-200 animate-pulse rounded-md ml-auto" />
                </div>
                <div className="flex-1 bg-white border border-[#E2E8F0] rounded-xl p-4 md:p-5 space-y-3 shadow-sm h-[110px]">
                  <div className="flex justify-between items-center">
                    <div className="w-1/3 h-5 bg-slate-200 animate-pulse rounded-md" />
                    <div className="w-16 h-4 bg-slate-200 animate-pulse rounded-md" />
                  </div>
                  <div className="w-2/3 h-4 bg-slate-200 animate-pulse rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * formatting time:
   * Memformat waktu sisa fokus (dalam detik) menjadi format string MM:SS.
   * Kita menggunakan padStart untuk memastikan angka menit dan detik selalu memiliki dua digit.
   */
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * getTodayDateString:
   * Mendapatkan representasi string tanggal hari ini dalam format Indonesia.
   * Contoh: "Kamis, 4 Jun".
   */
  const getTodayDateString = () => {
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  /**
   * getTodayDayOfWeek:
   * Mendapatkan nama hari hari ini dalam bahasa Inggris untuk dicocokkan dengan data mata kuliah.
   * Contoh: "Wednesday".
   */
  const getTodayDayOfWeek = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  /**
   * Memetakan nama hari bahasa Inggris ke bahasa Indonesia untuk kebutuhan tampilan visual UI.
   */
  const getIndonesianDayName = (day: string) => {
    const map: Record<string, string> = {
      'Sunday': 'Minggu',
      'Monday': 'Senin',
      'Tuesday': 'Selasa',
      'Wednesday': 'Rabu',
      'Thursday': 'Kamis',
      'Friday': 'Jumat',
      'Saturday': 'Sabtu'
    };
    return map[day] || day;
  };

  const todayDay = getTodayDayOfWeek();

  // Mendapatkan tanggal hari ini dalam format ISO "YYYY-MM-DD"
  const todayISODate = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  // Filter & proses override untuk hari ini menggunakan reschedule helper
  const { dayCoursesProcessed } = getCoursesForDate(
    todayISODate,
    courses,
    rescheduledSessions
  );

  const todayCourses = dayCoursesProcessed;

  // Menentukan apakah ada jadwal kuliah untuk hari ini
  const hasCoursesToday = todayCourses.length > 0;

  // Memfilter tugas-tugas yang belum diselesaikan (is_finished === false)
  const pendingTasks = tasks.filter((t) => !t.is_finished);
  
  // Menghitung jumlah tugas belum selesai yang memiliki tingkat prioritas tinggi
  const highPriorityCount = pendingTasks.filter((t) => t.is_priority).length;
  
  // Mengambil tugas fokus aktif berdasarkan pomodoroTaskId (jika diset), atau fallback ke tugas pertama
  const activeFocusTask = pomodoroTaskId 
    ? tasks.find(t => t.id === pomodoroTaskId) 
    : pendingTasks[0];
  
  /**
   * course progress calculation (task progress):
   * Menghitung jumlah tugas yang sudah selesai serta persentase progres penyelesaian tugas secara keseluruhan.
   * Jika tidak ada tugas, progres diatur ke 0.
   */
  const completedCount = tasks.filter(t => t.is_finished).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  /**
   * Menentukan status perkuliahan berdasarkan waktu saat ini:
   * - 'in-progress' jika waktu sekarang berada di antara waktu mulai dan selesai kelas.
   * - 'completed' jika waktu sekarang sudah melewati waktu selesai kelas.
   * - 'upcoming' jika kelas belum dimulai.
   */
  const getCourseStatus = (course: Course) => {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = course.start_time.split(':').map(Number);
    const [endH, endM] = course.end_time.split(':').map(Number);
    
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    
    if (currentMin >= startMin && currentMin <= endMin) {
      return 'in-progress';
    } else if (currentMin > endMin) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  // Penghitungan kelas selesai dan mendatang untuk hari ini
  const completedCoursesCount = todayCourses.filter(c => getCourseStatus(c) === 'completed').length;
  const upcomingCoursesCount = todayCourses.length - completedCoursesCount;

  // Penghitungan kemajuan timer Pomodoro sesi aktif saat ini
  const getStageTotalSeconds = (stage: 'work' | 'short-break' | 'long-break') => {
    if (stage === 'work') return 1500;
    if (stage === 'short-break') return 300;
    return 900;
  };
  const totalStageSecs = getStageTotalSeconds(pomodoroStage);
  const sessionProgressPercentage = Math.min(100, Math.max(0, Math.round(((totalStageSecs - focusTimeLeft) / totalStageSecs) * 100)));

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-1">
          Jadwal Hari Ini
        </h1>
        <p className="text-sm text-on-surface-variant font-medium">
          {getTodayDateString()}
        </p>
      </div>

      {/* Banner Permintaan Izin Notifikasi */}
      <NotificationBanner />

      {/* 
        Dashboard Row 1: Tiga Kartu Metrik Ringkas (Tugas Aktif, Kuliah Hari Ini, Fokus Pomodoro)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Tugas Aktif */}
        <div
          onClick={() => onTabChange('tasks')}
          style={{ '--glow-color': hexToRgb('#6366F1') } as React.CSSProperties}
          className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Tugas Aktif
            </span>
            <div className="text-3xl font-black text-on-surface group-hover:text-primary transition-colors leading-none">
              {pendingTasks.length} <span className="text-xs font-semibold text-on-surface-variant">Tugas</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 font-medium block">
              {highPriorityCount} Prioritas Tinggi
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Kuliah Hari Ini */}
        <div
          onClick={() => onTabChange('calendar')}
          style={{ '--glow-color': hexToRgb('#10B981') } as React.CSSProperties}
          className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Kuliah Hari Ini
            </span>
            <div className="text-3xl font-black text-on-surface group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-none">
              {todayCourses.length} <span className="text-xs font-semibold text-on-surface-variant">Kelas</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 font-medium block">
              {completedCoursesCount} Selesai, {upcomingCoursesCount} Mendatang
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Fokus Pomodoro */}
        <div
          onClick={() => onTabChange('workspace')}
          style={{ '--glow-color': hexToRgb('#F59E0B') } as React.CSSProperties}
          className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Fokus Pomodoro
            </span>
            <div className="text-3xl font-black text-on-surface group-hover:text-amber-500 transition-colors leading-none">
              {completedPomodoroCount} <span className="text-xs font-semibold text-on-surface-variant">Sesi</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/80 font-medium block">
              Target Harian: 4 Sesi Kerja
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 
        Dashboard Row 2: Dua Panel Detail Utama (Fokus Sesi & Progres Tugas)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Fokus Saat Ini (Pomodoro) */}
        <div
          style={{ '--glow-color': hexToRgb('#3525cd') } as React.CSSProperties}
          className="bg-primary/85 dark:bg-primary/75 text-white border border-primary/20 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgba(var(--glow-color),0.08)] hover:-translate-y-1 hover:bg-primary/90 dark:hover:bg-primary/80 hover:shadow-[0_20px_40px_rgba(var(--glow-color),0.15)] transition-all duration-300 lg:col-span-2 relative overflow-hidden group flex flex-col justify-between"
        >
          {/* Aksentuasi Dekoratif di Latar Belakang */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  Fokus Saat Ini
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider">
                  {pomodoroStage === 'work' 
                    ? 'Sesi Fokus' 
                    : pomodoroStage === 'short-break' 
                      ? 'Istirahat Pendek' 
                      : 'Istirahat Panjang'}
                </span>
              </div>
              <button
                onClick={() => setIsFocusTimerRunning(!isFocusTimerRunning)}
                className="px-3.5 py-1.5 bg-white text-primary hover:bg-white/95 active:scale-95 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {isFocusTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{formatTimer(focusTimeLeft)}</span>
              </button>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold tracking-tight truncate">
                {activeFocusTask ? activeFocusTask.task_title : 'Tidak ada tugas tersisa!'}
              </h3>
              <p className="text-xs text-white/80 line-clamp-2 min-h-8 font-medium">
                {activeFocusTask ? (activeFocusTask.description || 'Tidak ada deskripsi tambahan.') : 'Semua tugas semester Anda telah selesai dikerjakan.'}
              </p>
            </div>

            {/* Progres Sesi Pomodoro Saat Ini */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Kemajuan Sesi Pomodoro</span>
                <span className="font-bold">{sessionProgressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${sessionProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel Progres Tugas Semester */}
        <div
          onClick={() => onTabChange('tasks')}
          style={{ '--glow-color': hexToRgb('#6366F1') } as React.CSSProperties}
          className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex flex-col justify-between group cursor-pointer text-left"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Progres Tugas Semester
            </span>
            <h3 className="text-base font-bold text-on-surface leading-tight pt-1">
              Penyelesaian Tugas
            </h3>
            <p className="text-xs text-on-surface-variant font-medium">
              {completedCount} tugas telah selesai dari total {tasks.length} tugas.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-on-surface-variant">Progres Keseluruhan</span>
              <span className="font-bold text-primary">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-[9px] text-on-surface-variant/80 font-bold block pt-1 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              {progressPercentage === 100 ? 'Luar Biasa! Semua selesai' : 'Ayo selesaikan tugas Anda!'}
            </span>
          </div>
        </div>
      </div>

      {/* Bagian Jadwal Kuliah Utama */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-[#E2E8F0] pb-4">
          <h3 className="text-lg font-bold text-on-surface">Jadwal Kuliah</h3>
          <span className="text-xs text-on-surface-variant font-medium bg-[#F1F5F9] px-3 py-1 rounded-full">
            Hari {getIndonesianDayName(todayDay)}
          </span>
        </div>

        {/* 
          dynamic schedule timeline checklist:
          Menampilkan barisan kelas hari ini secara dinamis dengan visualisasi garis timeline vertikal (checklist-style).
          Mata kuliah yang sudah selesai (status === 'completed') akan di-render dengan opacity lebih rendah (opacity-50)
          dan judul dicoret (line-through), sedangkan kelas yang sedang aktif ditandai dengan detak animasi (pulse)
          dan warna primer untuk menarik perhatian pengguna secara real-time.
        */}
        <div className="relative pl-4 md:pl-8">
          {/* Garis penghubung timeline vertikal */}
          <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-px bg-[#E2E8F0]"></div>

          {!hasCoursesToday ? (
            /* Tampilan jika hari ini tidak ada jadwal kuliah */
            <div className="text-center py-12 bg-white border border-dashed border-[#C7C4D8] rounded-xl flex flex-col items-center justify-center">
              <Clock className="w-12 h-12 text-[#94A3B8] mb-3 opacity-60 animate-pulse" />
              <h3 className="text-sm font-semibold text-on-surface">Tidak ada kelas hari ini</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Nikmati hari libur Anda atau kerjakan tugas-tugas yang belum selesai.
              </p>
            </div>
          ) : (
            /* Merender setiap mata kuliah hari ini */
            todayCourses.map((course) => {
              const status = getCourseStatus(course);
              const c = course as any;
              const isCanceled = c.is_canceled;
              const isRescheduledIn = c.is_rescheduled_in;
              const isCompleted = status === 'completed' && !isCanceled;
              const isInProgress = status === 'in-progress' && !isCanceled;

              return (
                <div key={course.id} className={`relative flex gap-6 md:gap-8 mb-8 transition-opacity duration-300 ${isCompleted || isCanceled ? 'opacity-60' : ''}`}>
                  {/* Kolom Waktu Mulai */}
                  <div className="w-16 flex-shrink-0 text-right pt-4">
                    <span className={`text-sm font-bold block ${isInProgress ? 'text-primary' : 'text-on-surface'}`}>
                      {isCanceled ? '-' : course.start_time}
                    </span>
                    <span className="text-[10px] font-semibold text-on-surface-variant block">
                      {isCanceled ? 'BATAL' : 'WIB'}
                    </span>
                  </div>                  
                  
                  {/* Kartu Informasi Kelas */}
                  <div
                    style={{ '--glow-color': hexToRgb(course.color_hex) } as React.CSSProperties}
                    className={`flex-1 border backdrop-blur-md rounded-2xl p-4 md:p-5 relative transition-all duration-300 shadow-[0_8px_30px_rgba(var(--glow-color),0.04)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] ${
                      isInProgress 
                        ? 'border-primary/45 bg-primary/[0.03] ring-1 ring-primary/10' 
                        : isCanceled 
                          ? 'border-red-200 bg-red-50/10 opacity-60' 
                          : 'bg-white/65 dark:bg-slate-900/70 border-white/60 dark:border-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-900/85'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Kode Mata Kuliah dengan warna kustom */}
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
                      
                      {/* Label Status Kelas */}
                      {isCanceled ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                          Batal Sesi
                        </span>
                      ) : isRescheduledIn ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                          Kuliah Pengganti
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-xs font-bold shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          Sedang Berlangsung
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-on-surface-variant rounded-full text-xs font-bold border border-slate-200">
                          Selesai
                        </span>
                      ) : null}
                    </div>
                    
                    {/* Detail Ruangan & Dosen */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant mt-2 pt-2 border-t border-slate-50 font-medium">
                      <p className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" /> {course.room}
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#94A3B8]" /> {course.lecturer_name}
                      </p>
                    </div>

                    {/* Catatan Reschedule */}
                    {c.reschedule_note && (
                      <div className="mt-2.5 p-2 bg-[#F8FAFC] border border-slate-100 rounded-lg text-[10px] text-on-surface-variant flex items-start gap-1.5 font-medium">
                        <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Catatan: {c.reschedule_note}</span>
                      </div>
                    )}

                    {/* Tugas Terkait */}
                    {(() => {
                      const courseTasks = tasks.filter(t => t.course_id === course.id && !t.is_finished);
                      if (courseTasks.length === 0) return null;
                      return (
                        <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-slate-800/50 space-y-2">
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
                                  className="w-3.5 h-3.5 rounded border-[#C7C4D8] text-primary focus:ring-primary cursor-pointer accent-primary"
                                />
                                <div className="flex-1 min-w-0 text-left">
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
                      );
                    })()}

                    {/* Tombol Interaktif: Membuka Catatan Khusus untuk Mata Kuliah ini */}
                    <div className="flex items-center gap-4 pt-3 mt-3 border-t border-slate-100 text-xs">
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

      {/* Section Event Hari Ini */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 className="text-lg font-bold text-on-surface">Event Hari Ini</h3>
          </div>
          <button
            onClick={() => onTabChange('events')}
            className="text-xs font-bold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Lihat Semua Event
          </button>
        </div>

        {(() => {
          const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
          const todayEvents = events.filter(e => e.event_date === todayStr);

          if (todayEvents.length === 0) {
            return (
              <div className="text-center py-6 text-on-surface-variant text-xs font-medium">
                Tidak ada event non-kuliah yang terjadwal untuk hari ini.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todayEvents.map(event => (
                <div
                  key={event.id}
                  style={{ '--glow-color': hexToRgb(event.color_hex) } as React.CSSProperties}
                  className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.07)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {event.category.replace('_', ' ')}
                      </span>
                      {event.is_important && (
                        <span className="text-xs text-yellow-500">⭐</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-on-surface mb-1">{event.event_name}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{event.description || 'Tidak ada deskripsi.'}</p>
                  </div>
                  <div className="space-y-1.5 text-[10px] text-on-surface-variant font-medium pt-2 border-t border-slate-50">
                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {event.start_time} - {event.end_time} WIB</p>
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {event.location}</p>
                    <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> {event.organizer}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
