import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Calendar, 
  UserCheck, 
  FileText, 
  CheckSquare, 
  Globe, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  ExternalLink,
  ChevronDown,
  Shield,
  Layers,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

interface LandingViewProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onGoToAuth: (isRegister: boolean) => void;
}

export default function LandingView({ theme, onThemeChange, onGoToAuth }: LandingViewProps) {
  // --- STATE INTERACTIVE PLAYGROUND ---
  const [playSeconds, setPlaySeconds] = useState(1500); // 25 menit default
  const [isPlayRunning, setIsPlayRunning] = useState(false);
  const [playStage, setPlayStage] = useState<'work' | 'break'>('work');
  const [playTasks, setPlayTasks] = useState([
    { id: 1, title: 'Menyusun dokumen SRS RPL', done: false, course: 'Rekayasa Perangkat Lunak' },
    { id: 2, title: 'Mempelajari subnetting IPv4', done: true, course: 'Komputasi Awan' },
    { id: 3, title: 'Membuat halaman register Flutter', done: false, course: 'Website Programming Lanjut' },
  ]);

  // Pomodoro countdown simulation
  useEffect(() => {
    let timer: any = null;
    if (isPlayRunning) {
      timer = setInterval(() => {
        setPlaySeconds((prev) => {
          if (prev <= 1) {
            setIsPlayRunning(false);
            if (playStage === 'work') {
              setPlayStage('break');
              return 300; // Istirahat 5 menit
            } else {
              setPlayStage('work');
              return 1500; // Fokus 25 menit
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayRunning, playStage]);

  const toggleTask = (id: number) => {
    setPlayTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const formatPlayTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- STATS ANIMATION SIMULATOR ---
  const [stats, setStats] = useState({ users: 1200, studyHours: 8500, tasksCompleted: 24000 });
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        studyHours: prev.studyHours + Math.floor(Math.random() * 2),
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 4)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300">
      
      {/* Background Decorative Grid and Glowing Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Top Left Gradient Orb */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/[0.06] dark:bg-indigo-600/10 blur-[120px] pointer-events-none z-0" />
      {/* Center Right Gradient Orb */}
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/[0.06] dark:bg-purple-600/10 blur-[120px] pointer-events-none z-0" />
      {/* Bottom Left Gradient Orb */}
      <div className="absolute bottom-[10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-blue-600/[0.06] dark:bg-blue-600/10 blur-[120px] pointer-events-none z-0" />

      {/* --- HEADER NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/60 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Planly</span>
              <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 block tracking-widest uppercase">Academic Workspace</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer flex items-center justify-center"
              title={theme === 'light' ? 'Ubah ke Mode Gelap' : 'Ubah ke Mode Terang'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button 
              onClick={() => onGoToAuth(false)}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            >
              Masuk
            </button>
            <button 
              onClick={() => onGoToAuth(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
            >
              Daftar Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold mb-8 animate-fade-in hover:border-slate-300 dark:hover:border-slate-700 transition-all select-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-550 dark:text-amber-400 fill-amber-550 dark:fill-amber-400" />
          <span>Platform Produktivitas Akademik #1 Mahasiswa</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto text-wrap-balance mb-6">
          Atur Kuliahmu Lebih Cerdas dengan{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient-flow">
            Planly
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed text-wrap-pretty mb-10">
          Kelola jadwal kuliah rutin, deadline tugas, catatan Markdown, verifikasi presensi wajah otomatis, dan sinkronisasi Google Calendar dalam satu workspace modern bebas hambatan.
        </p>

        {/* Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={() => onGoToAuth(true)}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-base font-bold text-white rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            Mulai Secara Gratis
            <ArrowRight className="w-5 h-5" />
          </button>
          <a 
            href="#playground"
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-base font-bold text-slate-700 dark:text-slate-200 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            Coba Demo Interaktif
          </a>
        </div>

        {/* --- PREMIUM MOCKUP SHOWCASE (Screenshots of Actual App) --- */}
        <div className="relative max-w-5xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 p-3 sm:p-4 backdrop-blur-lg shadow-xl dark:shadow-2xl dark:shadow-indigo-950/20 select-none">
          {/* Decorative browser dots */}
          <div className="flex gap-1.5 absolute top-5 left-6 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-550" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-550" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-550" />
          </div>
          
          {/* Real App Screenshot Image */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322] overflow-hidden shadow-sm relative pt-8">
            <img 
              src={theme === 'dark' ? '/planly_today_dark.png' : '/planly_today_light.png'} 
              alt="Dasbor Planly Akademik" 
              className="w-full h-auto object-cover object-top max-h-[420px] sm:max-h-[480px]" 
            />
          </div>
        </div>

        {/* --- STATS COUNTER BAR --- */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mt-20 border-t border-slate-200 dark:border-slate-800/80 pt-12 text-center select-none">
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.users.toLocaleString()}+
            </div>
            <div className="text-[10px] sm:text-xs text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              Mahasiswa Aktif
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {stats.studyHours.toLocaleString()}+
            </div>
            <div className="text-[10px] sm:text-xs text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              Jam Belajar Tercatat
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.tasksCompleted.toLocaleString()}+
            </div>
            <div className="text-[10px] sm:text-xs text-slate-555 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              Tugas Terselesaikan
            </div>
          </div>
        </div>
      </section>
 
      {/* --- BENTO GRID FEATURE SECTION (Keunggulan Planly) --- */}
      <section className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Bento Fitur Unggulan Planly
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Dirancang secara modular dengan teknologi web modern untuk kelancaran studi akademik Anda.
          </p>
        </div>
 
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Absensi Presensi Wajah GPS (Large - Col 8) */}
          <div className="md:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/35 p-6 sm:p-8 backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md dark:hover:shadow-none transition-all group overflow-hidden relative min-h-[320px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-emerald-600/10 rounded-full blur-[80px] group-hover:bg-emerald-600/15 transition-all" />
            
            <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                Sistem Absensi Kamera
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Verifikasi Kehadiran via Kamera & GPS
              </h3>
              <p className="text-slate-655 dark:text-slate-400 text-sm max-w-lg leading-relaxed">
                Lakukan absensi masuk kelas secara aman dalam hitungan detik. Scan wajah snapshot webcam Anda diproses bersama dengan titik koordinat lokasi GPS untuk akurasi presensi masuk yang valid.
              </p>
            </div>
            
            {/* Visual screenshot inside card */}
            <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 h-44 relative shadow-inner">
              <img 
                src={theme === 'dark' ? '/planly_attendance_dark.png' : '/planly_attendance_light.png'} 
                alt="Presensi Wajah Planly" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
          </div>
 
          {/* Card 2: Kalender Dinamis (Medium - Col 4) */}
          <div className="md:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/35 p-6 backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md dark:hover:shadow-none transition-all group flex flex-col justify-between min-h-[320px]">
            <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-indigo-600/10 rounded-full blur-[60px]" />
            
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-6">
              <Calendar className="w-6 h-6" />
            </div>
 
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Kalender & Reschedule
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                Atur pergeseran jam kelas rutin (*reschedule*) dan penandaan kelas libur dinamis per tanggal kalender harian secara terorganisir.
              </p>
            </div>
 
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 h-28 relative shadow-inner">
              <img 
                src={theme === 'dark' ? '/planly_calendar_dark.png' : '/planly_calendar_light.png'} 
                alt="Jadwal Kalender Planly" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
          </div>
 
          {/* Card 3: Pomodoro & Kuliah Live Timer (Medium - Col 4) */}
          <div className="md:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/35 p-6 backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md dark:hover:shadow-none transition-all group flex flex-col justify-between min-h-[320px]">
            <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-purple-600/10 rounded-full blur-[60px]" />
            
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-650 dark:text-purple-400 mb-6">
              <Clock className="w-6 h-6" />
            </div>
 
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Timer Fokus Pomodoro
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                Tingkatkan fokus belajar dengan timer Pomodoro (25 menit belajar, 5 menit istirahat) lengkap dengan bunyi chime penanda otomatis.
              </p>
            </div>
 
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 h-28 relative shadow-inner">
              <img 
                src={theme === 'dark' ? '/planly_workspace_dark.png' : '/planly_workspace_light.png'} 
                alt="Ruang Kerja Pomodoro Planly" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
          </div>
 
          {/* Card 4: Catatan Lampiran Berkas (Large - Col 8) */}
          <div className="md:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/35 p-6 sm:p-8 backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md dark:hover:shadow-none transition-all group overflow-hidden relative min-h-[320px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-blue-600/10 rounded-full blur-[80px]" />
            
            <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-650 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 text-blue-650 dark:text-blue-400 px-3 py-1 rounded-full">
                Lampiran Berkas Terikat
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Catatan Markdown & Pengunggah Dokumen
              </h3>
              <p className="text-slate-655 dark:text-slate-400 text-sm max-w-lg leading-relaxed">
                Tulis rangkuman kuliah dengan Formatting Toolbar instan (headers, checklists, list bullet) serta kaitkan berkas lampiran materi kuliah (maksimal 1.5MB per file) yang tersimpan secara dinamis.
              </p>
            </div>
 
            {/* Visual screenshot inside card */}
            <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 h-44 relative shadow-inner">
              <img 
                src={theme === 'dark' ? '/planly_notes_dark.png' : '/planly_notes_light.png'} 
                alt="Catatan Kuliah Planly" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
          </div>
 
        </div>
      </section>
 
      {/* --- PLAYGROUND: DEMO INTERAKTIF TIMER & CHECKLIST (Playground 21st.dev Style) --- */}
      <section id="playground" className="relative z-10 py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-900 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Uji Coba Demo Sandbox Planly
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Cobalah interaksi timer fokus dan penandaan checklist tugas di bawah ini secara langsung.
          </p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Playground Left: Interactive Pomodoro Timer widget */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322] p-6 sm:p-8 flex flex-col justify-between min-h-[360px] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modul Timer Pomodoro</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                playStage === 'work' ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-650 dark:text-purple-400 border border-purple-500/20'
              }`}>
                {playStage === 'work' ? 'Sesi Belajar' : 'Sesi Istirahat'}
              </span>
            </div>
 
            <div className="flex flex-col items-center justify-center my-6">
              <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tight select-none font-mono">
                {formatPlayTime(playSeconds)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                {isPlayRunning ? 'Timer sedang berjalan...' : 'Timer dihentikan sementara'}
              </p>
            </div>
 
            <div className="flex gap-4">
              <button
                onClick={() => setIsPlayRunning(!isPlayRunning)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 ${
                  isPlayRunning 
                    ? 'bg-red-555 hover:bg-red-650 active:bg-red-750 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                }`}
              >
                {isPlayRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayRunning ? 'Jeda Timer' : 'Mulai Fokus'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlayRunning(false);
                  setPlaySeconds(playStage === 'work' ? 1500 : 300);
                }}
                className="px-4 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors"
                aria-label="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Playground Right: Interactive Checklist Tasks */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322] p-6 sm:p-8 flex flex-col justify-between min-h-[360px] shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modul Checklist Tugas Kuliah</span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Centang Instan</span>
              </div>

              <div className="space-y-3">
                {playTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                      task.done 
                        ? 'border-indigo-200 dark:border-indigo-600/40 bg-indigo-50/20 dark:bg-indigo-600/5 text-slate-450 dark:text-slate-400 opacity-75' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-350 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      task.done 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${task.done ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-500 font-semibold mt-0.5">{task.course}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold text-center border-t border-slate-100 dark:border-slate-900 pt-4 mt-4">
              Centang checkbox di atas untuk melihat bagaimana state aplikasi menyinkronkan tugas selesai secara dinamis.
            </div>
          </div>

        </div>
      </section>

      {/* --- FAQ SECTION (Using modern details style from guidelines) --- */}
      <section className="relative z-10 py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Pertanyaan Umum (FAQ)
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Temukan jawaban dari hal-hal yang sering ditanyakan seputar platform Planly.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Apakah Planly memerlukan koneksi internet untuk digunakan?',
              a: 'Tidak selalu. Planly mendukung sinkronisasi lokal (Local Offline Mode) yang menyimpan data Anda secara aman di local storage browser. Namun, jika Anda ingin menyinkronkan data dengan server Laravel eksternal atau melakukan ekspor Google Calendar, Anda memerlukan koneksi internet.'
            },
            {
              q: 'Bagaimana cara kerja sinkronisasi kalender di Planly?',
              a: 'Planly mengekspor jadwal kuliah mingguan, reschedule khusus tanggal tertentu, serta tugas kuliah ke format iCalendar (.ics). Anda dapat mendownload berkas .ics tersebut atau menyalin link feed kalender dinamis untuk dilanggan (subscribe) langsung dari Google Calendar / Apple Calendar.'
            },
            {
              q: 'Apakah verifikasi wajah pada absensi dienkripsi secara aman?',
              a: 'Ya. Foto snapshot kamera Anda dikonversi menjadi data format Base64 yang dikirimkan secara terenkripsi ke backend server melalui protokol HTTPS. Data tersebut hanya dicatat sebagai tanda bukti riwayat kehadiran Anda di kelas kuliah yang aktif.'
            },
            {
              q: 'Apakah database Planly terintegrasi dengan Laravel Sanctum?',
              a: 'Tentu saja. Di sisi backend, kami telah merancang panduan database migrasi dan controller Laravel 11 lengkap yang kompatibel 100% menggunakan Laravel Sanctum token otentikasi. Anda dapat melihat panduan integrasi ini di dalam file BACKEND_INTEGRATION.md.'
            }
          ].map((item, idx) => (
            <details 
              key={idx} 
              className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-slate-350 dark:hover:border-slate-700/60 transition-all shadow-sm"
            >
              <summary className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 select-none">
                <span>{item.q}</span>
                <ChevronDown className="w-5 h-5 text-slate-505 dark:text-slate-400 group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-3.5 border-t border-slate-150 dark:border-slate-800/80 pt-3.5 text-wrap-pretty cursor-default">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="relative z-10 py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-slate-250 dark:border-slate-800/80 bg-white dark:bg-gradient-to-r dark:from-indigo-950/20 dark:via-slate-900/30 dark:to-indigo-950/20 p-8 sm:p-16 backdrop-blur-md relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Siap Mengatur Kuliahmu Secara Maksimal?
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-medium mb-8">
            Daftarkan diri Anda sekarang dan buat workspace perkuliahan Anda sendiri. Rasakan kemudahan menyusun jadwal secara fleksibel.
          </p>

          <button
            onClick={() => onGoToAuth(true)}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white rounded-2xl shadow-xl shadow-indigo-600/25 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            Mulai Sekarang — Gratis
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-900 bg-slate-100 dark:bg-[#0B0F19] py-12 text-center text-xs text-slate-500 font-semibold select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Planly App</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Planly. Hak Cipta Dilindungi Undang-Undang.
          </div>

          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1 transition-colors">
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
