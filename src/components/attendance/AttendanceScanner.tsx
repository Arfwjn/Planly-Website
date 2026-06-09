import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Globe, Check, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ProcessedCourse } from '../../utils/reschedule';

interface AttendanceScannerProps {
  isOpen: boolean;
  activeCourse: ProcessedCourse;
  onClose: () => void;
  onSubmit: (photoBase64: string, coords: { latitude: number; longitude: number } | null) => Promise<void>;
}

/**
 * Komponen AttendanceScanner
 * 
 * Modal dialog khusus untuk memindai wajah (Face Detection simulator) dan merekam koordinat lokasi (GPS).
 * Logika internal:
 * - Meminta izin kamera (`navigator.mediaDevices.getUserMedia`) dan menampilkan umpan video.
 * - Meminta izin GPS (`navigator.geolocation.getCurrentPosition`).
 * - Menjalankan progress bar animasi scan wajah selama 2 detik, lalu menjepret snapshot foto base64.
 * - Mengirimkan data foto dan lokasi ke parent component via callback `onSubmit`.
 */
export default function AttendanceScanner({
  isOpen,
  activeCourse,
  onClose,
  onSubmit
}: AttendanceScannerProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Jalankan inisialisasi stream kamera dan GPS saat scanner dibuka
  useEffect(() => {
    if (isOpen) {
      initScanner();
    }
    return () => {
      cleanupScanner();
    };
  }, [isOpen, activeCourse]);

  // Mengikat stream kamera ke video element setelah stream didapat
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error("Gagal memutar video stream:", err);
      });
    }
  }, [cameraStream]);

  const initScanner = async () => {
    setScanProgress(0);
    setScanStatus('idle');
    setCapturedPhoto(null);
    setGpsCoords(null);

    // 1. Ambil data GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Gagal melacak GPS:", error);
        }
      );
    }

    // 2. Ambil Umpan Kamera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setCameraStream(stream);
      setScanStatus('scanning');

      // Simulasi pemindaian target selama 2 detik (10 interval @200ms)
      let progress = 0;
      const interval = window.setInterval(() => {
        progress += 10;
        setScanProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          captureSnapshot(stream);
        }
      }, 200);
      scanIntervalRef.current = interval;
    } catch (err) {
      console.error("Kamera diblokir atau rusak:", err);
      setScanStatus('failed');
    }
  };

  const captureSnapshot = (stream: MediaStream) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;

        // Ambil frame cermin (mirroring) agar terasa alami seperti cermin wajah
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/png');
        setCapturedPhoto(photoData);
        setScanStatus('success');
        
        // Matikan sensor kamera untuk hemat daya setelah jepretan berhasil
        stream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  const cleanupScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleClose = () => {
    cleanupScanner();
    onClose();
  };

  const handleSendAttendance = async () => {
    if (!capturedPhoto) return;
    setLoadingSubmit(true);
    try {
      await onSubmit(capturedPhoto, gpsCoords);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-205 dark:border-slate-800 animate-zoom-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-sm font-extrabold text-on-surface">Pemindai Wajah Presensi</h3>
            <span className="text-[10px] text-on-surface-variant font-bold mt-0.5 block">{activeCourse.course_name}</span>
          </div>
          <button 
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Video Feed / Snapshot Area */}
        <div className="relative bg-slate-950 aspect-video w-full overflow-hidden flex items-center justify-center">
          {/* Overlay Target Pindai Animasi */}
          {scanStatus === 'scanning' && (
            <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
              {/* Target Scan Ring */}
              <div className="w-40 h-40 rounded-full border-4 border-dashed border-primary/70 animate-[spin_20s_linear_infinite] flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-2 border-primary/40" />
              </div>
              {/* Scanline laser */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-85 animate-[bounce_3s_infinite]" />
            </div>
          )}

          {/* Cincin sukses jepret */}
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

          {/* Hasil Jepretan */}
          {capturedPhoto && (
            <img 
              src={capturedPhoto} 
              alt="Snapshot wajah" 
              className="w-full h-full object-cover" 
            />
          )}

          {scanStatus === 'failed' && (
            <div className="p-4 text-xs text-red-500 font-semibold text-center bg-slate-900/80 absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span>Gagal mengakses kamera. Harap periksa izin akses browser Anda.</span>
              <button 
                onClick={initScanner}
                className="px-3 py-1 bg-red-600 text-white rounded-md mt-1 cursor-pointer font-bold"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Canvas Tersembunyi */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Progress & GPS info footer */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              <span>
                {scanStatus === 'scanning' ? 'Memindai Struktur Wajah' : scanStatus === 'success' ? 'Wajah Berhasil Diverifikasi' : 'Gagal memindai'}
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

          {/* Informasi Geolocation GPS */}
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

          {/* Tombol kirim presensi */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-on-surface-variant font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white dark:bg-slate-900"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={scanStatus !== 'success' || loadingSubmit}
              onClick={handleSendAttendance}
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
  );
}
