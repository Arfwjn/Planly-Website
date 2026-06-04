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

interface CalendarViewProps {
  courses: Course[];
  onOpenAddNewCourseModal: () => void;
}

export default function CalendarView({ courses, onOpenAddNewCourseModal }: CalendarViewProps) {
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Jadwal Kuliah</h1>
          <p className="text-sm text-on-surface-variant font-semibold mt-1">
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
        <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {daysInWeek.map((day) => {
            const isSelected = selectedDayObj.fullName === day.fullName;
            return (
              <button
                key={day.fullName}
                onClick={() => setSelectedDayObj(day)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-[64px] h-[78px] rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2'
                    : 'border border-[#E2E8F0] bg-white text-on-surface-variant hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'opacity-90' : 'text-[#94A3B8]'}`}>
                  {day.dayName}
                </span>
                <span className="text-lg font-bold mt-1">
                  {day.dateNum}
                </span>
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
            <div className="text-center py-12 bg-white border border-dashed border-[#C7C4D8] rounded-xl">
              <CalendarDays className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-semibold text-on-surface">Tidak Ada Kelas Terjadwal</h3>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                Tidak ada mata kuliah yang dijadwalkan untuk hari {getIndonesianDayName(selectedDayObj.fullName)}.
              </p>
              <button
                onClick={onOpenAddNewCourseModal}
                className="px-4 py-2 border border-[#E2E8F0] bg-white text-on-surface text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
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
