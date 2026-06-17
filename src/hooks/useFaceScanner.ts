/**
 * =============================================================================
 * Planly — useFaceScanner.ts
 * 
 * Kegunaan:
 * React custom hook untuk memisahkan logika reaktif & pemantauan state dari komponen UI.
 * 
 * Relasi & Dependency:
 * - Digunakan di App.tsx atau komponen View untuk berbagi logika state bersama.
 * 
 * Aliran Data / State:
 * - Menangani manajemen state lokal, efek sinkronisasi berkala, kalkulasi sisa tenggat waktu, & timer fokus Pomodoro.
 * =============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import {
  loadFaceApiModels,
  detectSingleFaceWithDescriptor,
  drawCustomFaceBrackets
} from '../services/biometrics/faceBiometricService';

interface UseFaceScannerOptions {
  onScanComplete: (
    detection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>,
    video: HTMLVideoElement,
    box: faceapi.Box
  ) => void | Promise<void>;
  requiredHits?: number;
}

export function useFaceScanner({ onScanComplete, requiredHits = 25 }: UseFaceScannerOptions) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menginisialisasi...');
  const [scanStatus, setScanStatus] = useState<'idle' | 'loading_models' | 'scanning' | 'verifying' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // Bind video element to camera stream
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error("Gagal memutar video stream:", err);
      });
    }
  }, [streamRef.current, scanStatus]);

  const startScanning = async () => {
    setScanProgress(0);
    setScanStatus('loading_models');
    setStatusText('Memuat model AI wajah...');
    setErrorMessage(null);
    isProcessingRef.current = false;

    try {
      await loadFaceApiModels();
      setModelsLoaded(true);
    } catch (err: any) {
      console.error(err);
      setScanStatus('failed');
      setErrorMessage(err.message || 'Gagal memuat model AI pengenal wajah.');
      return false;
    }

    setStatusText('Mengaktifkan kamera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      streamRef.current = stream;
      setCameraActive(true);
      setScanStatus('scanning');
      setStatusText('Mencari wajah Anda...');
      return true;
    } catch (err) {
      console.error('Kamera diblokir atau tidak dapat diakses:', err);
      setScanStatus('failed');
      setErrorMessage('Kamera diblokir atau rusak. Harap berikan izin akses kamera.');
      return false;
    }
  };

  const stopScanning = (resetStatus = true) => {
    isProcessingRef.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanProgress(0);
    if (resetStatus) {
      setScanStatus('idle');
    }
  };

  // Run the detection loop
  useEffect(() => {
    if (scanStatus !== 'scanning' || !modelsLoaded || !cameraActive) return;

    let consecutiveHits = 0;

    const detectLoop = async () => {
      if (isProcessingRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !streamRef.current || video.readyState < 2 || video.videoWidth === 0) {
        requestRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      if (video.paused || video.ended) {
        requestRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      try {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }

        const detection = await detectSingleFaceWithDescriptor(video);

        if (detection) {
          const box = detection.detection.box;

          if (ctx) {
            drawCustomFaceBrackets(ctx, box);
          }

          consecutiveHits++;
          const progress = Math.min(100, Math.round((consecutiveHits / requiredHits) * 100));
          setScanProgress(progress);
          setStatusText(`Memindai wajah... Mohon tetap diam (${progress}%)`);

          if (progress >= 100) {
            isProcessingRef.current = true;
            if (requestRef.current) {
              cancelAnimationFrame(requestRef.current);
              requestRef.current = null;
            }
            // Clear bounding box canvas overlay on complete
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
            }
            await onScanComplete(detection, video, box);
            return;
          }
        } else {
          consecutiveHits = Math.max(0, consecutiveHits - 2);
          setScanProgress(Math.round((consecutiveHits / requiredHits) * 100));
          setStatusText('Hadapkan wajah Anda dengan jelas ke arah kamera');
        }
      } catch (err) {
        console.error('Error running detection frame:', err);
      }

      requestRef.current = requestAnimationFrame(detectLoop);
    };

    requestRef.current = requestAnimationFrame(detectLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [scanStatus, modelsLoaded, cameraActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const captureFullPhoto = (): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth || 640;
    tempCanvas.height = video.videoHeight || 480;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.translate(tempCanvas.width, 0);
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      return tempCanvas.toDataURL('image/png');
    }
    return null;
  };

  const captureCroppedFace = (box: faceapi.Box): string | null => {
    const video = videoRef.current;
    if (!video || !box) return null;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 150;
    tempCanvas.height = 150;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      const sx = Math.max(0, box.x - box.width * 0.1);
      const sy = Math.max(0, box.y - box.height * 0.1);
      const sw = Math.min(video.videoWidth - sx, box.width * 1.2);
      const sh = Math.min(video.videoHeight - sy, box.height * 1.2);
      if (sw > 0 && sh > 0) {
        tempCtx.drawImage(video, sx, sy, sw, sh, 0, 0, 150, 150);
        return tempCanvas.toDataURL('image/jpeg', 0.85);
      }
    }
    return null;
  };

  return {
    modelsLoaded,
    cameraActive,
    scanProgress,
    setScanProgress,
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
    captureFullPhoto,
    captureCroppedFace,
  };
}
