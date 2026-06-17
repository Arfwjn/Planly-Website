/**
 * =============================================================================
 * Planly — useAIBackgroundProcessor.ts
 * 
 * Kegunaan:
 * Komponen asisten kuliah AI interaktif (RAG chatbot, pemutar video, sinkronisasi transkrip kuliah, & key takeaways).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan AICompanionView.tsx (orkestrator) dan menggunakan layanan Gemini AI di aiCompanionService.ts.
 * 
 * Aliran Data / State:
 * - Mengunggah video kuliah (.mp4), memutar transkrip seekable timestamp [MM:SS], merender rumus LaTeX KaTeX, & chat RAG.
 * =============================================================================
 */

import { useSyncExternalStore } from 'react';
import { ProcessingStage, ProcessedVideoMetadata, TranscriptLine, LectureChapter, AcademicEnrichment } from '../types';
import { extractAudioAsWav, analyzeLectureAudio } from '../../../services/ai/aiCompanionService';
import { DEMO_ANALYSIS_RESULT, DEMO_VIDEO_URL } from '../constants';
import { useToast } from '../../ui/Toast';

interface ProcessorState {
  stage: ProcessingStage;
  progress: number;
  videoMeta: ProcessedVideoMetadata | null;
  videoUrl: string | null;
  currentSessionId: string | null;
  transcript: TranscriptLine[];
  chapters: LectureChapter[];
  takeaways: string[];
  enrichment: AcademicEnrichment | undefined;
}

// Module-level global state to persist when component unmounts
let globalState: ProcessorState = {
  stage: 'idle',
  progress: 0,
  videoMeta: null,
  videoUrl: null,
  currentSessionId: null,
  transcript: [],
  chapters: [],
  takeaways: [],
  enrichment: undefined,
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return globalState;
}

function updateGlobalState(updates: Partial<ProcessorState>) {
  globalState = { ...globalState, ...updates };
  listeners.forEach(listener => listener());
}

export function useAIBackgroundProcessor() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const toast = useToast();

  const startActualAIProcessing = async (
    file: File,
    fileName: string,
    fileSizeStr: string,
    objectUrl: string,
    activeApiKey: string,
    addSession: (session: any) => void
  ) => {
    updateGlobalState({
      videoMeta: { name: fileName, size: fileSizeStr, isDemo: false },
      stage: 'extracting',
      progress: 10,
    });

    try {
      // Tahap 1: Ekstraksi Audio trek & downsampling ke WAV
      const { blob: audioBlob, duration } = await extractAudioAsWav(file, (_, p) => {
        updateGlobalState({ stage: 'extracting', progress: Math.round(p * 0.45) });
      });

      // Tahap 2: Transkripsi & Analisis Multimodal via Gemini API
      updateGlobalState({ stage: 'transcribing', progress: 50 });
      
      const analysisResult = await analyzeLectureAudio(audioBlob, duration, activeApiKey, (_, p) => {
        if (p >= 90) {
          updateGlobalState({ stage: 'summarizing', progress: 75 });
        } else {
          updateGlobalState({ stage: 'transcribing', progress: 50 + Math.round((p - 85) * 1.5) });
        }
      });

      // Tahap 3: Pembuatan Ringkasan & Grounding Wawasan Akademik
      updateGlobalState({ stage: 'summarizing', progress: 80 });
      
      const sessionId = String(Date.now());
      
      // Simpan muatan data sesi analisis penuh ke localStorage browser
      localStorage.setItem(`planly_session_data_${sessionId}`, JSON.stringify(analysisResult));

      // Tahap 4: Pengayaan Akademik Selesai
      updateGlobalState({ stage: 'enriching', progress: 95 });

      setTimeout(() => {
        updateGlobalState({
          stage: 'completed',
          progress: 100,
          videoUrl: objectUrl,
          currentSessionId: sessionId,
          transcript: analysisResult.transcript,
          chapters: analysisResult.chapters,
          takeaways: analysisResult.takeaways,
          enrichment: analysisResult.enrichment,
        });

        // Daftarkan sesi baru ke riwayat menu utama
        const newSession = {
          id: sessionId,
          name: fileName,
          size: fileSizeStr,
          dateStr: new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          isDemo: false
        };

        addSession(newSession);
        toast.success('Analisis Video Kuliah Selesai! Siap untuk dipelajari.');
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error('Gagal memproses analisis video kuliah: ' + (error instanceof Error ? error.message : error));
      handleReset();
    }
  };

  const handleLoadDemo = (addSession: (session: any) => void) => {
    updateGlobalState({
      videoMeta: { name: 'Kuliah_Kecerdasan_Buatan_Pertemuan_8.mp4', size: '24.5 MB', isDemo: true },
      stage: 'extracting',
      progress: 15,
    });

    // Tahap 1: Ekstraksi Audio
    setTimeout(() => {
      updateGlobalState({ stage: 'transcribing', progress: 40 });
      
      // Tahap 2: Transkripsi
      setTimeout(() => {
        updateGlobalState({ stage: 'summarizing', progress: 70 });
        
        // Tahap 3: Pembuatan Ringkasan
        setTimeout(() => {
          updateGlobalState({ stage: 'enriching', progress: 90 });
          
          // Tahap 4: Pengayaan Akademis
          setTimeout(() => {
            updateGlobalState({
              stage: 'completed',
              progress: 100,
              transcript: DEMO_ANALYSIS_RESULT.transcript,
              chapters: DEMO_ANALYSIS_RESULT.chapters,
              takeaways: DEMO_ANALYSIS_RESULT.takeaways,
              enrichment: DEMO_ANALYSIS_RESULT.enrichment,
              videoUrl: DEMO_VIDEO_URL,
              currentSessionId: 'demo',
            });

            // Simpan sesi kuliah baru ke riwayat
            const newSession = {
              id: 'demo',
              name: 'Kuliah_Kecerdasan_Buatan_Pertemuan_8.mp4',
              size: '24.5 MB',
              dateStr: new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              isDemo: true
            };

            addSession(newSession);
            toast.success('Sesi Demo Kuliah AI berhasil dimuat.');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleReset = () => {
    if (globalState.videoUrl && !globalState.videoUrl.startsWith('http')) {
      URL.revokeObjectURL(globalState.videoUrl);
    }
    updateGlobalState({
      stage: 'idle',
      progress: 0,
      videoMeta: null,
      videoUrl: null,
      currentSessionId: null,
      transcript: [],
      chapters: [],
      takeaways: [],
      enrichment: undefined,
    });
  };

  const loadHistorySession = (sess: any) => {
    updateGlobalState({
      videoMeta: { name: sess.name, size: sess.size, isDemo: sess.isDemo },
      stage: 'completed',
      progress: 100,
    });
    
    if (sess.isDemo) {
      updateGlobalState({
        transcript: DEMO_ANALYSIS_RESULT.transcript,
        chapters: DEMO_ANALYSIS_RESULT.chapters,
        takeaways: DEMO_ANALYSIS_RESULT.takeaways,
        enrichment: DEMO_ANALYSIS_RESULT.enrichment,
        videoUrl: DEMO_VIDEO_URL,
        currentSessionId: 'demo',
      });
    } else {
      const savedData = localStorage.getItem(`planly_session_data_${sess.id}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          updateGlobalState({
            transcript: parsed.transcript,
            chapters: parsed.chapters,
            takeaways: parsed.takeaways,
            enrichment: parsed.enrichment,
            currentSessionId: sess.id,
            videoUrl: null, // File lokal butuh re-connect
          });
        } catch (e) {
          console.error(e);
          toast.error('Gagal memuat detail data sesi analisis.');
        }
      } else {
        toast.warning('Data payload analisis tidak ditemukan di penyimpanan browser.');
        updateGlobalState({ videoUrl: null });
      }
    }
    toast.success(`Memuat sesi: ${sess.name}`);
  };

  const updateVideoUrl = (url: string, name: string, size: string) => {
    updateGlobalState({
      videoUrl: url,
      videoMeta: { name, size, isDemo: false },
    });
  };

  return {
    ...state,
    startActualAIProcessing,
    handleLoadDemo,
    handleReset,
    loadHistorySession,
    updateVideoUrl,
  };
}
