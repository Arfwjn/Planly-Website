import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Clock, MapPin, CheckCircle2, Lock, UserCheck, 
  AlertCircle, ShieldAlert, Globe, RefreshCw, FileSpreadsheet, 
  History, Calendar, Award, TrendingUp, X, Check, Eye,
  ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { Course, RescheduledSession, AttendanceRecord, AttendanceSubmitPayload } from '../types';
import { getCoursesForDate, ProcessedCourse } from '../utils/reschedule';
import { useToast } from './ui/Toast';
import ConfirmModal from './ui/ConfirmModal';

interface AttendanceViewProps {
  courses: Course[];
  rescheduledSessions: RescheduledSession[];
  attendanceRecords: AttendanceRecord[];
  onSubmitAttendance: (payload: AttendanceSubmitPayload) => Promise<AttendanceRecord>;
  onDeleteAttendance: (id: number) => Promise<void>;
}

export default function AttendanceView({
  courses,
  rescheduledSessions,
  attendanceRecords,
  onSubmitAttendance,
  onDeleteAttendance
}: AttendanceViewProps) {
  const toast = useToast();
  
  // --- TABS & CLOCK STATES ---
  const [activeTab, setActiveTab] = useState<'checkin' | 'recap'>('checkin');
  const [now, setNow] = useState(new Date());

  // --- CAMERA SCANNER STATES ---
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);
  const [activeCourseForCheckin, setActiveCourseForCheckin] = useState<ProcessedCourse | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<string | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // --- PAGINATION STATES & CALCULATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = attendanceRecords.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when records length changes (e.g. deletion)
  useEffect(() => {
    const pages = Math.ceil(attendanceRecords.length / itemsPerPage);
    if (currentPage > pages && pages > 0) {
      setCurrentPage(pages);
    }
  }, [attendanceRecords.length, currentPage]);

  // Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Mengikat stream kamera ke video element setelah DOM ter-render
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error("Gagal memutar video stream:", err);
      });
    }
  }, [cameraStream]);

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (deleteRecordId !== null) {
      onDeleteAttendance(deleteRecordId);
    }
  };

  // --- 1. PROSES JADWAL DAN DETEKSI KELAS AKTIF ---
  const getTodayDateStr = () => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDateStr = getTodayDateStr();
  const { dayCoursesProcessed } = getCoursesForDate(todayDateStr, courses, rescheduledSessions);

  // Cari kelas-kelas yang sedang aktif saat ini
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

  // Cek apakah kelas aktif sudah diabsen hari ini
  const checkIfCheckedIn = (courseId: number) => {
    return attendanceRecords.some(
      r => r.course_id === courseId && r.date === todayDateStr && r.status === 'Hadir'
    );
  };

  // --- FORMATTER HELPERS ---
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

  // --- 2. WEBCAM & GEOLOCATION CONTROLS (SKELETON FOR ISSUE 4) ---
  const handleStartScanner = async (course: ProcessedCourse) => {
    setActiveCourseForCheckin(course);
    setScanProgress(0);
    setScanStatus('idle');
    setCapturedPhoto(null);
    setGpsCoords(null);
    setIsScannerOpen(true);

    // Request GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Gagal mendapatkan koordinat GPS:", error);
          toast.info("Akses lokasi dibatasi. Absensi tetap berjalan tanpa koordinat lokasi.");
        }
      );
    }

    // Request Kamera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setCameraStream(stream);
      
      // Mulai simulasi scan
      setScanStatus('scanning');
      let progress = 0;
      const interval = window.setInterval(() => {
        progress += 10;
        setScanProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          handleCaptureSnapshot(stream);
        }
      }, 200);
      scanIntervalRef.current = interval;

    } catch (err) {
      toast.error("Gagal mengakses kamera. Harap izinkan kamera di browser Anda.");
      setIsScannerOpen(false);
    }
  };

  const handleCaptureSnapshot = (stream: MediaStream) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        // Ambil frame cermin (mirroring)
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/png');
        setCapturedPhoto(photoData);
        setScanStatus('success');
        
        // Stop camera tracks
        stream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  const handleCloseScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScannerOpen(false);
    setActiveCourseForCheckin(null);
  };

  const handleSubmitAttendanceRecord = async () => {
    if (!activeCourseForCheckin || !capturedPhoto) return;

    setLoadingSubmit(true);
    const nowTime = new Date();
    const timeStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}:${String(nowTime.getSeconds()).padStart(2, '0')}`;

    const payload: AttendanceSubmitPayload = {
      course_id: activeCourseForCheckin.id,
      course_code: activeCourseForCheckin.course_code,
      course_name: activeCourseForCheckin.course_name,
      date: todayDateStr,
      time: timeStr,
      status: 'Hadir',
      latitude: gpsCoords ? gpsCoords.latitude : null,
      longitude: gpsCoords ? gpsCoords.longitude : null,
      image_base64: capturedPhoto
    };

    try {
      await onSubmitAttendance(payload);
      toast.success(`Absensi ${activeCourseForCheckin.course_name} berhasil dicatat.`);
      setIsScannerOpen(false);
    } catch (err) {
      // toast.error ditangani di parent callback
    } finally {
      setLoadingSubmit(false);
    }
  };

  // --- 3. REKAPITULASI STATS CALCULATION ---
  const calculateRecapStats = () => {
    const targetSessions = 14; // Target pertemuan semester
    return courses.map(course => {
      const courseRecords = attendanceRecords.filter(r => r.course_id === course.id);
      const attendedCount = courseRecords.filter(r => r.status === 'Hadir').length;
      const sickCount = courseRecords.filter(r => r.status === 'Sakit').length;
      const permittedCount = courseRecords.filter(r => r.status === 'Izin').length;
      const absentCount = courseRecords.filter(r => r.status === 'Alpha').length;

      const attendanceRate = targetSessions > 0 ? (attendedCount / targetSessions) * 100 : 0;
      
      return {
        ...course,
        attendedCount,
        sickCount,
        permittedCount,
        absentCount,
        attendanceRate,
        isWarning: attendanceRate < 75
      };
    });
  };

  const recapStats = calculateRecapStats();

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
      {/* Header Halaman */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" />
            Absensi Kuliah
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed max-w-xl">
            Lakukan presensi kuliah harian secara real-time dengan verifikasi sensor wajah (Face Detector) dan koordinat lokasi kampus (Geolocation).
          </p>
        </div>

        {/* Live Clock Badge */}
        <div className="flex items-center gap-3 bg-primary/10 px-4 py-2.5 rounded-xl border border-primary/20 self-start md:self-auto flex-shrink-0">
          <Clock className="w-5 h-5 text-primary animate-pulse" />
          <div className="text-left">
            <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">Waktu Sistem</span>
            <span className="block text-xs font-bold text-on-surface">{formatClock(now)}</span>
          </div>
        </div>
      </section>

      {/* Tabs Menu Navigasi */}
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
          <span>Absen Mandiri</span>
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
          <FileSpreadsheet className="w-4 h-4" />
          <span>Rekap Kehadiran</span>
          {activeTab === 'recap' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* --- TAB CONTENT: ABSEN MANDIRI --- */}
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

                      <div className="flex-shrink-0 self-start md:self-center">
                        {isCourseAlreadyCheckedIn ? (
                          <div className="flex flex-col items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Sudah Presensi</span>
                            <span className="text-[10px] text-on-surface-variant font-medium">Hadir pukul {attendanceRecords.find(r => r.course_id === course.id && r.date === todayDateStr)?.time || ''}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartScanner(course)}
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
            // LELOCKING / LOCKED CONTAINER
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-[#E2E8F0] dark:border-slate-800/60 rounded-2xl p-10 text-center flex flex-col justify-center items-center max-w-2xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-700">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Absensi Belum Dibuka</h3>
              <p className="text-xs text-on-surface-variant max-w-[420px] mb-6 leading-relaxed font-semibold">
                Tidak ada jadwal kuliah aktif yang sedang berlangsung saat ini. Fitur presensi wajah hanya dapat diakses saat jam perkuliahan berjalan.
              </p>

              {/* Tampilkan agenda perkuliahan hari ini agar mahasiswa tahu jadwal berikutnya */}
              <div className="w-full text-left bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 p-4 rounded-xl space-y-3">
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

          {/* TABEL RIWAYAT PRESENSI HARI INI & SEBELUMNYA */}
          <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <History className="w-4 h-4 text-primary" />
              Riwayat Presensi Masuk
            </h3>

            {attendanceRecords.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic py-8 text-center font-medium">
                Belum ada riwayat presensi yang terekam di sistem.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-slate-800 text-on-surface-variant font-bold">
                      <th className="py-2.5 px-3">Mata Kuliah</th>
                      <th className="py-2.5 px-3">Tanggal & Waktu</th>
                      <th className="py-2.5 px-3">Lokasi GPS</th>
                      <th className="py-2.5 px-3 text-center">Foto Wajah</th>
                      <th className="py-2.5 px-3 text-right">Status & Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record) => (
                      <tr key={record.id} className="border-b border-[#F1F5F9] dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 px-3">
                          <strong className="text-on-surface block font-bold">{record.course_name}</strong>
                          <span className="text-[10px] text-on-surface-variant font-semibold mt-0.5 block">{record.course_code}</span>
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant font-medium">
                          <span className="block">{record.date}</span>
                          <span className="block text-[10px] text-[#94A3B8] font-bold mt-0.5">{record.time}</span>
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant">
                          {record.latitude && record.longitude ? (
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="text-primary hover:underline font-semibold flex items-center gap-1"
                              title="Lihat di Google Maps"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>{record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}</span>
                            </a>
                          ) : (
                            <span className="text-[#94A3B8] font-semibold italic">Tidak ada lokasi</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {record.image_base64 ? (
                            <div className="inline-block relative group">
                              <img 
                                src={record.image_base64} 
                                alt="Verifikasi Wajah" 
                                className="w-9 h-9 object-cover rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform" 
                              />
                              <button
                                onClick={() => setSelectedPhotoForPreview(record.image_base64)}
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                aria-label="Lihat Foto Detail"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-semibold italic">No Photo</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] border border-emerald-500/10">
                              <Check className="w-3 h-3" /> {record.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteRecordId(record.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                              title="Hapus Presensi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 text-xs font-semibold text-on-surface-variant select-none">
                    <div className="flex items-center gap-1.5">
                      <span>Halaman</span>
                      <strong className="text-on-surface">{currentPage}</strong>
                      <span>dari</span>
                      <strong className="text-on-surface">{totalPages}</strong>
                      <span className="text-[10px] text-[#94A3B8] font-bold">({attendanceRecords.length} Riwayat)</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                      </button>
                      
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
                        title="Halaman Berikutnya"
                      >
                        <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: REKAP KEHADIRAN --- */}
      {activeTab === 'recap' && (
        <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 pb-2">
              <Award className="w-4.5 h-4.5 text-primary" />
              Persentase Kehadiran per Mata Kuliah
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium">
              SIAKAD menetapkan syarat minimal **75% kehadiran** (minimal 11 kali hadir dari 14 pertemuan) agar mahasiswa berhak mengikuti Ujian Akhir Semester (UAS).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recapStats.map((stat) => (
              <div 
                key={stat.id} 
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                  stat.isWarning 
                    ? 'bg-red-500/[0.02] border-red-500/20 dark:border-red-500/10' 
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-[#E2E8F0] dark:border-slate-800/60'
                }`}
              >
                <div className="space-y-3 min-w-0 flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface truncate">{stat.course_name}</h4>
                    <span className="text-[10px] text-on-surface-variant font-bold block mt-0.5">{stat.course_code} • {stat.sks} SKS</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Hadir: {stat.attendedCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Sakit/Izin: {stat.sickCount + stat.permittedCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Alpha: {stat.absentCount}
                    </span>
                  </div>

                  {stat.isWarning && (
                    <div className="flex items-start gap-1 bg-red-500/10 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-500/10 text-[9px] font-bold leading-normal">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>Kehadiran di bawah 75%! Terancam tidak dapat mengikuti UAS.</span>
                    </div>
                  )}
                </div>

                {/* Radial Progress Ring */}
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800/80"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={stat.isWarning ? "text-red-500" : "text-primary"}
                      strokeWidth="3.5"
                      strokeDasharray={`${stat.attendanceRate}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-[10px] font-extrabold text-on-surface">
                    {Math.round(stat.attendanceRate)}%
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL DIALOG PREVIEW FOTO JEPRETAN --- */}
      {selectedPhotoForPreview && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoForPreview(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhotoForPreview(null)}
              className="absolute top-2 right-2 p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full cursor-pointer text-on-surface"
              aria-label="Tutup Detail Foto"
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
              className="w-full aspect-video object-cover rounded-xl border border-slate-100 dark:border-slate-800" 
            />
          </div>
        </div>
      )}

      {/* --- MODAL DIALOG: PEMINDAI KAMERA WAJAH (SKELETON & STREAM CONTAINER) --- */}
      {isScannerOpen && activeCourseForCheckin && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={handleCloseScanner}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-zoom-in text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Pemindai Wajah Presensi</h3>
                <span className="text-[10px] text-on-surface-variant font-bold mt-0.5 block">{activeCourseForCheckin.course_name}</span>
              </div>
              <button 
                onClick={handleCloseScanner}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
                aria-label="Tutup Pemindai"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Video Feed / Snapshot Container */}
            <div className="relative bg-slate-950 aspect-video w-full overflow-hidden flex items-center justify-center">
              {/* Target Scan Overlay Frame */}
              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
                  {/* Glowing Target Ring */}
                  <div className="w-40 h-40 rounded-full border-4 border-dashed border-primary/70 animate-[spin_20s_linear_infinite] flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border-2 border-primary/40" />
                  </div>
                  {/* Scanning scanline effect */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-85 animate-[bounce_3s_infinite]" />
                </div>
              )}

              {/* Success target ring */}
              {scanStatus === 'success' && (
                <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-emerald-500/10">
                  <div className="w-40 h-40 rounded-full border-4 border-emerald-500 flex items-center justify-center scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check className="w-7 h-7 text-emerald-500 stroke-[3px]" />
                    </div>
                  </div>
                </div>
              )}

              {/* HTML5 Video Element */}
              {scanStatus === 'scanning' && (
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover transform -scale-x-100"
                  playsInline 
                  muted 
                />
              )}

              {/* Captured Canvas Snapshot */}
              {capturedPhoto && (
                <img 
                  src={capturedPhoto} 
                  alt="Snapshot wajah" 
                  className="w-full h-full object-cover" 
                />
              )}

              {/* Canvas Tersembunyi untuk mengambil frame */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Scanning Status & Progress details */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>
                    {scanStatus === 'scanning' ? 'Memindai Struktur Wajah' : 'Wajah Berhasil Diverifikasi'}
                  </span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      scanStatus === 'success' ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              {/* GPS coordinates status info */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-1.5">
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  Sensor Lokasi (Geolocation)
                </div>
                {gpsCoords ? (
                  <p className="text-xs text-on-surface font-semibold">
                    Koordinat saat ini: {gpsCoords.latitude.toFixed(6)}, {gpsCoords.longitude.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 italic font-medium">
                    Sedang melacak koordinat GPS...
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseScanner}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white dark:bg-slate-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={scanStatus !== 'success' || loadingSubmit}
                  onClick={handleSubmitAttendanceRecord}
                  className="flex-1 py-2.5 bg-primary hover:bg-[#4F46E5] disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:cursor-not-allowed transition-all"
                >
                  {loadingSubmit ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim Presensi</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Presensi */}
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
