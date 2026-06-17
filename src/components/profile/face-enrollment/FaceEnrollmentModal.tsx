/**
 * =============================================================================
 * Planly — FaceEnrollmentModal.tsx
 * 
 * Kegunaan:
 * Komponen konfigurasi Profil pengguna, pencapaian target akademik (IPK/GPA), sinkronisasi kalender OAuth, & backup data.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan ProfileView.tsx (orkestrator), profileService, dan calendarSync.
 * 
 * Aliran Data / State:
 * - Mengambil ringkasan data nilai IPK mahasiswa, kontrol sinkronisasi kalender eksternal, dan ekspor/impor data JSON.
 * =============================================================================
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useFaceScanner } from '../../../hooks/useFaceScanner';
import FaceScannerCamera from '../../ui/FaceScannerCamera';
import * as faceapi from '@vladmandic/face-api';

interface FaceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (
    detection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>,
    croppedPhotoBase64: string | null
  ) => void | Promise<void>;
}

export default function FaceEnrollmentModal({
  isOpen,
  onClose,
  onScanComplete
}: FaceEnrollmentModalProps) {
  const {
    cameraActive,
    scanProgress,
    statusText,
    scanStatus,
    errorMessage,
    videoRef,
    canvasRef,
    startScanning,
    stopScanning,
    captureCroppedFace
  } = useFaceScanner({
    onScanComplete: async (detection, _, box) => {
      const croppedBase64 = captureCroppedFace(box);
      await onScanComplete(detection, croppedBase64);
    },
    requiredHits: 30
  });

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-[#0f0f15]/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-zoom-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#F8FAFC] dark:bg-slate-900/50">
          <div>
            <h4 className="text-sm font-bold text-on-surface">Pendaftaran Biometrik Wajah</h4>
            <p className="text-[10px] text-on-surface-variant font-medium">Posisikan wajah Anda tegak di depan kamera</p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-none bg-transparent"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Video feed & AI Scanner */}
        <FaceScannerCamera
          videoRef={videoRef}
          canvasRef={canvasRef}
          cameraActive={cameraActive}
          scanStatus={scanStatus}
          statusText={statusText}
          errorMessage={errorMessage}
          onRetry={startScanning}
        />

        {/* Info and Progress */}
        <div className="p-6 space-y-4 bg-slate-50 dark:bg-slate-900/30">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>Progres Pemindaian</span>
              <span className="text-primary font-mono">{scanProgress}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-[#6366F1] transition-all duration-200 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-on-surface-variant font-medium bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {scanStatus === 'scanning' && cameraActive ? (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            ) : scanStatus === 'failed' ? (
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            ) : (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
            )}
            <span>{statusText}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface-variant font-bold rounded-xl text-xs cursor-pointer transition-colors bg-white dark:bg-slate-900"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
