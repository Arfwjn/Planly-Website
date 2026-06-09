import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowLeft, Clock, FileText, MessageSquare } from 'lucide-react';
import { useToast } from '../ui/Toast';
import ConfirmModal from '../ui/ConfirmModal';

// Impor tipe data (TypeScript interfaces & types)
import { 
  ProcessingStage, 
  ActiveTab, 
  ProcessedVideoMetadata, 
  TranscriptLine, 
  ChatMessage, 
  ProcessedSession 
} from './types';

// Impor sub-komponen modular
import CompanionIdlePanel from './CompanionIdlePanel';
import CompanionProcessingPanel from './CompanionProcessingPanel';
import CompanionVideoPanel from './CompanionVideoPanel';
import CompanionTranscriptTab from './CompanionTranscriptTab';
import CompanionSummaryTab from './CompanionSummaryTab';
import CompanionChatTab from './CompanionChatTab';

// Data transkrip demo bertema Kecerdasan Buatan (Jaringan Saraf Tiruan)
const DEMO_TRANSCRIPT: TranscriptLine[] = [
  { time: 0, speaker: "Dosen", text: "Selamat pagi rekan-rekan mahasiswa. Hari ini kita akan membahas bab penting tentang Kecerdasan Buatan, khususnya Jaringan Saraf Tiruan." },
  { time: 14, speaker: "Dosen", text: "Sebelum masuk ke topik JST, kita harus paham dasarnya. Artificial Intelligence adalah upaya membuat mesin meniru kecerdasan manusia." },
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

const DEMO_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-keyboard-typing-hands-close-up-1002-large.mp4";

/**
 * Komponen AICompanionView (Orchestrator)
 * 
 * Pengelola utama halaman Asisten Kuliah AI. 
 * Menghubungkan dropzone pengunggahan, pemutar video, sinkronisasi transkrip kuliah,
 * ringkasan materi akademik kelas, dan RAG chatbot interaktif.
 */
export default function AICompanionView() {
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
  const [transcript] = useState<TranscriptLine[]>(DEMO_TRANSCRIPT);

  // State percakapan dengan Chatbot (RAG)
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya adalah Asisten Kuliah AI Anda. Saya telah menganalisis transkrip rekaman kuliah ini. Ada konsep materi kuliah yang ingin Anda tanyakan? (Misal: "Kapan dosen membahas tentang JST?", "Apa perbedaan ReLU dan Sigmoid?", atau Anda bisa menanyakan materi lain di luar video).'
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

  // Simulasi pemrosesan analisis AI secara bertahap
  const simulateAIProcessing = (fileName: string, fileSizeStr: string, isDemo = false, objectUrl: string | null = null) => {
    setVideoMeta({ name: fileName, size: fileSizeStr, isDemo });
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
          
          // Tahap 4: Pengayaan Akademis via Google Search Grounding
          setTimeout(() => {
            setStage('completed');
            setProgress(100);
            setVideoUrl(objectUrl || DEMO_VIDEO_URL);

            // Simpan sesi kuliah baru ke riwayat
            const newSession: ProcessedSession = {
              id: String(Date.now()),
              name: fileName,
              size: fileSizeStr,
              dateStr: new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              isDemo
            };

            setSessions(prev => {
              const updated = [newSession, ...prev.filter(s => s.name !== fileName)];
              localStorage.setItem('planly_ai_sessions', JSON.stringify(updated));
              return updated;
            });

            toast.success('Analisis Video Kuliah Selesai! Siap untuk dipelajari.');
          }, 1200);
        }, 1500);
      }, 1500);
    }, 1200);
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
      simulateAIProcessing(file.name, sizeStr, false, objectUrl);
    }
  };

  const handleLoadDemo = () => {
    simulateAIProcessing('Kuliah_Kecerdasan_Buatan_Pertemuan_8.mp4', '24.5 MB', true, DEMO_VIDEO_URL);
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
    setMessages([
      {
        sender: 'ai',
        text: 'Halo! Saya adalah Asisten Kuliah AI Anda. Saya telah menganalisis transkrip rekaman kuliah ini. Ada konsep materi kuliah yang ingin Anda tanyakan? (Misal: "Kapan dosen membahas tentang JST?", "Apa perbedaan ReLU dan Sigmoid?", atau Anda bisa menanyakan materi lain di luar video).'
      }
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadHistorySession = (sess: ProcessedSession) => {
    setVideoMeta({ name: sess.name, size: sess.size, isDemo: sess.isDemo });
    setStage('completed');
    setProgress(100);
    if (sess.isDemo) {
      setVideoUrl(DEMO_VIDEO_URL);
    } else {
      // File lokal diatur ke null agar menampilkan tombol hubungkan kembali
      setVideoUrl(null);
    }
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userQuery = chatInput.trim();
    const newMsg: ChatMessage = { sender: 'user', text: userQuery };
    
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulasi respons RAG AI
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
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-6 pb-12">
      {/* Header View */}
      <section className="text-left space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-on-surface">Asisten Kuliah AI</h1>
                <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30 rounded-full uppercase tracking-wider select-none">
                  Demo
                </span>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant">
                Ringkas materi kuliah Zoom Anda dan tanyakan konsep penting secara interaktif dengan dukungan RAG
              </p>
            </div>
          </div>
          
          {stage === 'completed' && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-855 text-on-surface-variant hover:text-on-surface text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900 border-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali / Unggah Baru</span>
            </button>
          )}
        </div>
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
          <div className="lg:col-span-7">
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
                <CompanionSummaryTab handleSeek={handleSeek} />
              )}

              {activeTab === 'chat' && (
                <CompanionChatTab
                  messages={messages}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  isTyping={isTyping}
                  onSendMessage={handleSendMessage}
                  handleSeek={handleSeek}
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

    </div>
  );
}
