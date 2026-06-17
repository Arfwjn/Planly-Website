/**
 * =============================================================================
 * Planly — AttendanceScanner.tsx
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
import { createPortal } from 'react-dom';
import { X, Globe, CheckCircle2, RefreshCw } from 'lucide-react';
import { ProcessedCourse } from '../../utils/reschedule';
import { useToast } from '../ui/Toast';
import { useFaceScanner } from '../../hooks/useFaceScanner';
import FaceScannerCamera from '../ui/FaceScannerCamera';
import { verifyFaceSimilarity } from '../../services/biometrics/faceBiometricService';
import * as faceapi from '@vladmandic/face-api';

interface AttendanceScannerProps {
  isOpen: boolean;
  activeCourse: ProcessedCourse;
  onClose: () => void;
  onSubmit: (photoBase64: string, coords: { latitude: number; longitude: number } | null) => Promise<void>;
}

export default function AttendanceScanner({
  isOpen,
  activeCourse,
  onClose,
  onSubmit
}: AttendanceScannerProps) {
  const toast = useToast();

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Initialize custom scanner hook
  const {
    cameraActive,
    scanProgress,
    statusText,
    setStatusText,
    scanStatus,
    setScanStatus,
    errorMessage,
    setErrorMessage,
    videoRef,
    canvasRef,
    startScanning,
    stopScanning,
    captureFullPhoto
  } = useFaceScanner({
    onScanComplete: async (detection) => {
      verifyFace(detection);
    },
    requiredHits: 25
  });

  // Initialize GPS and camera on open
  useEffect(() => {
    if (isOpen) {
      initScanner();
    }
    return () => {
      stopScanning();
    };
  }, [isOpen, activeCourse]);

  const initScanner = async () => {
    setCapturedPhoto(null);
    setGpsCoords(null);

    // 1. Check if user has registered face in localStorage
    const registeredStr = localStorage.getItem('planly_registered_face');
    if (!registeredStr) {
      setScanStatus('failed');
      setErrorMessage('Wajah Anda belum terdaftar di sistem. Silakan daftarkan wajah Anda terlebih dahulu di menu Profil > Akun & Akademik.');
      return;
    }

    // 2. Fetch GPS coordinates
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

    // 3. Start face scanner
    await startScanning();
  };

  const verifyFace = async (
    currentDetection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>
  ) => {
    setScanStatus('verifying');
    setStatusText('Memverifikasi kecocokan wajah...');

    try {
      const registeredStr = localStorage.getItem('planly_registered_face');
      if (!registeredStr) {
        setScanStatus('failed');
        setErrorMessage('Wajah Anda belum terdaftar di sistem. Silakan daftarkan wajah Anda terlebih dahulu di menu Profil.');
        stopScanning();
        return;
      }

      const registeredDescriptor = new Float32Array(JSON.parse(registeredStr));
      const currentDescriptor = currentDetection.descriptor;

      const { match, distance } = verifyFaceSimilarity(currentDescriptor, registeredDescriptor, 0.6);
      console.log('Face Match Distance Score:', distance);

      if (match) {
        // Match success! Capture full mirrored photo
        const photoData = captureFullPhoto();
        if (photoData) {
          setCapturedPhoto(photoData);
        }
        
        setScanStatus('success');
        setStatusText('Verifikasi wajah berhasil!');
        toast.success('Wajah terverifikasi cocok!');

        stopScanning(false);
      } else {
        setScanStatus('failed');
        setErrorMessage('Verifikasi Gagal: Wajah yang terdeteksi tidak cocok dengan profil terdaftar Anda.');
        toast.error('Wajah tidak cocok dengan profil mahasiswa!');
        stopScanning(false);
      }
    } catch (err: any) {
      console.error('Error during face verification:', err);
      setScanStatus('failed');
      setErrorMessage(`Terjadi kesalahan teknis: ${err?.message || 'Gagal memproses kecocokan wajah.'}`);
      stopScanning(false);
    }
  };

  const handleClose = () => {
    stopScanning();
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

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-zoom-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-900/50">
          <div className="text-left">
            <h3 className="text-sm font-extrabold text-on-surface">Verifikasi Kehadiran Wajah</h3>
            <span className="text-[10px] text-on-surface-variant font-bold mt-0.5 block">{activeCourse.course_name}</span>
          </div>
          <button 
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors border-none bg-transparent"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Reusable Camera & Scan overlay */}
        <FaceScannerCamera
          videoRef={videoRef}
          canvasRef={canvasRef}
          cameraActive={cameraActive}
          scanStatus={scanStatus}
          statusText={statusText}
          errorMessage={errorMessage}
          capturedPhoto={capturedPhoto}
          onRetry={initScanner}
        />

        {/* Progress & GPS info footer */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              <span>
                {scanStatus === 'scanning' 
                  ? 'Memindai Struktur Wajah' 
                  : scanStatus === 'success' 
                  ? 'Verifikasi Wajah Cocok' 
                  : scanStatus === 'loading_models' 
                  ? 'Memuat AI Model' 
                  : scanStatus === 'verifying' 
                  ? 'Menganalisis Kemiripan' 
                  : 'Verifikasi Gagal'}
              </span>
              <span className="font-mono">{scanProgress}%</span>
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

          {/* GPS Location status */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-1.5">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              Sensor Geopotensial GPS
            </div>
            {gpsCoords ? (
              <p className="text-xs text-on-surface font-semibold">
                Koordinat presensi: {gpsCoords.latitude.toFixed(6)}, {gpsCoords.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 italic font-medium">
                Sedang melacak koordinat GPS...
              </p>
            )}
          </div>

          {/* Action buttons */}
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
              className="flex-1 py-2.5 bg-primary hover:bg-[#4F46E5] disabled:bg-slate-250 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:cursor-not-allowed transition-all border-none"
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
    </div>,
    document.body
  );
}
