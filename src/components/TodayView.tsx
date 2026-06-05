/**
 * Komponen TodayView
 * 
 * Komponen ini berfungsi sebagai dasbor harian mahasiswa untuk melihat jadwal kuliah hari ini,
 * memantau progres tugas, serta mengelola timer fokus (Focus Timer).
 */

import { useState, useEffect } from 'react';
import { Clock, Play, Pause, AlertTriangle, MapPin, Users, Notebook } from 'lucide-react';
import { Course, Task, SidebarTab } from '../types';
import NotificationBanner from './ui/NotificationBanner';

interface TodayViewProps {
  user: { name: string };
  courses: Course[];
  tasks: Task[];
  onTabChange: (tab: SidebarTab) => void;
  onOpenNotesWithCourse: (courseId: number | null) => void;
  focusTimeLeft: number;
  isFocusTimerRunning: boolean;
  setIsFocusTimerRunning: (running: boolean) => void;
  onResetFocusTimer: () => void;
  loading?: boolean;
}

export default function TodayView({
  user,
  courses,
  tasks,
  onTabChange,
  onOpenNotesWithCourse,
  focusTimeLeft,
  isFocusTimerRunning,
  setIsFocusTimerRunning,
  onResetFocusTimer,
  loading = false
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

  // Mendapatkan hari ini dalam format bahasa Inggris (misalnya "Thursday")
  const todayDay = getTodayDayOfWeek(); // e.g. "Wednesday"

  // Memfilter daftar mata kuliah yang dijadwalkan hanya untuk hari ini dan mengurutkannya secara kronologis
  const todayCourses = courses
    .filter((c) => c.day_of_week === todayDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Menentukan apakah ada jadwal kuliah untuk hari ini
  const hasCoursesToday = todayCourses.length > 0;

  // Memfilter tugas-tugas yang belum diselesaikan (is_finished === false)
  const pendingTasks = tasks.filter((t) => !t.is_finished);
  
  // Menghitung jumlah tugas belum selesai yang memiliki tingkat prioritas tinggi
  const highPriorityCount = pendingTasks.filter((t) => t.is_priority).length;
  
  // Mengambil tugas pertama dari daftar tugas pending untuk dijadikan fokus utama pengerjaan saat ini
  const focusTask = pendingTasks[0];
  
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
        bento layout grid:
        Layout grid modular bergaya Bento (menggunakan Tailwind `grid grid-cols-1 md:grid-cols-3 gap-6`)
        yang responsif untuk membagi halaman ke dalam beberapa wadah informasi ringkas secara estetis.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bento Box: Tugas Belum Selesai (Mengarah ke tab Tugas saat diklik) */}
        <div
          onClick={() => onTabChange('tasks')}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Tugas Belum Selesai
            </span>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-[48px] font-bold tracking-tight text-on-surface leading-none mb-2 group-hover:text-primary transition-colors">
              {pendingTasks.length}
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              {highPriorityCount} Prioritas Tinggi
            </p>
          </div>
        </div>

        {/* Bento Box: Fokus Saat Ini & Kontrol Timer Fokus (Lebar 2 kolom pada layar medium ke atas) */}
        <div className="bg-primary text-white border border-primary/25 rounded-2xl p-6 shadow-md md:col-span-2 relative overflow-hidden group">
          {/* Aksentuasi Dekoratif di Latar Belakang */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                Fokus Saat Ini
              </span>
              <div className="flex items-center gap-2">
                {/* 
                  focus timer ticks:
                  Menampilkan sisa waktu hitung mundur (focusTimeLeft) yang dikelola di tingkat atas (parent component).
                  Setiap detiknya diperbarui oleh timer interval utama (focus timer ticks), dioper ke sini sebagai prop,
                  dan tombol ini digunakan untuk memulai/menghentikan jalannya timer.
                */}
                <button
                  onClick={() => setIsFocusTimerRunning(!isFocusTimerRunning)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors"
                >
                  {isFocusTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{formatTimer(focusTimeLeft)}</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2 truncate">
                {focusTask ? focusTask.task_title : 'Tidak ada tugas tersisa!'}
              </h3>
              <p className="text-xs text-white/85 mb-3 line-clamp-2 min-h-8">
                {focusTask ? (focusTask.description || 'Tidak ada deskripsi tambahan.') : 'Semua tugas semester Anda telah selesai dikerjakan.'}
              </p>
              {/* Progres Penyelesaian Tugas Keseluruhan */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full relative transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  >
                  </div>
                </div>
                <span className="text-xs font-bold">{progressPercentage}% Tugas Selesai</span>
              </div>
            </div>
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
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in-progress';

              return (
                <div key={course.id} className={`relative flex gap-6 md:gap-8 mb-8 transition-opacity duration-300 ${isCompleted ? 'opacity-50' : ''}`}>
                  {/* Kolom Waktu Mulai */}
                  <div className="w-16 flex-shrink-0 text-right pt-4">
                    <span className={`text-sm font-bold block ${isInProgress ? 'text-primary' : 'text-on-surface'}`}>{course.start_time}</span>
                    <span className="text-[10px] font-semibold text-on-surface-variant block">
                      {parseInt(course.start_time) >= 12 ? 'WIB' : 'WIB'}
                    </span>
                  </div>                  
                  
                  {/* Kartu Informasi Kelas */}
                  <div className={`flex-1 bg-white border rounded-xl p-4 md:p-5 hover:border-primary transition-all shadow-sm ${
                    isInProgress ? 'border-primary/45 bg-primary/[0.02] ring-1 ring-primary/5' : 'border-[#E2E8F0]'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Kode Mata Kuliah dengan warna kustom */}
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                          style={{ backgroundColor: course.color_hex }}
                        >
                          {course.course_code}
                        </span>
                        {/* Nama Mata Kuliah */}
                        <h4 className={`text-base font-bold text-on-surface inline ${isCompleted ? 'line-through text-on-surface-variant/80' : ''}`}>
                          {course.course_name}
                        </h4>
                      </div>
                      
                      {/* Label Status Kelas */}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-xs font-bold shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          Sedang Berlangsung
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-on-surface-variant rounded-full text-xs font-bold border border-slate-200">
                          Selesai
                        </span>
                      )}
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
    </div>
  );
}
