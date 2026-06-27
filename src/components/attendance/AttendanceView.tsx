/**
 * =============================================================================
 * Planly — AttendanceView.tsx
 * 
 * Kegunaan:
 * Komponen modul presensi/kehadiran mahasiswa memanfaatkan penangkapan swafoto kamera web & geolokasi GPS.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan AttendanceView.tsx (orkestrator) dan menyalurkan data ke attendanceService.
 * 
 * Aliran Data / State:
 * - Membaca video stream kamera web browser, mengambil koordinat GPS peramban, lalu mengirim payload absensi ke API.
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import { Camera, Clock, MapPin, CheckCircle2, Lock, UserCheck, Calendar, X, Globe } from 'lucide-react';
import { Course, RescheduledSession, AttendanceRecord, AttendanceSubmitPayload, SidebarTab } from '../../types';
import { getCoursesForDate, ProcessedCourse } from '../../utils/reschedule';
import { useToast } from '../ui/Toast';
import ConfirmModal from '../ui/ConfirmModal';
import AttendanceScanner from './AttendanceScanner';
import AttendanceHistoryTable from './AttendanceHistoryTable';
import AttendanceRecapGrid from './AttendanceRecapGrid';
import EmptyState from '../ui/InteractiveEmptyState';
import Skeleton from '../ui/Skeleton';

interface AttendanceViewProps {
  courses: Course[];
  rescheduledSessions: RescheduledSession[];
  attendanceRecords: AttendanceRecord[];
  onSubmitAttendance: (payload: AttendanceSubmitPayload) => Promise<AttendanceRecord>;
  onDeleteAttendance: (id: number) => Promise<void>;
  onTabChange?: (tab: SidebarTab) => void;
  loading?: boolean;
}

/**
 * Komponen AttendanceView (Orkestrator)
 * 
 * Halaman utama presensi kuliah.
 * Tanggung jawab:
 * - Sinkronisasi waktu sistem (Live Clock).
 * - Mendeteksi jadwal perkuliahan aktif hari ini (peka terhadap reschedule / pembatalan kelas).
 * - Menangani status tab menu (Absen Mandiri vs Rekap Kehadiran).
 * - Menampilkan dialog konfirmasi penghapusan rekaman presensi (`ConfirmModal`).
 * - Menyajikan modal detail foto jepretan presensi masuk.
 */
export default function AttendanceView({
  courses,
  rescheduledSessions,
  attendanceRecords,
  onSubmitAttendance,
  onDeleteAttendance,
  onTabChange,
  loading = false
}: AttendanceViewProps) {
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-44 h-9 rounded-lg" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="w-3/4 sm:w-[500px] h-4 rounded-md" />
          </div>
          {/* Jam Digital Widget */}
          <div className="w-[140px] h-[46px] rounded-xl flex items-center bg-[#F1F5F9] dark:bg-slate-800 px-4 py-2.5 border border-transparent self-start sm:self-auto flex-shrink-0">
            <div className="flex-1 space-y-1">
              <Skeleton className="w-10 h-2 rounded-sm" />
              <Skeleton className="w-16 h-4 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Navigasi Tabs */}
        <div className="flex border-b border-[#E2E8F0] dark:border-slate-800/80 gap-6 pb-3">
          <Skeleton className="w-28 h-5 rounded-md" />
          <Skeleton className="w-28 h-5 rounded-md" />
        </div>

        {/* Content Area Skeleton */}
        <div className="space-y-6">
          {/* Card Matakuliah Aktif */}
          <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-8 shadow-sm flex flex-col gap-6">
            <Skeleton className="w-44 h-5 rounded-full" />
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="w-20 h-3 rounded-sm" />
                  <Skeleton className="w-2/3 h-6 rounded-md" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="w-16 h-3 rounded-sm" />
                    <Skeleton className="w-32 h-4 rounded-sm" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-16 h-3 rounded-sm" />
                    <Skeleton className="w-32 h-4 rounded-sm" />
                  </div>
                </div>
              </div>
              <Skeleton className="w-full md:w-40 h-12 rounded-xl" />
            </div>
          </div>

          {/* History/Tabel Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="w-32 h-6 rounded-md" />
              <Skeleton className="w-48 h-8 rounded-lg" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex gap-4">
                <Skeleton className="w-1/4 h-4 rounded-sm" />
                <Skeleton className="w-1/4 h-4 rounded-sm" />
                <Skeleton className="w-1/4 h-4 rounded-sm" />
                <Skeleton className="w-1/4 h-4 rounded-sm" />
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-1/4 h-4 rounded-sm" />
                    <Skeleton className="w-1/4 h-4 rounded-sm" />
                    <Skeleton className="w-1/4 h-4 rounded-sm" />
                    <Skeleton className="w-1/4 h-4 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'checkin' | 'recap'>('checkin');
  const [now, setNow] = useState(new Date());
  
  // States Modal & Konfirmasi
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);
  const [activeCourseForCheckin, setActiveCourseForCheckin] = useState<ProcessedCourse | null>(null);
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<string | null>(null);

  // Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const getTodayDateStr = () => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDateStr = getTodayDateStr();
  const { dayCoursesProcessed } = getCoursesForDate(todayDateStr, courses, rescheduledSessions);

  // Dapatkan seluruh kelas kuliah yang sedang aktif berlangsung saat ini
  const getActiveCourses = (): ProcessedCourse[] => {
    const todayTime = now.getHours() * 60 + now.getMinutes();
    const active: ProcessedCourse[] = [];

    for (const course of dayCoursesProcessed) {
      if (course.is_canceled) continue;

      const [startH, startM] = course.start_time.split(':').map(Number);
      const [endH, endM] = course.end_time.split(':').map(Number);

      const startTimeMinutes = startH * 60 + startM;
      const endTimeMinutes = endH * 60 + endM;

      if (todayTime >= startTimeMinutes && todayTime <= endTimeMinutes) {
        active.push(course);
      }
    }
    return active;
  };

  const activeCourses = getActiveCourses();

  // Cek apakah mahasiswa sudah melakukan absen pada hari ini untuk mata kuliah tertentu
  const checkIfCheckedIn = (courseId: number) => {
    return attendanceRecords.some(
      r => r.course_id === courseId && r.date === todayDateStr && r.status === 'Hadir'
    );
  };

  // Pemicu submit absensi dari scanner sub-component
  const handleScannerSubmit = async (photoBase64: string, coords: { latitude: number; longitude: number } | null) => {
    if (!activeCourseForCheckin) return;

    const nowTime = new Date();
    const timeStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}:${String(nowTime.getSeconds()).padStart(2, '0')}`;

    const payload: AttendanceSubmitPayload = {
      course_id: activeCourseForCheckin.id,
      course_code: activeCourseForCheckin.course_code,
      course_name: activeCourseForCheckin.course_name,
      date: todayDateStr,
      time: timeStr,
      status: 'Hadir',
      latitude: coords ? coords.latitude : null,
      longitude: coords ? coords.longitude : null,
      image_base64: photoBase64
    };

    try {
      await onSubmitAttendance(payload);
      toast.success(`Absensi ${activeCourseForCheckin.course_name} berhasil dicatat.`);
      setIsScannerOpen(false);
    } catch (err) {
      // Ditangani oleh parent callback / logger
    }
  };

  // Konfirmasi penghapusan riwayat absensi
  const handleConfirmDelete = async () => {
    if (deleteRecordId !== null) {
      try {
        await onDeleteAttendance(deleteRecordId);
        toast.success("Riwayat absensi berhasil dihapus.");
      } catch (err) {
        toast.error("Gagal menghapus riwayat absensi.");
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteRecordId(null);
      }
    }
  };

  const formatIndonesianDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatClock = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} WIB`;
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
              <UserCheck className="w-8 h-8 text-primary" />
              <span>Absensi Kuliah</span>
            </h1>
            <span className="bg-primary/10 text-primary dark:bg-primary/20 text-xs px-2.5 py-1 rounded-full font-semibold">
              {attendanceRecords.length} Presensi
            </span>
          </div>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Lakukan presensi kuliah harian secara real-time dengan verifikasi sensor wajah dan lokasi GPS.
          </p>
        </div>

        {/* Jam Digital Real-time */}
        <div className="flex items-center gap-3 bg-[#F1F5F9] dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-transparent self-start sm:self-auto flex-shrink-0">
          <Clock className="w-5 h-5 text-primary animate-pulse" />
          <div className="text-left font-sans">
            <span className="block text-[9px] font-black text-[#94A3B8] dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Waktu Sistem</span>
            <span className="block text-xs font-black text-on-surface leading-none">{formatClock(now)}</span>
          </div>
        </div>
      </div>

      {/* Navigasi Tabs */}
      <div className="flex border-b border-[#E2E8F0] dark:border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'checkin' 
              ? 'text-primary font-bold' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Absensi Hari Ini</span>
          {activeTab === 'checkin' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('recap')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'recap' 
              ? 'text-primary font-bold' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Rekap Kehadiran</span>
          {activeTab === 'recap' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* --- TAB ABSEN MANDIRI --- */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          {activeCourses.length > 0 ? (
            <div className="space-y-4">
              {activeCourses.map((course) => {
                const isCourseAlreadyCheckedIn = checkIfCheckedIn(course.id);
                return (
                  <div key={course.id} className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                    <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase tracking-wider mb-4 border border-emerald-500/20 animate-pulse">
                      Kelas Kuliah Aktif {course.is_rescheduled_in && '(Kelas Pengganti)'}
                    </span>
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">Mata Kuliah</span>
                          <h2 className="text-xl font-bold text-on-surface mt-1">
                            {course.course_name} <span className="text-xs font-semibold text-on-surface-variant">({course.course_code})</span>
                          </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2.5 text-xs font-medium text-on-surface-variant">
                            <Clock className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                            <span>Jam Kuliah: <strong className="text-on-surface">{course.start_time} - {course.end_time}</strong></span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-medium text-on-surface-variant">
                            <MapPin className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                            <span>Ruangan: <strong className="text-on-surface">{course.room}</strong></span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-medium text-on-surface-variant">
                            <UserCheck className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                            <span>Dosen: <strong className="text-on-surface">{course.lecturer_name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-medium text-on-surface-variant">
                            <Calendar className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                            <span>Hari Ini: <strong className="text-on-surface">{formatIndonesianDate(now)}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Tombol scan absensi wajah */}
                      <div className="flex-shrink-0 self-start md:self-center">
                        {isCourseAlreadyCheckedIn ? (
                          <div className="flex flex-col items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-105 dark:border-emerald-900/30 p-5 rounded-2xl text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Sudah Presensi</span>
                            <span className="text-[10px] text-on-surface-variant font-medium">Hadir pukul {attendanceRecords.find(r => r.course_id === course.id && r.date === todayDateStr)?.time || ''}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveCourseForCheckin(course);
                              setIsScannerOpen(true);
                            }}
                            className="px-6 py-3 bg-primary hover:bg-[#4F46E5] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <Camera className="w-4.5 h-4.5" />
                            <span>Mulai Presensi Wajah</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Locked Container */
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              <EmptyState
                icons={[
                  <Clock className="w-5 h-5" />,
                  <Lock className="w-5 h-5" />,
                  <UserCheck className="w-5 h-5" />,
                ]}
                title="Absensi Belum Dibuka"
                description="Tidak ada jadwal kuliah aktif yang sedang berlangsung saat ini. Fitur presensi wajah hanya dapat diakses saat jam perkuliahan berjalan."
              />

              {/* Rincian kelas hari ini */}
              <div className="w-full text-left bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 p-4 rounded-xl space-y-3 shadow-xs">
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Jadwal Kuliah Hari Ini ({formatIndonesianDate(now)})
                </span>
                {dayCoursesProcessed.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic py-1 text-center font-medium">
                    Tidak ada jadwal kuliah yang dijadwalkan untuk hari ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dayCoursesProcessed.map((course) => (
                      <div key={course.id} className="text-xs flex justify-between items-center py-2 px-2.5 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/40 dark:border-slate-800/40 rounded-lg">
                        <div>
                          <strong className="text-on-surface block font-bold">{course.course_name}</strong>
                          <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">
                            Dosen: {course.lecturer_name} • Ruang: {course.room}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold block">
                            {course.start_time} - {course.end_time}
                          </span>
                          {course.is_canceled && (
                            <span className="text-[8px] font-bold text-red-500 uppercase mt-0.5 block">Dibatalkan</span>
                          )}
                          {course.is_rescheduled_in && (
                            <span className="text-[8px] font-bold text-amber-500 uppercase mt-0.5 block">Pindahan</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabel Riwayat */}
          <AttendanceHistoryTable
            attendanceRecords={attendanceRecords}
            onDeleteClick={(id) => {
              setDeleteRecordId(id);
              setIsDeleteModalOpen(true);
            }}
            onPreviewPhoto={setSelectedPhotoForPreview}
          />
        </div>
      )}

      {/* --- TAB REKAP KEHADIRAN --- */}
      {activeTab === 'recap' && (
        <AttendanceRecapGrid
          courses={courses}
          attendanceRecords={attendanceRecords}
          onTabChange={onTabChange}
        />
      )}

      {/* Modal Preview Foto */}
      {selectedPhotoForPreview && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhotoForPreview(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhotoForPreview(null)}
              className="absolute top-2 right-2 p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full cursor-pointer text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-primary" />
              Verifikasi Foto Wajah Absensi
            </h4>
            <img 
              src={selectedPhotoForPreview} 
              alt="Snapshot Hasil Deteksi Wajah" 
              className="w-full aspect-video object-cover rounded-xl border border-slate-100 dark:border-slate-850" 
            />
          </div>
        </div>
      )}

      {/* Camera Face Scanner Modal */}
      {isScannerOpen && activeCourseForCheckin && (
        <AttendanceScanner
          isOpen={isScannerOpen}
          activeCourse={activeCourseForCheckin}
          onClose={() => {
            setIsScannerOpen(false);
            setActiveCourseForCheckin(null);
          }}
          onSubmit={handleScannerSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteRecordId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Presensi"
        message="Apakah Anda yakin ingin menghapus riwayat presensi masuk ini? Penghapusan ini memungkinkan Anda melakukan absen ulang untuk kelas terkait."
        confirmText="Hapus"
        cancelText="Batal"
        isDanger={true}
      />

    </div>
  );
}
