/**
 * Komponen CalendarView
 * 
 * Komponen ini digunakan untuk melihat jadwal perkuliahan dalam rentang 7 hari ke depan.
 * Pengguna dapat memilih hari tertentu melalui date strip horizontal, melihat status keaktifan kelas,
 * serta menambahkan mata kuliah baru melalui modal terintegrasi.
 */

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, User, Info } from 'lucide-react';
import { Course } from '../types';
import Skeleton from './ui/Skeleton';

interface CalendarViewProps {
  courses: Course[];
  onOpenAddNewCourseModal: () => void;
  loading?: boolean;
}

export default function CalendarView({ courses, onOpenAddNewCourseModal, loading = false }: CalendarViewProps) {
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

  /**
   * selected day filter:
   * Memfilter mata kuliah yang sesuai dengan nama hari yang sedang dipilih oleh user,
   * kemudian mengurutkannya secara kronologis dari jam paling awal ke yang paling akhir.
   */
  const dayCourses = courses
    .filter((c) => c.day_of_week === selectedDayObj.fullName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

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
            onClick={() => setSelectedDayObj(daysInWeek[0])}
            className="px-3 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant text-xs font-semibold rounded-lg hover:text-on-surface transition-colors cursor-pointer bg-white"
          >
            Hari Ini
          </button>
          {/* Tombol aksi membuka modal penambahan mata kuliah baru */}
          <button
            onClick={onOpenAddNewCourseModal}
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            Tambah Mata Kuliah
          </button>
        </div>
      </div>

      {/* Date Selector Strip Horizontal (Daftar 7 hari dinamis) */}
      <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
          {daysInWeek.map((day, index) => {
            const isSelected = selectedDayObj.fullName === day.fullName;
            const dayCoursesList = courses.filter((c) => c.day_of_week === day.fullName);
            const isToday = index === 0;

            return (
              <button
                key={day.fullName}
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
                    {dayCoursesList.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isSelected ? 'bg-white' : ''
                        }`}
                        style={isSelected ? {} : { backgroundColor: c.color_hex }}
                        title={c.course_name}
                      />
                    ))}
                    {dayCoursesList.length > 3 && (
                      <span className={`text-[8px] font-black ${isSelected ? 'text-white' : 'text-[#94A3B8] group-hover:text-primary'}`}>
                        +
                      </span>
                    )}
                    {dayCoursesList.length === 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/30' : 'bg-[#E2E8F0]'}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in-progress';

              return (
                <div key={course.id} className={`flex gap-4 lg:gap-6 relative group transition-opacity duration-300 ${isCompleted ? 'opacity-60' : ''}`}>
                  
                  {/* Indikator Waktu di sebelah kiri */}
                  <div className="w-[50px] lg:w-[60px] flex-shrink-0 text-right pt-4">
                    <span className={`text-xs font-bold block ${isInProgress ? 'text-primary' : 'text-on-surface'}`}>
                      {course.start_time}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest block">
                      WIB
                    </span>
                  </div>

                  {/* Titik indikator pada timeline (Timeline Dot Indicator) */}
                  <div className="relative flex items-start justify-center z-10 pt-4.5">
                    <div className={`w-[12px] h-[12px] rounded-full bg-white border-2 ${
                      isInProgress 
                        ? 'border-primary ring-4 ring-primary/20 animate-pulse bg-primary' 
                        : isCompleted 
                          ? 'border-[#94A3B8] bg-[#94A3B8]' 
                          : 'border-primary bg-white'
                    }`}></div>
                  </div>

                  {/* Kartu Detail Mata Kuliah */}
                  <div className={`flex-1 bg-white rounded-2xl border p-5 relative overflow-hidden transition-all shadow-sm ${
                    isInProgress 
                      ? 'border-primary shadow-[0_0_20px_rgba(79,70,229,0.15)] ring-1 ring-primary/35 bg-primary/[0.01]' 
                      : 'border-[#E2E8F0] hover:border-primary/50 hover:shadow-md'
                  }`}>
                    {/* Pita dekoratif vertikal di sisi kiri kartu berdasarkan warna kustom mata kuliah */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ backgroundColor: course.color_hex }}
                    ></div>

                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div>
                        <h3 className="text-base font-bold text-on-surface">
                          {course.course_name}
                        </h3>
                        {/* Status kelas dinamis (Sedang Berlangsung / Selesai / Upcoming) */}
                        {isInProgress && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Sedang Berlangsung
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">
                            Selesai
                          </span>
                        )}
                      </div>
                      {/* Kode mata kuliah */}
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded border shadow-2xs"
                        style={{
                          color: course.color_hex,
                          backgroundColor: `${course.color_hex}10`,
                          borderColor: `${course.color_hex}25`
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
