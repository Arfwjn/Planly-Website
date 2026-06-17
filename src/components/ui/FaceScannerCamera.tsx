/**
 * =============================================================================
 * Planly — FaceScannerCamera.tsx
 * 
 * Kegunaan:
 * Komponen antarmuka (UI) umum reusable (CustomSelect, DatePicker, Skeleton loader, alert toast, EmptyState, dll.).
 * 
 * Relasi & Dependency:
 * - Digunakan berulang kali (shared components) oleh berbagai modul halaman View di aplikasi.
 * 
 * Aliran Data / State:
 * - Menerima props input, trigger event handler, dan mengontrol transisi visual antarmuka agar konsisten.
 * =============================================================================
 */

import React from 'react';
import { Loader2, AlertTriangle, Check } from 'lucide-react';

interface FaceScannerCameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraActive: boolean;
  scanStatus: 'idle' | 'loading_models' | 'scanning' | 'verifying' | 'success' | 'failed';
  statusText: string;
  errorMessage: string | null;
  capturedPhoto?: string | null;
  onRetry?: () => void;
}

export default function FaceScannerCamera({
  videoRef,
  canvasRef,
  cameraActive,
  scanStatus,
  statusText,
  errorMessage,
  capturedPhoto,
  onRetry
}: FaceScannerCameraProps) {
  const showLoader = (scanStatus === 'idle' || scanStatus === 'loading_models' || scanStatus === 'verifying') ||
                     (scanStatus === 'scanning' && !cameraActive);
  const showVideoAndCanvas = (scanStatus === 'scanning' || scanStatus === 'verifying') && cameraActive;
  
  return (
    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden w-full">
      {/* 1. Loader Overlay (Model AI Loading / Camera Activation / Verification) */}
      {showLoader && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 text-slate-350 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs font-semibold">{statusText}</span>
        </div>
      )}

      {/* 2. Success Verification Screen (Green Ripple Ring Overlay) */}
      {scanStatus === 'success' && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-emerald-500/10">
          <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-emerald-500 flex items-center justify-center scale-105 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Check className="w-7 h-7 text-emerald-500 stroke-[3px]" />
            </div>
          </div>
        </div>
      )}

      {/* 3. HTML5 Video Feed & Overlay Canvas */}
      {showVideoAndCanvas && (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none z-10"
          />
        </>
      )}

      {/* 4. Scanning target overlay with glowing laser sweep line */}
      {scanStatus === 'scanning' && cameraActive && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="w-44 h-44 sm:w-52 sm:h-52 border border-white/20 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-30" />
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent shadow-[0_0_8px_#6366F1] top-1/2 -translate-y-1/2 animate-scan-line pointer-events-none" />
          </div>
        </div>
      )}

      {/* 5. Captured image layout (used when scanning succeeds) */}
      {capturedPhoto && scanStatus === 'success' && (
        <img
          src={capturedPhoto}
          alt="Snapshot wajah terverifikasi"
          className="w-full h-full object-cover z-25 absolute inset-0"
        />
      )}

      {/* 6. Error & Failure Screen Overlay */}
      {scanStatus === 'failed' && (
        <div className="p-6 text-xs text-red-500 font-semibold text-center bg-slate-950/95 absolute inset-0 flex flex-col items-center justify-center gap-3 z-40">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
          <span className="leading-relaxed max-w-[280px]">{errorMessage}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl mt-2 cursor-pointer font-bold border-none transition-colors"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
