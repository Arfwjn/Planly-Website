/**
 * =============================================================================
 * Planly — AICompanionView.tsx
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

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowLeft, Clock, FileText, MessageSquare, BookOpen, ShieldAlert, Key, CheckCircle2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import ConfirmModal from '../ui/ConfirmModal';
import ApiKeyModal from '../ui/ApiKeyModal';
import { api } from '../../services/api';
import { useGeminiApiKey } from './hooks/useGeminiApiKey';
import { useAICompanionSessions } from './hooks/useAICompanionSessions';
import { useAIBackgroundProcessor } from './hooks/useAIBackgroundProcessor';
import { Note, SidebarTab } from '../../types';
import Skeleton from '../ui/Skeleton';

// Impor tipe data (TypeScript interfaces & types)
import { 
  ActiveTab, 
  ChatMessage
} from './types';

// Impor konstanta & helper terdekomposisi
import { generateLectureNotesMarkdown, getOfflineAIResponse } from './helpers';

// Impor sub-komponen modular
import CompanionIdlePanel from './CompanionIdlePanel';
import CompanionProcessingPanel from './CompanionProcessingPanel';
import CompanionVideoPanel from './CompanionVideoPanel';
import CompanionTranscriptTab from './CompanionTranscriptTab';
import CompanionSummaryTab from './CompanionSummaryTab';
import CompanionChatTab from './CompanionChatTab';

// Impor helper service Gemini AI & audio extraction
import { 
  chatWithLectureContext
} from '../../services/ai/aiCompanionService';

export interface AICompanionViewProps {
  onAddNote?: (note: Omit<Note, 'id' | 'user_id'>) => void;
  onTabChange?: (tab: SidebarTab) => void;
  loading?: boolean;
}

/**
 * Komponen AICompanionView (Orchestrator)
 * 
 * Pengelola utama halaman Asisten Kuliah AI. 
 * Menghubungkan dropzone pengunggahan, pemutar video, sinkronisasi transkrip kuliah,
 * ringkasan materi akademik kelas, dan RAG chatbot interaktif.
 */
export default function AICompanionView({ onAddNote, onTabChange, loading = false }: AICompanionViewProps = {}) {
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6 pb-12">
        {/* Header View */}
        <section className="text-left">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
          </div>
        </section>

        {/* API Key Panel Skeleton */}
        <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-3 w-3/4 rounded-md" />
          </div>
          <Skeleton className="h-9 w-full md:w-64 rounded-xl" />
        </div>

        {/* Main Panel (CompanionIdlePanel) Skeleton */}
        <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 min-h-[450px] flex flex-col justify-center items-center gap-6">
          <div className="w-full max-w-[650px] text-center space-y-6">
            {/* Upload Area Box */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-3 w-64 rounded-md" />
              </div>
            </div>
            
            {/* Demo Button Area */}
            <div className="flex justify-center pt-2">
              <Skeleton className="h-8 w-48 rounded-xl" />
            </div>
          </div>

          {/* History Panel Skeleton */}
          <div className="w-full max-w-[650px] bg-slate-50/50 dark:bg-slate-855/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <Skeleton className="h-3 w-32 rounded-md border-b border-transparent pb-1.5" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-1/3 rounded-md" />
                      <Skeleton className="h-2 w-1/4 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-10 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toast = useToast();
  
  // State manajemen interaktif
  const [dragActive, setDragActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('transcript');
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Menggunakan custom hook untuk background processing AI (SoC Lanjutan)
  const {
    stage,
    progress,
    videoMeta,
    videoUrl,
    transcript,
    chapters,
    takeaways,
    enrichment,
    startActualAIProcessing,
    handleLoadDemo,
    handleReset,
    loadHistorySession,
    updateVideoUrl,
  } = useAIBackgroundProcessor();

  // Menggunakan custom hooks untuk API Key dan Sessions (SoC Lanjutan)
  const {
    localApiKey,
    useSystemKey,
    activeApiKey,
    isEnvKeyValid,
    saveApiKey,
    deleteApiKey,
    toggleSystemKey,
  } = useGeminiApiKey();

  const {
    sessions,
    addSession,
    deleteSession,
  } = useAICompanionSessions();

  // State Kontrol Modal API Key & Pelacakan Prompt Pertama
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasPromptedKey, setHasPromptedKey] = useState(false);

  // State percakapan dengan Chatbot (RAG)
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya adalah Asisten Kuliah AI Anda. Saya telah menganalisis transkrip rekaman kuliah ini. Ada konsep materi kuliah yang ingin Anda tanyakan?'
    }
  ]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Refs untuk berinteraksi dengan elemen DOM
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Gulir transkrip aktif agar senantiasa berada dalam pandangan mata kuliah
  useEffect(() => {
    if (activeTab === 'transcript' && transcriptContainerRef.current) {
      const activeEl = transcriptContainerRef.current.querySelector('.active-transcript-line');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentTime, activeTab]);

  // Otomatis munculkan pop-up API Key jika belum teratur sama sekali
  useEffect(() => {
    const hasKey = isEnvKeyValid || localApiKey;
    if (!hasKey && !hasPromptedKey && stage === 'idle') {
      const timer = setTimeout(() => {
        setIsApiKeyModalOpen(true);
        setHasPromptedKey(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isEnvKeyValid, localApiKey, hasPromptedKey, stage]);

  // Logika pemrosesan video dan simulasi didelegasikan ke custom hook useAIBackgroundProcessor

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    if (file.type !== "video/mp4" && !file.name.endsWith('.mp4')) {
      toast.error('Format file tidak didukung! Harap unggah rekaman video kuliah berformat MP4.');
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    const sizeStr = sizeInMB > 100 
      ? `${(sizeInMB / 1024).toFixed(1)} GB`
      : `${sizeInMB.toFixed(1)} MB`;

    const objectUrl = URL.createObjectURL(file);

    if (stage === 'completed') {
      // Mode hubungkan kembali berkas lokal (reconnect)
      updateVideoUrl(objectUrl, file.name, sizeStr);
      toast.success('Video kuliah berhasil dihubungkan kembali!');
    } else {
      // Mode analisis baru biasa
      if (!activeApiKey) {
        toast.warning('Kunci API Gemini belum diatur. Silakan konfigurasi API Key terlebih dahulu.');
        setIsApiKeyModalOpen(true);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      startActualAIProcessing(file, file.name, sizeStr, objectUrl, activeApiKey, addSession);
    }
  };

  const handleSaveApiKey = (newKey: string) => {
    saveApiKey(newKey);
  };

  const handleDeleteApiKey = () => {
    deleteApiKey();
  };

  const triggerLoadDemo = () => {
    handleLoadDemo(addSession);
  };

  const handleResetWorkspace = () => {
    handleReset();
    setMessages([
      {
        sender: 'ai',
        text: 'Halo! Saya adalah Asisten Kuliah AI Anda. Saya telah menganalisis transkrip rekaman kuliah ini. Ada konsep materi kuliah yang ingin Anda tanyakan?'
      }
    ]);
  };

  const triggerDeleteConfirm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (timeInSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeInSeconds;
      videoRef.current.play();
      
      const mins = Math.floor(timeInSeconds / 60);
      const secs = Math.floor(timeInSeconds % 60);
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      toast.info(`Melompat ke waktu ${timeStr}`);
    }
  };

  const getActiveTranscriptIndex = () => {
    let activeIndex = 0;
    for (let i = 0; i < transcript.length; i++) {
      if (currentTime >= transcript[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    return activeIndex;
  };

  const activeIndex = getActiveTranscriptIndex();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userQuery = chatInput.trim();
    const newMsg: ChatMessage = { sender: 'user', text: userQuery };
    
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);

    const isDemo = videoMeta?.isDemo;
    if (isDemo && !activeApiKey) {
      // Mode demo tanpa API key menggunakan simulasi respons offline terdekomposisi
      setTimeout(() => {
        const { text, isSearchGrounded } = getOfflineAIResponse(userQuery);
        setMessages(prev => [...prev, { sender: 'ai', text, isSearchGrounded }]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    if (!activeApiKey) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Kunci API Gemini belum dikonfigurasi. Silakan masukkan API Key di panel konfigurasi atas terlebih dahulu.' }
      ]);
      setIsTyping(false);
      return;
    }

    try {
      const response = await chatWithLectureContext(userQuery, messages, transcript, activeApiKey);
      setMessages(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Gagal menghubungi asisten AI: ' + (err instanceof Error ? err.message : err) }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simpan hasil transkrip dan ringkasan AI ke Catatan Belajar
  const handleSaveToNotes = async () => {
    if (!videoMeta) return;
    
    // Bersihkan nama berkas dari ekstensi untuk judul catatan
    const cleanTitle = `Hasil Analisis AI: ${videoMeta.name.replace(/\.[^/.]+$/, "")}`;
    
    // Gunakan helper markdown terdekomposisi
    const markdownContent = generateLectureNotesMarkdown(
      videoMeta.name,
      takeaways,
      chapters,
      enrichment
    );

    if (onAddNote) {
      onAddNote({
        title: cleanTitle,
        content: markdownContent,
        course_id: null,
      });
      if (onTabChange) {
        onTabChange('notes');
      }
    } else {
      try {
        await api.notes.create({
          title: cleanTitle,
          content: markdownContent,
          course_id: null,
        });
        toast.success('Rangkuman & Transkrip berhasil disimpan ke Catatan Belajar Anda!');
      } catch (err) {
        toast.error('Gagal menyimpan catatan: ' + (err instanceof Error ? err.message : err));
      }
    }
  };

  // Reset percakapan chatbot
  const handleResetChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Halo! Saya adalah Asisten Kuliah AI Anda. Saya telah menganalisis transkrip rekaman kuliah ini. Ada konsep materi kuliah yang ingin Anda tanyakan?'
      }
    ]);
    toast.info('Percakapan chatbot berhasil di-reset.');
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6 pb-12">
      {/* Header View */}
      <section className="text-left">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-left font-sans">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
                <Sparkles className="w-8 h-8 text-primary" />
                <span>Asisten Kuliah AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30 rounded-full uppercase tracking-wider select-none">
                Active
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Ringkas materi kuliah Zoom Anda dan tanyakan konsep penting secara interaktif dengan dukungan RAG.
            </p>
          </div>
          
          {stage === 'completed' && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSaveToNotes}
                className="px-4 py-2 bg-primary hover:bg-primary/95 border-none text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>Simpan ke Catatan Belajar</span>
              </button>
              
              <button
                onClick={handleResetWorkspace}
                className="px-4 py-2 border !border-slate-200 hover:!border-slate-600 dark:!border-slate-800 dark:hover:!border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant hover:text-on-surface text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali / Unggah Baru</span>
              </button>
            </div>
          )}
        </div>
         {/* API Key Configuration Panel */}
      {stage === 'idle' && (
        <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left transition-all hover:shadow-xs duration-350">
          <div className="flex gap-3 items-start">
            <div className={`p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center ${
              activeApiKey ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' : 'bg-amber-50 dark:bg-amber-955/20 text-amber-500'
            }`}>
              {activeApiKey ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                <span>Status Gemini API Key</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-normal uppercase ${
                  localApiKey 
                    ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400' 
                    : (isEnvKeyValid && useSystemKey)
                    ? 'bg-blue-100 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-amber-100 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400'
                }`}>
                  {localApiKey 
                    ? 'Kunci Kustom' 
                    : (isEnvKeyValid && useSystemKey) 
                    ? 'Kunci Sistem' 
                    : 'Tidak Aktif'}
                </span>
              </h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                {localApiKey ? (
                  <span>API Key kustom aktif, terpasang aman dan terenkripsi di lokal browser Anda.</span>
                ) : (isEnvKeyValid && useSystemKey) ? (
                  <span>API Key aktif dari sistem environment (.env). Masukkan kunci kustom jika ingin meng-override.</span>
                ) : isEnvKeyValid ? (
                  <span>Kunci bawaan (.env) tersedia. Klik tombol di kanan untuk mengaktifkan atau atur kunci kustom.</span>
                ) : (
                  <span>Masukkan API Key untuk menganalisis video kuliah dan menggunakan chatbot AI.</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {localApiKey && (
              <button
                onClick={handleDeleteApiKey}
                className="px-3.5 py-2 text-xs text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Hapus
              </button>
            )}
            {!localApiKey && isEnvKeyValid && (
              <button
                onClick={() => toggleSystemKey(!useSystemKey)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all border ${
                  useSystemKey 
                    ? 'bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/35 text-amber-600 dark:text-amber-400' 
                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/35 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {useSystemKey ? 'Nonaktifkan Kunci Sistem' : 'Gunakan Kunci Sistem'}
              </button>
            )}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border-none ${
                activeApiKey 
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface' 
                  : 'bg-primary hover:bg-[#4F46E5] text-white shadow-xs'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{localApiKey ? 'Ubah Kunci Kustom' : 'Atur Kunci Kustom'}</span>
            </button>
          </div>
        </div>
      )}
      </section>

      {/* 1. STAGE: IDLE - Dropzone pengunggahan berkas */}
      {stage === 'idle' && (
        <CompanionIdlePanel
          sessions={sessions}
          dragActive={dragActive}
          onDrag={handleDrag}
          onDrop={handleDrop}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onLoadDemo={triggerLoadDemo}
          onLoadHistorySession={loadHistorySession}
          onDeleteSessionClick={triggerDeleteConfirm}
        />
      )}

      {/* 2. STAGE: PROCESSING - Status Pipeline AI */}
      {stage !== 'idle' && stage !== 'completed' && (
        <CompanionProcessingPanel stage={stage} progress={progress} />
      )}

      {/* 3. STAGE: COMPLETED - Workspace Utama Asisten AI */}
      {stage === 'completed' && videoMeta && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Pemutar Video & Reconnect UI */}
          <CompanionVideoPanel
            videoUrl={videoUrl}
            videoMeta={videoMeta}
            currentTime={currentTime}
            videoRef={videoRef}
            fileInputRef={fileInputRef}
            onTimeUpdate={handleTimeUpdate}
            onFileChange={handleFileChange}
          />

          {/* Panel Interaktif (Tabs: Transkrip, Ringkasan, Tanya Jawab) */}
          <div className="lg:col-span-7 min-w-0">
            <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl shadow-sm flex flex-col h-[520px] overflow-hidden">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-855/20 p-2 gap-1 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                    activeTab === 'transcript'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Transkrip</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                    activeTab === 'summary'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Ringkasan AI</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                    activeTab === 'chat'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Tanya AI</span>
                </button>
              </div>

              {/* Tampilan Konten Tab Aktif */}
              {activeTab === 'transcript' && (
                <CompanionTranscriptTab
                  transcriptSearch={transcriptSearch}
                  setTranscriptSearch={setTranscriptSearch}
                  transcript={transcript}
                  activeIndex={activeIndex}
                  handleSeek={handleSeek}
                  transcriptContainerRef={transcriptContainerRef}
                />
              )}

              {activeTab === 'summary' && (
                <CompanionSummaryTab 
                  handleSeek={handleSeek}
                  chapters={chapters}
                  takeaways={takeaways}
                  enrichment={enrichment}
                />
              )}

              {activeTab === 'chat' && (
                <CompanionChatTab
                  messages={messages}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  isTyping={isTyping}
                  onSendMessage={handleSendMessage}
                  handleSeek={handleSeek}
                  onResetChat={handleResetChat}
                />
              )}

            </div>
          </div>

        </div>
      )}

      {/* Modal Konfirmasi Hapus Riwayat */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSessionToDelete(null);
        }}
        onConfirm={confirmDeleteSession}
        title="Hapus Sesi Analisis Kuliah"
        message="Apakah Anda yakin ingin menghapus sesi riwayat kuliah ini dari database lokal browser Anda secara permanen?"
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isDanger={true}
      />

      {/* Modal Konfigurasi Gemini API Key */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={localApiKey}
      />

    </div>
  );
}

