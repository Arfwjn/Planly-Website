import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowLeft, Clock, FileText, MessageSquare, Settings, BookOpen, Shield, ShieldAlert, Key, CheckCircle2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import ConfirmModal from '../ui/ConfirmModal';
import ApiKeyModal from '../ui/ApiKeyModal';
import { encryptApiKey, decryptApiKey } from '../../utils/security';
import { api } from '../../services/api';
import { Note, SidebarTab } from '../../types';
import Skeleton from '../ui/Skeleton';

// Impor tipe data (TypeScript interfaces & types)
import { 
  ProcessingStage, 
  ActiveTab, 
  ProcessedVideoMetadata, 
  TranscriptLine, 
  ChatMessage, 
  ProcessedSession,
  LectureChapter,
  AcademicEnrichment
} from './types';

// Impor sub-komponen modular
import CompanionIdlePanel from './CompanionIdlePanel';
import CompanionProcessingPanel from './CompanionProcessingPanel';
import CompanionVideoPanel from './CompanionVideoPanel';
import CompanionTranscriptTab from './CompanionTranscriptTab';
import CompanionSummaryTab from './CompanionSummaryTab';
import CompanionChatTab from './CompanionChatTab';

// Impor helper service Gemini AI & audio extraction
import { 
  extractAudioAsWav, 
  analyzeLectureAudio, 
  chatWithLectureContext, 
  LectureAnalysisResult 
} from '../../services/ai/aiCompanionService';

// Data transkrip demo bertema Kecerdasan Buatan (Jaringan Saraf Tiruan)
const DEMO_TRANSCRIPT: TranscriptLine[] = [
  { time: 0, speaker: "Dosen", text: "Selamat pagi rekan-rekan mahasiswa. Hari ini kita akan membahas bab penting tentang Kecerdasan Buatan, khususnya Jaringan Saraf Tiruan." },
  { time: 14, speaker: "Dosen", text: "Sebelum masuk to topik JST, kita harus paham dasarnya. Artificial Intelligence adalah upaya membuat mesin meniru kecerdasan manusia." },
  { time: 31, speaker: "Dosen", text: "Salah satu pilar utamanya adalah Machine Learning, di mana sistem dilatih menggunakan contoh data untuk membentuk pola otomatis." },
  { time: 47, speaker: "Dosen", text: "Dan yang lebih mendalam adalah Deep Learning, yang meniru cara kerja neuron di otak kita. Inilah yang kita sebut Jaringan Saraf Tiruan." },
  { time: 64, speaker: "Dosen", text: "JST memiliki tiga komponen lapisan penyusun utama, yaitu input layer, hidden layer atau lapisan tersembunyi, dan output layer." },
  { time: 82, speaker: "Dosen", text: "Tiap koneksi antar neuron memiliki nilai bobot atau weight, serta bias, dan diproses melalui sesuatu yang dinamakan fungsi aktivasi." },
  { time: 99, speaker: "Dosen", text: "Fungsi aktivasi ini penting untuk memberikan sifat non-linear. Contohnya fungsi Sigmoid yang memetakan output antara rentang 0 hingga 1." },
  { time: 118, speaker: "Dosen", text: "Kemudian ada fungsi ReLU atau Rectified Linear Unit yang sangat populer. ReLU memetakan semua nilai negatif menjadi 0, dan membiarkan nilai positif tetap." },
  { time: 135, speaker: "Dosen", text: "Fungsi ReLU disukai karena menghemat daya komputasi dan menghindari masalah hilangnya gradien saat pelatihan jaringan yang sangat dalam." },
  { time: 151, speaker: "Mahasiswa", text: "Mohon izin bertanya Pak Dosen, apakah ReLU ini selalu lebih unggul dibandingkan dengan Sigmoid di seluruh kondisi arsitektur?" },
  { time: 164, speaker: "Dosen", text: "Pertanyaan yang sangat bagus. ReLU unggul di lapisan tersembunyi, tetapi untuk lapisan klasifikasi biner akhir, Sigmoid tetap menjadi pilihan utama." }
];

const DEMO_ANALYSIS_RESULT: LectureAnalysisResult = {
  transcript: DEMO_TRANSCRIPT,
  chapters: [
    { time: 0, title: "Bab 1: Pendahuluan & Definisi AI", desc: "Penjelasan umum mengenai konsep dasar Artificial Intelligence." },
    { time: 31, title: "Bab 2: Machine Learning vs Deep Learning", desc: "Perbedaan pembelajaran mesin klasik dengan jaringan saraf mendalam." },
    { time: 64, title: "Bab 3: Arsitektur Jaringan Saraf Tiruan (JST)", desc: "Mengenal susunan Input, Hidden, dan Output layer pada neuron tiruan." },
    { time: 99, title: "Bab 4: Fungsi Aktivasi (Sigmoid & ReLU)", desc: "Bagaimana fungsi aktivasi memberikan sifat non-linear pada pemrosesan JST." },
    { time: 151, title: "Bab 5: Sesi Diskusi: ReLU vs Sigmoid", desc: "Tanya jawab mengenai kelebihan ReLU dan posisi penggunaan Sigmoid." }
  ],
  takeaways: [
    "<b>Artificial Intelligence (AI)</b> mencakup seluruh teknologi yang berupaya mereplikasi kecerdasan manusia ke dalam sistem komputasi.",
    "<b>Machine Learning (ML)</b> berfokus pada pelatihan model komputer menggunakan data untuk mempelajari pola secara mandiri tanpa pengkodean aturan statis.",
    "<b>Deep Learning (DL)</b> menggunakan susunan saraf bertingkat (JST) yang terinspirasi dari struktur neuron otak biologis manusia.",
    "<b>Lapisan JST</b> terdiri atas: *Input Layer* (menerima fitur data), *Hidden Layer* (melakukan ekstraksi fitur), dan *Output Layer* (menghasilkan keputusan akhir).",
    "<b>Fungsi Aktivasi</b> mengubah representasi linier menjadi non-linier agar jaringan saraf dapat memecahkan masalah pola yang kompleks."
  ],
  enrichment: {
    explanation: "Berikut adalah informasi akademik tambahan dari internet terkait fungsi aktivasi yang dibahas dosen dalam rekaman:",
    cards: [
      {
        title: "Fungsi Sigmoid",
        formula: "f(x) = 1 / (1 + e^-x)",
        description: "Memetakan nilai ke rentang (0, 1). Sangat cocok untuk probabilitas, namun rentan terhadap vanishing gradient pada model yang sangat dalam karena nilai turunan maksimalnya hanya 0.25."
      },
      {
        title: "Fungsi ReLU",
        formula: "f(x) = max(0, x)",
        description: "Menghilangkan nilai negatif menjadi 0. Menghindari kejenuhan gradien positif karena turunannya konstan = 1, sehingga melatih model jauh lebih cepat secara komputasi."
      }
    ],
    sources: [
      { label: "Stanford CS231n", url: "https://cs231n.github.io/neural-networks-1/" },
      { label: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/activation-functions-neural-networks/" }
    ]
  }
};

const DEMO_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-keyboard-typing-hands-close-up-1002-large.mp4";

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
  
  // State manajemen alur pemrosesan AI
  const [dragActive, setDragActive] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [videoMeta, setVideoMeta] = useState<ProcessedVideoMetadata | null>(null);
  
  // State pemutar video dan panel interaktif
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('transcript');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  
  // State data analisis kuliah aktif
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [chapters, setChapters] = useState<LectureChapter[]>([]);
  const [takeaways, setTakeaways] = useState<string[]>([]);
  const [enrichment, setEnrichment] = useState<AcademicEnrichment | undefined>(undefined);

  // State API Key lokal/environment
  const [localApiKey, setLocalApiKey] = useState(() => {
    const saved = localStorage.getItem('planly_gemini_api_key');
    if (!saved) return '';
    return decryptApiKey(saved);
  });

  const [useSystemKey, setUseSystemKey] = useState(() => {
    return localStorage.getItem('planly_use_system_key') === 'true';
  });

  const envApiKey = import.meta.env.GEMINI_API_KEY;
  const isEnvKeyValid = envApiKey && envApiKey !== 'MY_GEMINI_API_KEY' && envApiKey !== '';
  // Prioritaskan kunci kustom lokal, fallback ke kunci sistem environment (.env) jika diizinkan oleh user
  const activeApiKey = localApiKey || (isEnvKeyValid && useSystemKey ? envApiKey : '');

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

  // State penyimpanan riwayat sesi kuliah (localStorage)
  const [sessions, setSessions] = useState<ProcessedSession[]>(() => {
    const saved = localStorage.getItem('planly_ai_sessions');
    return saved ? JSON.parse(saved) : [];
  });
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

  // Alur pemrosesan asli menggunakan Gemini API & Client WAV extraction
  const startActualAIProcessing = async (
    file: File,
    fileName: string,
    fileSizeStr: string,
    objectUrl: string
  ) => {
    setVideoMeta({ name: fileName, size: fileSizeStr, isDemo: false });
    setStage('extracting');
    setProgress(10);

    try {
      // Tahap 1: Ekstraksi Audio trek & downsampling ke WAV
      const { blob: audioBlob, duration } = await extractAudioAsWav(file, (status, p) => {
        // Map visual progress stages
        if (p < 50) {
          setStage('extracting');
        } else if (p < 85) {
          setStage('extracting');
        }
        setProgress(Math.round(p * 0.45)); // Down-sampling accounts for 0-45% of total progress
      });

      // Tahap 2: Transkripsi & Analisis Multimodal via Gemini API
      setStage('transcribing');
      setProgress(50);
      
      const analysisResult = await analyzeLectureAudio(audioBlob, duration, activeApiKey, (status, p) => {
        if (p >= 90) {
          setStage('summarizing');
          setProgress(75);
        } else {
          setStage('transcribing');
          setProgress(50 + Math.round((p - 85) * 1.5));
        }
      });

      // Tahap 3: Pembuatan Ringkasan & Grounding Wawasan Akademik
      setStage('summarizing');
      setProgress(80);
      
      const sessionId = String(Date.now());
      setCurrentSessionId(sessionId);
      setTranscript(analysisResult.transcript);
      setChapters(analysisResult.chapters);
      setTakeaways(analysisResult.takeaways);
      setEnrichment(analysisResult.enrichment);

      // Simpan muatan data sesi analisis penuh ke localStorage browser
      localStorage.setItem(`planly_session_data_${sessionId}`, JSON.stringify(analysisResult));

      // Tahap 4: Pengayaan Akademik Selesai
      setStage('enriching');
      setProgress(95);

      setTimeout(() => {
        setStage('completed');
        setProgress(100);
        setVideoUrl(objectUrl);

        // Daftarkan sesi baru ke riwayat menu utama
        const newSession: ProcessedSession = {
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

        setSessions(prev => {
          const updated = [newSession, ...prev.filter(s => s.name !== fileName)];
          localStorage.setItem('planly_ai_sessions', JSON.stringify(updated));
          return updated;
        });

        toast.success('Analisis Video Kuliah Selesai! Siap untuk dipelajari.');
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error('Gagal memproses analisis video kuliah: ' + (error instanceof Error ? error.message : error));
      handleReset();
    }
  };

  // Simulasi pemrosesan analisis AI secara bertahap untuk demo static
  const handleLoadDemo = () => {
    setVideoMeta({ name: 'Kuliah_Kecerdasan_Buatan_Pertemuan_8.mp4', size: '24.5 MB', isDemo: true });
    setStage('extracting');
    setProgress(15);

    // Tahap 1: Ekstraksi Audio
    setTimeout(() => {
      setStage('transcribing');
      setProgress(40);
      
      // Tahap 2: Transkripsi
      setTimeout(() => {
        setStage('summarizing');
        setProgress(70);
        
        // Tahap 3: Pembuatan Ringkasan
        setTimeout(() => {
          setStage('enriching');
          setProgress(90);
          
          // Tahap 4: Pengayaan Akademis
          setTimeout(() => {
            setStage('completed');
            setProgress(100);
            
            // Pasang data analisis simulasi JST
            setTranscript(DEMO_ANALYSIS_RESULT.transcript);
            setChapters(DEMO_ANALYSIS_RESULT.chapters);
            setTakeaways(DEMO_ANALYSIS_RESULT.takeaways);
            setEnrichment(DEMO_ANALYSIS_RESULT.enrichment);
            setVideoUrl(DEMO_VIDEO_URL);
            setCurrentSessionId('demo');

            // Simpan sesi kuliah baru ke riwayat
            const newSession: ProcessedSession = {
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

            setSessions(prev => {
              const updated = [newSession, ...prev.filter(s => s.id !== 'demo')];
              localStorage.setItem('planly_ai_sessions', JSON.stringify(updated));
              return updated;
            });

            toast.success('Sesi Demo Kuliah AI berhasil dimuat.');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

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
      setVideoUrl(objectUrl);
      setVideoMeta(prev => prev ? { ...prev, name: file.name, size: sizeStr } : { name: file.name, size: sizeStr, isDemo: false });
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
      startActualAIProcessing(file, file.name, sizeStr, objectUrl);
    }
  };

  const handleSaveApiKey = (newKey: string) => {
    setLocalApiKey(newKey);
    const encrypted = encryptApiKey(newKey);
    localStorage.setItem('planly_gemini_api_key', encrypted);
    toast.success('Kunci API Gemini berhasil disimpan secara terenkripsi.');
  };

  const handleDeleteApiKey = () => {
    setLocalApiKey('');
    localStorage.removeItem('planly_gemini_api_key');
    toast.info('Kunci API Gemini telah dihapus.');
  };

  const handleReset = () => {
    if (videoUrl && !videoUrl.startsWith('http')) {
      URL.revokeObjectURL(videoUrl);
    }
    setStage('idle');
    setProgress(0);
    setVideoMeta(null);
    setVideoUrl(null);
    setCurrentTime(0);
    setTranscriptSearch('');
    setTranscript([]);
    setChapters([]);
    setTakeaways([]);
    setEnrichment(undefined);
    setCurrentSessionId(null);
    setMessages([
      {
        sender: 'ai',
        text: 'Halo! Saya adalah Asisten Kuliah AI Anda. Saya telah menganalisis transkrip rekaman kuliah ini. Ada konsep materi kuliah yang ingin Anda tanyakan?'
      }
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadHistorySession = (sess: ProcessedSession) => {
    setVideoMeta({ name: sess.name, size: sess.size, isDemo: sess.isDemo });
    
    if (sess.isDemo) {
      // Muat data simulasi JST
      setTranscript(DEMO_ANALYSIS_RESULT.transcript);
      setChapters(DEMO_ANALYSIS_RESULT.chapters);
      setTakeaways(DEMO_ANALYSIS_RESULT.takeaways);
      setEnrichment(DEMO_ANALYSIS_RESULT.enrichment);
      setVideoUrl(DEMO_VIDEO_URL);
      setCurrentSessionId('demo');
    } else {
      // Muat data dari localStorage
      const savedData = localStorage.getItem(`planly_session_data_${sess.id}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData) as LectureAnalysisResult;
          setTranscript(parsed.transcript);
          setChapters(parsed.chapters);
          setTakeaways(parsed.takeaways);
          setEnrichment(parsed.enrichment);
          setCurrentSessionId(sess.id);
        } catch (e) {
          console.error(e);
          toast.error('Gagal memuat detail data sesi analisis.');
        }
      } else {
        toast.warning('Data payload analisis tidak ditemukan di penyimpanan browser.');
      }
      setVideoUrl(null); // File lokal butuh re-connect
    }

    setStage('completed');
    setProgress(100);
    toast.success(`Memuat sesi: ${sess.name}`);
  };

  const triggerDeleteConfirm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      const updated = sessions.filter(s => s.id !== sessionToDelete);
      setSessions(updated);
      localStorage.setItem('planly_ai_sessions', JSON.stringify(updated));
      localStorage.removeItem(`planly_session_data_${sessionToDelete}`);
      toast.success('Riwayat sesi kuliah berhasil dihapus.');
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
      // Mode demo tanpa API key menggunakan simulasi respons offline
      setTimeout(() => {
        let responseText = '';
        let isGrounded = false;
        const lowerQuery = userQuery.toLowerCase();

        if (lowerQuery.includes('relu') || lowerQuery.includes('sigmoid') || lowerQuery.includes('aktivasi')) {
          responseText = "Dosen menjelaskan tentang pentingnya fungsi aktivasi pada menit [01:39]. Beliau membandingkan fungsi Sigmoid (yang memetakan output ke rentang 0-1) pada menit [01:47] dengan fungsi ReLU yang sangat populer pada menit [01:58]. Mahasiswa sempat menyela dan menanyakan perbandingannya pada menit [02:31]. Dosen menyimpulkan bahwa ReLU sangat ideal untuk hidden layers, sedangkan Sigmoid tetap terbaik untuk klasifikasi biner di output layer pada menit [02:44].";
        } else if (lowerQuery.includes('jst') || lowerQuery.includes('jaringan saraf') || lowerQuery.includes('arsitektur') || lowerQuery.includes('layer')) {
          responseText = "Materi arsitektur Jaringan Saraf Tiruan (JST) dibahas oleh dosen mulai menit [01:04]. Dosen menjelaskan susunan 3 lapisan utama JST, yaitu Input Layer, Hidden Layer, dan Output Layer pada menit [01:10]. Beliau juga menjelaskan konsep bobot (weight) dan bias yang memproses input antar neuron pada menit [01:22].";
        } else if (lowerQuery.includes('machine learning') || lowerQuery.includes('deep learning') || lowerQuery.includes('pembelajaran') || lowerQuery.includes('kecerdasan buatan') || lowerQuery.includes('definisi')) {
          responseText = "Perkuliahan ini diawali dengan penjelasan definisi AI oleh dosen pada menit [00:14]. Kemudian dosen menjelaskan tentang Machine Learning (pembelajaran otomatis dari pola data) pada menit [00:31]. Perbedaan mendasar dengan Deep Learning (meniru neuron biologis otak manusia) dipaparkan mulai menit [00:47].";
        } else if (lowerQuery.includes('dosen') || lowerQuery.includes('siapa') || lowerQuery.includes('pengajar')) {
          responseText = "Kuliah ini dibawakan oleh Dosen Pengampu kelas Jaringan Saraf Tiruan. Beliau menyapa mahasiswa di awal rekaman pada menit [00:00] dan menyampaikan topik bahasan hari ini.";
        } else if (lowerQuery.includes('vanishing gradient') || lowerQuery.includes('turunan') || lowerQuery.includes('gradien')) {
          responseText = "Masalah vanishing gradient disinggung dosen pada menit [02:15] saat menjelaskan kelemahan fungsi Sigmoid. Beliau menerangkan bahwa fungsi ReLU dapat mengatasi vanishing gradient karena memiliki nilai turunan konstan = 1 untuk input positif pada menit [02:22].";
        } else {
          isGrounded = true;
          responseText = `Pertanyaan Anda mengenai "${userQuery}" tidak dibahas secara spesifik oleh dosen dalam rekaman kuliah ini. Namun, berdasarkan pencarian Google Search Grounding:

Konsep yang Anda tanyakan berkaitan dengan bidang Machine Learning/AI. [Query] umumnya dipahami sebagai metode atau konsep akademis di mana sistem mengoptimalkan bobot (weights) menggunakan algoritma seperti Backpropagation dan optimizer (seperti Adam atau SGD) untuk meminimalkan error rate pada loss function.

Jika Anda ingin kembali membahas isi video, Anda bisa bertanya tentang: "Jelaskan tentang fungsi aktivasi" atau "Kapan dosen membahas JST?".`;
          responseText = responseText.replace('[Query]', userQuery);
        }

        setMessages(prev => [...prev, { sender: 'ai', text: responseText, isSearchGrounded: isGrounded }]);
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
    
    // Format timestamp helper
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Tanggal hari ini
    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate konten markdown terstruktur dengan format bold/link/math yang utuh
    let markdownContent = `# Ringkasan Analisis AI\n`;
    markdownContent += `Sesi Kuliah: ${videoMeta.name}\n`;
    markdownContent += `Tanggal Analisis: ${todayStr}\n\n`;

    if (takeaways && takeaways.length > 0) {
      markdownContent += `## 💡 Poin Rangkuman AI (Key Takeaways)\n`;
      takeaways.forEach((t) => {
        markdownContent += `- ${t}\n`;
      });
      markdownContent += `\n`;
    }

    if (chapters && chapters.length > 0) {
      markdownContent += `## 📚 Daftar Pembahasan Kuliah (Chapters)\n`;
      chapters.forEach((c) => {
        markdownContent += `- [${formatTime(c.time)}] ${c.title}: ${c.desc}\n`;
      });
      markdownContent += `\n`;
    }

    if (enrichment) {
      markdownContent += `## 🌐 Pengayaan Akademik (Sumber Internet & Google Search)\n`;
      if (enrichment.explanation) {
        markdownContent += `${enrichment.explanation}\n\n`;
      }
      if (enrichment.cards && enrichment.cards.length > 0) {
        enrichment.cards.forEach((card) => {
          markdownContent += `### 📌 ${card.title}\n`;
          markdownContent += `${card.description}\n`;
          if (card.formula) {
            markdownContent += `\nFormula / Rumus:\n$$${card.formula}$$\n`;
          }
          markdownContent += `\n`;
        });
      }
      if (enrichment.sources && enrichment.sources.length > 0) {
        markdownContent += `### 🔗 Referensi Sumber:\n`;
        enrichment.sources.forEach((src) => {
          markdownContent += `- [${src.label}](${src.url})\n`;
        });
        markdownContent += `\n`;
      }
    }

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
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors border-none shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>Simpan ke Catatan Belajar</span>
              </button>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-855 text-on-surface-variant hover:text-on-surface text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900"
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
                onClick={() => {
                  const newVal = !useSystemKey;
                  setUseSystemKey(newVal);
                  localStorage.setItem('planly_use_system_key', String(newVal));
                  toast.success(newVal ? 'Berhasil mengaktifkan API Key sistem bawaan.' : 'API Key sistem bawaan dinonaktifkan.');
                }}
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
          onLoadDemo={handleLoadDemo}
          onLoadHistorySession={handleLoadHistorySession}
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
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100 dark:hover:bg-slate-850/40 bg-transparent'
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
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100 dark:hover:bg-slate-850/40 bg-transparent'
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
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100 dark:hover:bg-slate-850/40 bg-transparent'
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

