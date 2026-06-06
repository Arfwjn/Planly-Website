/**
 * Komponen CalendarView
 * 
 * Komponen ini digunakan untuk melihat jadwal perkuliahan dalam rentang 7 hari ke depan.
 * Pengguna dapat memilih hari tertentu melalui date strip horizontal, melihat status keaktifan kelas,
 * serta menambahkan mata kuliah baru melalui modal terintegrasi.
 */

import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, User, Info, X, Calendar as CalendarIcon, Undo2 } from 'lucide-react';
import { Course, RescheduledSession } from '../types';
import Skeleton from './ui/Skeleton';
import TimePicker from './ui/TimePicker';
import DatePicker from './ui/DatePicker';
import { getCoursesForDate, ProcessedCourse } from '../utils/reschedule';
import { hexToRgb } from '../utils/color';

interface CalendarViewProps {
  courses: Course[];
  onOpenAddNewCourseModal: () => void;
  loading?: boolean;
  rescheduledSessions: RescheduledSession[];
  onAddReschedule: (session: Omit<RescheduledSession, 'id'>) => void;
  onDeleteReschedule: (courseId: number, originalDate: string) => void;
}

export default function CalendarView({
  courses,
  onOpenAddNewCourseModal,
  loading = false,
  rescheduledSessions,
  onAddReschedule,
  onDeleteReschedule
}: CalendarViewProps) {
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        {/* Header Halaman Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-32 h-4 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-16 h-8 rounded-lg" />
            <Skeleton className="w-36 h-8 rounded-lg" />
          </div>
        </div>

        {/* Date Selector Strip Skeleton */}
        <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 min-w-[64px] max-w-[130px] flex flex-col items-center justify-between h-[84px] py-2.5 px-2 rounded-xl border border-date-btn-border bg-date-btn-bg">
                <Skeleton className="w-8 h-3 rounded-md animate-pulse" />
                <Skeleton className="w-6 h-6 rounded-md mt-1 animate-pulse" />
                <Skeleton className="w-10 h-3 rounded-md mt-1 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Live Status Bar Skeleton */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton className="w-48 h-4 rounded-md animate-pulse" />
          <Skeleton className="w-56 h-4 rounded-md animate-pulse" />
        </div>

        {/* Timeline Schedule Skeleton */}
        <div className="relative pt-2 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 lg:gap-6 relative">
              <div className="w-[50px] lg:w-[60px] flex-shrink-0 text-right pt-4 space-y-1">
                <Skeleton className="w-10 h-4 rounded-md ml-auto animate-pulse" />
                <Skeleton className="w-8 h-3 rounded-md ml-auto animate-pulse" />
              </div>
              <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3 shadow-sm h-[130px]">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-1/3 h-5 rounded-md animate-pulse" />
                  <Skeleton className="w-16 h-4 rounded-md animate-pulse" />
                </div>
                <Skeleton className="w-1/2 h-4 rounded-md animate-pulse" />
                <div className="flex gap-4 pt-2">
                  <Skeleton className="w-24 h-4 rounded-md animate-pulse" />
                  <Skeleton className="w-20 h-4 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  /**
   * dynamic 7-day strip generation:
   * Fungsi ini menghasilkan daftar 7 hari ke depan secara dinamis terhitung dari hari ini.
   * Ini digunakan untuk membuat navigasi tanggal horizontal (date strip) yang selalu up-to-date.
   */
  const getDynamicDays = () => {
    const daysList = [];
    const daysNameShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      daysList.push({
        dayName: daysNameShort[d.getDay()],
        fullName: daysFullName[d.getDay()],
        dateNum: d.getDate(),
        dateObject: d
      });
    }
    return daysList;
  };

  // State untuk menyimpan daftar 7 hari dinamis
  const [daysInWeek] = useState(() => getDynamicDays());
  
  // State untuk melacak hari yang saat ini sedang aktif dipilih (default: hari ini / indeks ke-0)
  const [selectedDayObj, setSelectedDayObj] = useState(daysInWeek[0]);
  
  // State untuk waktu sekarang, digunakan untuk melacak keaktifan kelas secara real-time
  const [currentTime, setCurrentTime] = useState(new Date());

  // State untuk melacak mode tampilan (Tampilan Mingguan vs Bulanan)
  const [isMonthView, setIsMonthView] = useState(false);
  // State untuk melacak bulan yang sedang dilihat di Tampilan Bulanan
  const [viewedMonth, setViewedMonth] = useState(() => new Date());

  // State untuk modal reschedule
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedCourseForReschedule, setSelectedCourseForReschedule] = useState<Course | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');

  // Menyelaraskan viewedMonth saat selectedDayObj berubah agar kalender bulanan sinkron
  useEffect(() => {
    setViewedMonth(new Date(selectedDayObj.dateObject));
  }, [selectedDayObj]);

  // Format Date ke "YYYY-MM-DD"
  const formatDateYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedISODate = formatDateYYYYMMDD(selectedDayObj.dateObject);

  // Membuat DayObj baru berdasarkan objek tanggal
  const getDayObjFromDate = (date: Date) => {
    const daysNameShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      dayName: daysNameShort[date.getDay()],
      fullName: daysFullName[date.getDay()],
      dateNum: date.getDate(),
      dateObject: date
    };
  };

  // Menghasilkan daftar 42 hari untuk grid kalender bulanan (6 baris x 7 kolom)
  const getMonthGridDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    // Hari pertama pada bulan yang bersangkutan
    const firstDayOfMonth = new Date(year, month, 1);
    // Hari pertama dalam baris pertama kalender grid (minggu sebelumnya jika hari pertama bukan hari Minggu)
    const startDay = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu, 1 = Senin, dst.
    startDay.setDate(startDay.getDate() - dayOfWeek);

    const gridDays = [];
    for (let i = 0; i < 42; i++) {
      const current = new Date(startDay);
      current.setDate(startDay.getDate() + i);
      gridDays.push({
        date: current,
        isCurrentMonth: current.getMonth() === month
      });
    }
    return gridDays;
  };

  // Handler simpan reschedule
  const handleSubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForReschedule || !rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      alert('Harap lengkapi seluruh formulir pemindahan sesi.');
      return;
    }

    onAddReschedule({
      course_id: selectedCourseForReschedule.id,
      original_date: selectedISODate,
      new_date: rescheduleDate,
      new_start_time: rescheduleStartTime,
      new_end_time: rescheduleEndTime,
      is_canceled: false,
      note: rescheduleNote || null
    });

    setIsRescheduleModalOpen(false);
    setSelectedCourseForReschedule(null);
    setRescheduleDate('');
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    setRescheduleNote('');
  };


  /**
   * Interval timer pembaruan waktu (focus timer ticks / system updates):
   * Kita memperbarui state currentTime setiap 30 detik untuk memastikan pembaruan
   * status 'Sedang Berlangsung' atau 'Selesai' pada jadwal kelas berjalan secara presisi.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Memproses jadwal harian menggunakan utility helper reschedule
  const { dayCoursesProcessed, rescheduledOutCourses } = getCoursesForDate(
    selectedISODate,
    courses,
    rescheduledSessions
  );

  const dayCourses = dayCoursesProcessed;

  /**
   * Mendapatkan nama bulan dan tahun berdasarkan objek tanggal dari hari yang sedang dipilih.
   * Contoh hasil format: "Juni 2026".
   */
  const getSelectedMonthName = () => {
    return selectedDayObj.dateObject.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  /**
   * Menerjemahkan nama hari bahasa Inggris (dari database/state) ke bahasa Indonesia untuk antarmuka pengguna.
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

  /**
   * schedule timeline dengan status states:
   * Menentukan status waktu mata kuliah saat ini relatif terhadap jam sekarang:
   * - 'in-progress' (Sedang Berlangsung): jika waktu sekarang berada di rentang start_time s.d end_time.
   * - 'completed' (Selesai): jika waktu sekarang sudah melewati end_time.
   * - 'upcoming' (Akan Datang): jika waktu sekarang belum memasuki start_time.
   */
  const getCourseStatus = (course: Course) => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentMin = hours * 60 + minutes;
    
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

  // Mencari tahu apakah ada kelas yang sedang aktif berlangsung saat ini di hari terpilih
  const activeCourseNow = dayCourses.find(c => getCourseStatus(c) === 'in-progress');

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Jadwal Kuliah</h1>
          <p className="text-sm text-on-surface-variant font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {getSelectedMonthName()}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Tombol pintasan untuk langsung kembali ke hari ini */}
          <button
            type="button"
            onClick={() => setSelectedDayObj(daysInWeek[0])}
            className="px-3 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant text-xs font-semibold rounded-lg hover:text-on-surface transition-colors cursor-pointer bg-white"
          >
            Hari Ini
          </button>
          {/* Tombol toggle tampilan mingguan vs bulanan */}
          <button
            type="button"
            onClick={() => setIsMonthView(!isMonthView)}
            className={`px-3 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMonthView
                ? 'bg-primary border-primary text-white hover:bg-primary/90'
                : 'border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant hover:text-on-surface bg-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{isMonthView ? 'Tampilan Mingguan' : 'Tampilan Bulanan'}</span>
          </button>
          {/* Tombol aksi membuka modal penambahan mata kuliah baru */}
          <button
            type="button"
            onClick={onOpenAddNewCourseModal}
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            Tambah Mata Kuliah
          </button>
        </div>
      </div>

      {/* Month Grid View */}
      {isMonthView && (
        <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">
              {viewedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  const prev = new Date(viewedMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setViewedMonth(prev);
                }}
                className="p-1.5 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg text-on-surface-variant cursor-pointer transition-colors"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(viewedMonth);
                  next.setMonth(next.getMonth() + 1);
                  setViewedMonth(next);
                }}
                className="p-1.5 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg text-on-surface-variant cursor-pointer transition-colors"
              >
                &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider pb-2 border-b border-[#F1F5F9]">
            <div>Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {getMonthGridDays(viewedMonth).map((gridDay, idx) => {
              const gridDateStr = formatDateYYYYMMDD(gridDay.date);
              const isToday = formatDateYYYYMMDD(new Date()) === gridDateStr;
              const isSelected = selectedISODate === gridDateStr;
              
              // Hitung kelas untuk hari ini menggunakan helper reschedule
              const { dayCoursesProcessed } = getCoursesForDate(
                gridDateStr,
                courses,
                rescheduledSessions
              );

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedDayObj(getDayObjFromDate(gridDay.date));
                    setIsMonthView(false);
                  }}
                  className={`min-h-[60px] flex flex-col justify-between p-1.5 border rounded-xl transition-all cursor-pointer ${
                    gridDay.isCurrentMonth
                      ? isSelected
                        ? 'bg-[#F5F2FF] border-primary text-primary font-bold shadow-xs'
                        : isToday
                          ? 'border-primary/45 bg-primary/[0.02] text-on-surface hover:bg-slate-50'
                          : 'border-[#F1F5F9] bg-slate-50/30 text-on-surface hover:bg-slate-50'
                      : 'border-[#F8FAFC] bg-white text-on-surface-variant/40 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[10px] font-bold self-start ${isToday && !isSelected ? 'text-primary' : ''}`}>
                    {gridDay.date.getDate()}
                  </span>

                  {/* Dots for course load */}
                  <div className="flex flex-wrap gap-0.5 mt-1 self-stretch items-center min-h-[8px]">
                    {dayCoursesProcessed.slice(0, 4).map((c) => (
                      <span
                        key={c.id}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.is_canceled ? '#94A3B8' : c.color_hex }}
                        title={c.course_name}
                      />
                    ))}
                    {dayCoursesProcessed.length > 4 && (
                      <span className="text-[7px] font-extrabold text-[#94A3B8] leading-none">+</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Selector Strip Horizontal (Daftar 7 hari dinamis) */}
      {!isMonthView && (
        <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
            {daysInWeek.map((day, index) => {
              const isSelected = selectedDayObj.fullName === day.fullName;
              const isToday = index === 0;
              const dateStr = formatDateYYYYMMDD(day.dateObject);

              // Ambil kelas untuk tanggal strip ini
              const { dayCoursesProcessed } = getCoursesForDate(
                dateStr,
                courses,
                rescheduledSessions
              );

              return (
                <button
                  key={day.fullName}
                  type="button"
                  onClick={() => setSelectedDayObj(day)}
                  className={`group flex-1 min-w-[64px] max-w-[130px] flex flex-col items-center justify-between h-[84px] py-2.5 px-2 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary to-indigo-600 text-white border-transparent shadow-md shadow-primary/20'
                      : 'border-date-btn-border bg-date-btn-bg text-on-surface-variant hover:bg-primary/[0.04] hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors duration-200 ${
                    isSelected ? 'text-white/85' : 'text-[#94A3B8] group-hover:text-primary/70'
                  }`}>
                    {day.dayName}
                  </span>
                  
                  <span className="text-lg font-black tracking-tight leading-none mt-0.5">
                    {day.dateNum}
                  </span>

                  {/* Indikator Hari Ini atau Titik Mata Kuliah */}
                  {isToday ? (
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none transition-colors duration-200 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary border border-primary/10 group-hover:bg-primary/20'
                    }`}>
                      KINI
                    </span>
                  ) : (
                    <div className="flex gap-1 justify-center items-center h-2 mt-0.5">
                      {dayCoursesProcessed.slice(0, 3).map((c) => (
                        <span
                          key={c.id}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            isSelected ? 'bg-white' : ''
                          }`}
                          style={isSelected ? {} : { backgroundColor: c.is_canceled ? '#94A3B8' : c.color_hex }}
                          title={c.course_name}
                        />
                      ))}
                      {dayCoursesProcessed.length > 3 && (
                        <span className={`text-[8px] font-black ${isSelected ? 'text-white' : 'text-[#94A3B8] group-hover:text-primary'}`}>
                          +
                        </span>
                      )}
                      {dayCoursesProcessed.length === 0 && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/30' : 'bg-[#E2E8F0]'}`} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 
        Live status header bar:
        Bagian status ini hanya tampil apabila hari yang dipilih adalah HARI INI (hari pertama dari strip).
        Berfungsi menampilkan indikator detak merah menyala (pulse) beserta waktu sistem saat ini (WIB),
        serta ringkasan nama mata kuliah yang sedang berjalan di jam aktif.
      */}
      {selectedDayObj.fullName === daysInWeek[0].fullName && (
        <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-on-surface font-semibold">
            {/* Lampu indikator status aktif (pulsing red dot) */}
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span>
              Waktu Sekarang: <strong className="text-primary">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong>
            </span>
          </div>
          {activeCourseNow ? (
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
              <Info className="w-4 h-4" />
              <span>Sedang berlangsung kelas: {activeCourseNow.course_name}</span>
            </div>
          ) : (
            <span className="text-xs text-on-surface-variant font-medium">Tidak ada kelas yang sedang berlangsung saat ini.</span>
          )}
        </div>
      )}

      {/* 
        Schedule Timeline dengan status states:
        Visualisasi jadwal harian terstruktur yang memperlihatkan garis vertikal (connector).
        Setiap item mata kuliah dilengkapi indikator penunjuk status (Selesai / Sedang Berlangsung / Upcoming).
      */}
      <div className="relative pt-2">
        <div className="space-y-6 relative pl-2">
          
          {/* Garis timeline vertikal */}
          {dayCourses.length > 0 && (
            <div className="absolute left-[65px] lg:left-[75px] top-6 bottom-6 w-px bg-[#E2E8F0] z-0"></div>
          )}

          {dayCourses.length === 0 ? (
            /* Tampilan fallback apabila tidak ada mata kuliah yang terjadwal di hari terpilih */
            <div className="text-center py-12 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center p-6">
              {/* Custom SVG Illustration for Empty Calendar */}
              <div className="relative w-24 h-24 mb-4 flex items-center justify-center text-primary/30">
                <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="14" r="1" fill="currentColor" />
                  <circle cx="12" cy="14" r="1" fill="currentColor" />
                  <circle cx="16" cy="14" r="1" fill="currentColor" />
                  <circle cx="8" cy="17" r="1" fill="currentColor" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
                  <circle cx="16" cy="17" r="1" fill="currentColor" />
                </svg>
                {/* Floating elements to make it dynamic */}
                <div className="absolute top-2 right-2 animate-bounce">
                  <svg className="w-6 h-6 text-yellow-500/60" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Tidak Ada Kelas Terjadwal</h3>
              <p className="text-xs text-on-surface-variant mt-1 mb-6 max-w-sm font-medium">
                Tidak ada mata kuliah yang dijadwalkan untuk hari {getIndonesianDayName(selectedDayObj.fullName)}.
              </p>
              <button
                type="button"
                onClick={onOpenAddNewCourseModal}
                className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer font-sans"
              >
                Tambah Mata Kuliah Baru
              </button>
            </div>
          ) : (
            /* Memetakan mata kuliah yang terjadwal */
            dayCourses.map((course) => {
              const status = getCourseStatus(course);
              const c = course as any;
              const isCanceled = c.is_canceled;
              const isRescheduledIn = c.is_rescheduled_in;
              const isCompleted = status === 'completed' && !isCanceled;
              const isInProgress = status === 'in-progress' && !isCanceled;

              return (
                <div key={course.id} className={`flex gap-4 lg:gap-6 relative group transition-opacity duration-300 ${isCompleted || isCanceled ? 'opacity-60' : ''}`}>
                  
                  {/* Indikator Waktu di sebelah kiri */}
                  <div className="w-[50px] lg:w-[60px] flex-shrink-0 text-right pt-4">
                    <span className={`text-xs font-bold block ${isInProgress ? 'text-primary' : 'text-on-surface'}`}>
                      {isCanceled ? '-' : course.start_time}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest block">
                      {isCanceled ? 'BATAL' : 'WIB'}
                    </span>
                  </div>

                  {/* Titik indikator pada timeline (Timeline Dot Indicator) */}
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
                          ? 'border-red-200 bg-red-50/10 opacity-60'
                          : 'bg-white/65 dark:bg-slate-900/70 border-white/60 dark:border-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-900/85'
                    }`}
                  >

                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div>
                        <h3 className={`text-base font-bold text-on-surface ${isCanceled ? 'line-through text-[#94A3B8]' : ''}`}>
                          {course.course_name}
                        </h3>
                        {/* Status kelas dinamis (Sedang Berlangsung / Selesai / Upcoming / Batal) */}
                        {isCanceled ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Batal Sesi
                          </span>
                        ) : isRescheduledIn ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
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
                      {/* Kode mata kuliah */}
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

                    {/* Rincian Tambahan (Waktu, SKS, Dosen, Ruangan) */}
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
                        <div className="mt-2.5 p-2 bg-[#F8FAFC] border border-slate-100 rounded-lg text-[10px] text-on-surface-variant flex items-start gap-1.5 font-medium">
                          <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Catatan: {c.reschedule_note}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons for rescheduling/cancellation */}
                    <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex justify-end gap-2 text-[10px] font-bold">
                      {c.is_canceled || c.is_rescheduled_in ? (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteReschedule(c.id, c.reschedule_original_date || selectedISODate);
                          }}
                          className="px-2.5 py-1 text-primary hover:bg-primary/5 rounded border border-primary/20 cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Pulihkan Sesi Normal</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourseForReschedule(course);
                            setRescheduleDate(selectedISODate);
                            setRescheduleStartTime(course.start_time);
                            setRescheduleEndTime(course.end_time);
                            setIsRescheduleModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 border border-primary/20 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(79,70,229,0.05)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.2)]"
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Pindahkan Sesi</span>
                        </button>
                      )}
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Timeline untuk kelas yang dipindahkan ke hari lain */}
        {rescheduledOutCourses.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#F1F5F9] dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5 pl-2">
              <Undo2 className="w-4 h-4 text-primary" />
              <span>Kelas yang Dipindahkan dari Hari Ini</span>
            </h3>
            <div className="space-y-3 pl-2">
              {rescheduledOutCourses.map((c) => {
                const override = rescheduledSessions.find(
                  (s) => s.course_id === c.id && s.original_date === selectedISODate
                );
                const newDateFormatted = override?.new_date
                  ? new Date(override.new_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
                  : '';
                return (
                  <div
                    key={c.id}
                    style={{ '--glow-color': hexToRgb(c.color_hex) } as React.CSSProperties}
                    className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 rounded-2xl p-5 relative transition-all duration-300 shadow-[0_8px_30px_rgba(var(--glow-color),0.04)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-[11px] font-black px-3 py-1 rounded-lg text-white tracking-wider uppercase border border-white/10"
                          style={{
                            backgroundColor: c.color_hex,
                            boxShadow: `0 4px 12px rgba(var(--glow-color), 0.25)`
                          }}
                        >
                          {c.course_code}
                        </span>
                        <h4 className="font-bold text-sm text-on-surface">{c.course_name}</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">
                        Dipindahkan ke: <strong className="text-primary">{newDateFormatted} ({override?.new_start_time} - {override?.new_end_time} WIB)</strong>
                      </p>
                      {override?.note && (
                        <p className="text-[10px] text-on-surface-variant/80 italic mt-1 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                          Alasan: "{override.note}"
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteReschedule(c.id, selectedISODate)}
                      className="px-3 py-1.5 text-primary hover:bg-primary/5 rounded-xl border border-primary/20 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Pulihkan Sesi Normal</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Modal Reschedule Sesi Kuliah */}
      {isRescheduleModalOpen && selectedCourseForReschedule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-visible p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span>Pindahkan Sesi Kuliah</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setSelectedCourseForReschedule(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-100 p-1 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{selectedCourseForReschedule.course_name}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{selectedCourseForReschedule.course_code} &bull; Sesi normal hari {getIndonesianDayName(selectedCourseForReschedule.day_of_week)}</p>
            </div>

            <form onSubmit={handleSubmitReschedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal Baru</label>
                <DatePicker
                  value={rescheduleDate}
                  onChange={setRescheduleDate}
                  required
                  position="up"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jam Mulai Baru</label>
                  <TimePicker
                    value={rescheduleStartTime}
                    onChange={setRescheduleStartTime}
                    position="up"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jam Selesai Baru</label>
                  <TimePicker
                    value={rescheduleEndTime}
                    onChange={setRescheduleEndTime}
                    position="up"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alasan Pemindahan (Opsional)</label>
                <textarea
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="Contoh: Dosen ada tugas luar kota, kelas diganti malam hari"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsRescheduleModalOpen(false);
                    setSelectedCourseForReschedule(null);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                >
                  Simpan Jadwal Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
