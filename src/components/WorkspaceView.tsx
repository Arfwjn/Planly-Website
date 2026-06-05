import { useState, useEffect, useRef, FormEvent } from 'react';
import { Play, Pause, RotateCcw, Timer, BookOpen, Award, FileText, Plus, Trash2, Calendar, Volume2, VolumeX, Flame } from 'lucide-react';
import { Course, Task, Note, SidebarTab } from '../types';
import { useToast } from './ui/Toast';
import CustomSelect from './ui/CustomSelect';
import type { SelectOption } from './ui/CustomSelect';
import { synthAudio } from '../services/synthAudio';



interface WorkspaceViewProps {
  courses: Course[];
  tasks: Task[];
  onAddNote: (newNote: Omit<Note, 'id' | 'user_id'>) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'user_id'>, silent?: boolean) => Promise<any>;
  onTabChange: (tab: SidebarTab) => void;
  
  // State Pomodoro dari App.tsx (Root)
  focusTimeLeft: number;
  setFocusTimeLeft: (val: number | ((prev: number) => number)) => void;
  isFocusTimerRunning: boolean;
  setIsFocusTimerRunning: (val: boolean) => void;
  onResetFocusTimer: () => void;
  pomodoroStage: 'work' | 'short-break' | 'long-break';
  setPomodoroStage: (val: 'work' | 'short-break' | 'long-break') => void;
  pomodoroTaskId: number | null;
  setPomodoroTaskId: (val: number | null) => void;
  completedPomodoroCount: number;
  setCompletedPomodoroCount: (val: number) => void;
  
  // State Workspace (Lecture)
  workspaceMode: 'pomodoro' | 'lecture';
  setWorkspaceMode: (val: 'pomodoro' | 'lecture') => void;
  
  lectureTime: number;
  setLectureTime: (val: number | ((prev: number) => number)) => void;
  isLectureRunning: boolean;
  setIsLectureRunning: (val: boolean) => void;
  activeLectureCourseId: number | null;
  setActiveLectureCourseId: (val: number | null) => void;
  lectureNoteContent: string;
  setLectureNoteContent: (val: string) => void;
}

// Pilihan Efek Suara Latar Belajar Kualitas Premium (Sintetis Real-Time)
const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Hening (Tanpa Suara)' },
  { id: 'rain', name: 'Rintik Hujan Syahdu (Rain)' },
  { id: 'lofi', name: 'Musik Fokus Lo-Fi (Lofi Synth)' },
  { id: 'nature', name: 'Kebisingan Alam (Nature Wind)' },
  { id: 'ocean', name: 'Deburan Ombak Pantai (Ocean)' },
  { id: 'fireplace', name: 'Perapian Kayu Hangat (Fireplace)' },
  { id: 'crickets', name: 'Jangkrik Malam Pedesaan (Crickets)' },
  { id: 'cafe', name: 'Suasana Kafe Tenang (Coffee Shop)' },
  { id: 'train', name: 'Perjalanan Kereta Malam (Night Train)' }
];

export default function WorkspaceView({
  courses,
  tasks,
  onAddNote,
  onAddTask,
  onTabChange,
  focusTimeLeft,
  isFocusTimerRunning,
  setIsFocusTimerRunning,
  onResetFocusTimer,
  pomodoroStage,
  setPomodoroStage,
  pomodoroTaskId,
  setPomodoroTaskId,
  completedPomodoroCount,
  setCompletedPomodoroCount,
  workspaceMode,
  setWorkspaceMode,
  lectureTime,
  setLectureTime,
  isLectureRunning,
  setIsLectureRunning,
  activeLectureCourseId,
  setActiveLectureCourseId,
  lectureNoteContent,
  setLectureNoteContent
}: WorkspaceViewProps) {
  const toast = useToast();
  const [selectedSound, setSelectedSound] = useState('none');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // State lokal untuk pengelolaan Tugas Baru selama kuliah live
  const [localTasks, setLocalTasks] = useState<{ title: string; deadline: string }[]>([]);
  const [taskInputTitle, setTaskInputTitle] = useState('');
  // Set default deadline 7 hari dari sekarang
  const getDefaultDeadlineDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };
  const [taskInputDeadline, setTaskInputDeadline] = useState(getDefaultDeadlineDate());

  // Filter tugas yang belum selesai untuk dropdown Pomodoro
  const pendingTasks = tasks.filter(t => !t.is_finished);

  // Build option arrays dynamically for CustomSelect
  const ambientSoundOptions: SelectOption[] = AMBIENT_SOUNDS.map(sound => ({
    value: sound.id,
    label: sound.name
  }));

  const courseOptions: SelectOption[] = [
    { value: '', label: '-- Pilih Mata Kuliah --' },
    ...courses.map(course => ({
      value: String(course.id),
      label: `${course.course_code} - ${course.course_name}`
    }))
  ];

  const pomodoroTaskOptions: SelectOption[] = [
    { value: '', label: '-- Tidak Ada Tugas Terikat (Umum) --' },
    ...pendingTasks.map(task => ({
      value: String(task.id),
      label: task.task_title
    }))
  ];

  // Format detil waktu ke string MM:SS atau HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Efek perpindahan audio ambient dan kontrol play/pause seirama status timer
  useEffect(() => {
    const isAnyTimerRunning = isFocusTimerRunning || isLectureRunning;
    
    if (selectedSound !== 'none' && isAnyTimerRunning) {
      synthAudio.play(selectedSound);
      synthAudio.setVolume(isAudioMuted ? 0 : 0.4);
    } else {
      synthAudio.stop();
    }

    return () => {
      synthAudio.stop();
    };
  }, [selectedSound, isFocusTimerRunning, isLectureRunning]);

  // Efek sinkronisasi volume / mute
  useEffect(() => {
    synthAudio.setVolume(isAudioMuted ? 0 : 0.4);
  }, [isAudioMuted]);

  const handleMuteToggle = () => {
    setIsAudioMuted(prev => !prev);
  };

  // Kalkulasi persentase Progress Ring melingkar
  const getProgressPercentage = () => {
    if (workspaceMode === 'pomodoro') {
      const totalSeconds = pomodoroStage === 'work' ? 1500 : pomodoroStage === 'short-break' ? 300 : 900;
      return (focusTimeLeft / totalSeconds) * 100;
    }
    if (workspaceMode === 'lecture') {
      // Untuk kuliah berjalan maju, buat lingkaran berputar perlahan sebagai feedback visual
      return ((lectureTime % 60) / 60) * 100;
    }
    return 100;
  };

  const circumference = 2 * Math.PI * 80; // r = 80 -> ~502.4
  const strokeDashoffset = circumference - (getProgressPercentage() / 100) * circumference;

  // Handle Aksi Mulai/Jeda
  const handleStartPause = () => {
    if (workspaceMode === 'pomodoro') {
      setIsFocusTimerRunning(!isFocusTimerRunning);
    } else if (workspaceMode === 'lecture') {
      if (!activeLectureCourseId) {
        toast.warning('Silakan pilih mata kuliah yang diikuti terlebih dahulu!');
        return;
      }
      setIsLectureRunning(!isLectureRunning);
    }
  };

  // Handle Aksi Reset
  const handleReset = () => {
    if (workspaceMode === 'pomodoro') {
      onResetFocusTimer();
    } else if (workspaceMode === 'lecture') {
      if (confirm('Batalkan dan atur ulang sesi kuliah live ini? Catatan dan tugas baru Anda tidak akan disimpan.')) {
        setIsLectureRunning(false);
        setLectureTime(0);
        setLectureNoteContent('');
        setActiveLectureCourseId(null);
        setLocalTasks([]);
      }
    }
  };

  // Tambah Tugas lokal di Kuliah Live
  const handleAddLocalTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskInputTitle.trim()) {
      toast.warning('Nama tugas tidak boleh kosong!');
      return;
    }
    setLocalTasks([...localTasks, { title: taskInputTitle, deadline: taskInputDeadline }]);
    setTaskInputTitle('');
    setTaskInputDeadline(getDefaultDeadlineDate());
  };

  const handleRemoveLocalTask = (index: number) => {
    setLocalTasks(localTasks.filter((_, i) => i !== index));
  };

  // Menyimpan Catatan Kuliah dan Menyelesaikan Sesi Kuliah
  const handleFinishLecture = () => {
    if (!activeLectureCourseId) {
      toast.warning('Silakan pilih mata kuliah terlebih dahulu.');
      return;
    }

    if (!lectureNoteContent.trim() && localTasks.length === 0) {
      if (!confirm('Catatan kuliah dan daftar tugas masih kosong. Apakah Anda yakin ingin menyelesaikan perkuliahan?')) {
        return;
      }
    }

    const course = courses.find(c => c.id === activeLectureCourseId);
    const courseName = course ? course.course_name : 'Mata Kuliah';
    const courseId = course ? course.id : null;
    
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const durationMin = Math.floor(lectureTime / 60);
    
    // Menyusun Konten Markdown Catatan
    let fullContent = `## Catatan Kuliah: ${courseName}
* **Tanggal**: ${todayStr}
* **Durasi Kuliah**: ${durationMin} menit

### Rangkuman Materi Perkuliahan:
${lectureNoteContent || '*(Tidak ada catatan materi ditulis)*'}
`;

    if (localTasks.length > 0) {
      fullContent += `\n### Tugas & PR Baru dari Kuliah Ini:
` + localTasks.map((t, idx) => `${idx + 1}. **${t.title}** (Batas Waktu: ${t.deadline})`).join('\n');
    }

    // 1. Simpan Catatan (Note)
    onAddNote({
      course_id: courseId,
      title: `Catatan Kuliah: ${courseName} (${todayStr})`,
      content: fullContent
    });

    // 2. Simpan semua Tugas Baru secara massal (Silent)
    const taskPromises = localTasks.map(t => {
      return onAddTask({
        course_id: activeLectureCourseId,
        task_title: t.title,
        description: `Ditambahkan otomatis dari Sesi Kuliah Live: ${courseName}`,
        deadline: `${t.deadline} 23:59:59`,
        is_finished: false,
        is_priority: false
      }, true); // true = silent (tanpa pop up alert individual)
    });

    Promise.all(taskPromises).then(() => {
      toast.success('Catatan kuliah dan daftar tugas baru berhasil disimpan secara sinkron!');
      
      // Reset State
      setIsLectureRunning(false);
      setLectureTime(0);
      setLectureNoteContent('');
      setActiveLectureCourseId(null);
      setLocalTasks([]);
      
      // Auto-redirect ke tab Notes
      onTabChange('notes');
    }).catch(err => {
      console.error('Error saving tasks', err);
      toast.error('Catatan kuliah disimpan, namun beberapa tugas gagal disimpan.');
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Mode Switcher Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Ruang Belajar</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Dasbor produktivitas terintegrasi mahasiswa untuk fokus Pomodoro dan mencatat perkuliahan.
          </p>
        </div>
        
        {/* Tab Selector Mode (Pomodoro vs Kuliah Live) */}
        <div className="flex bg-[#F1F5F9] dark:bg-card-bg border border-card-border p-1 rounded-xl shadow-2xs">
          <button
            onClick={() => {
              if (isLectureRunning) {
                toast.warning('Silakan jeda atau selesaikan timer kuliah aktif Anda sebelum berpindah mode.');
                return;
              }
              setWorkspaceMode('pomodoro');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceMode === 'pomodoro'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Sesi Pomodoro
          </button>
          
          <button
            onClick={() => {
              if (isFocusTimerRunning) {
                toast.warning('Silakan jeda timer fokus Pomodoro aktif Anda sebelum berpindah mode.');
                return;
              }
              setWorkspaceMode('lecture');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceMode === 'lecture'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Kuliah Live
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Timer Workspace (Lebar 1 kolom jika di mode kuliah live, lebar 3 kolom jika mode Pomodoro) */}
        <div className={`bg-white dark:bg-card-bg border border-card-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[350px] relative ${
          workspaceMode === 'lecture' ? 'lg:col-span-1' : 'lg:col-span-3'
        }`}>
          
          {/* Lencana Status Pomodoro */}
          {workspaceMode === 'pomodoro' && (
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                pomodoroStage === 'work'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${pomodoroStage === 'work' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                {pomodoroStage === 'work' 
                  ? 'Sesi Fokus Kerja' 
                  : pomodoroStage === 'short-break' 
                    ? 'Istirahat Pendek' 
                    : 'Istirahat Panjang'}
              </span>
            </div>
          )}

          {/* Pengaturan Audio Ambient (Kanan Atas) */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <CustomSelect
              value={selectedSound}
              onChange={(val) => setSelectedSound(val)}
              options={ambientSoundOptions}
              placeholder="Pilih Suara..."
              position="down"
            />
            
            {selectedSound !== 'none' && (
              <button
                onClick={handleMuteToggle}
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-slate-100 dark:hover:bg-input-bg rounded-lg cursor-pointer transition-colors"
                title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-primary" />}
              </button>
            )}
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-52 h-52 flex items-center justify-center my-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Latar Belakang Lingkaran */}
              <circle
                cx="100"
                cy="100"
                r="80"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Cincin Progres Mengalir */}
              <circle
                cx="100"
                cy="100"
                r="80"
                className={`transition-all duration-300 ${
                  workspaceMode === 'pomodoro' && pomodoroStage !== 'work'
                    ? 'stroke-green-500'
                    : 'stroke-primary'
                }`}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Teks Waktu di Tengah Lingkaran */}
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold tracking-tight text-on-surface block leading-none">
                {workspaceMode === 'pomodoro' 
                  ? formatTime(focusTimeLeft) 
                  : formatTime(lectureTime)}
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1 block">
                {workspaceMode === 'pomodoro'
                  ? (isFocusTimerRunning ? 'FOKUS' : 'JEDA')
                  : (isLectureRunning ? 'KULIAH' : 'BELUM MULAI')}
              </span>
            </div>
          </div>

          {/* Tombol Kendali Timer */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleReset}
              className="p-2 border border-card-border hover:bg-slate-50 dark:hover:bg-input-bg text-on-surface-variant hover:text-on-surface rounded-xl cursor-pointer transition-colors shadow-2xs"
              title="Atur Ulang Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleStartPause}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer transition-all flex items-center gap-2 text-white ${
                workspaceMode === 'pomodoro' && isFocusTimerRunning
                  ? 'bg-red-500 hover:bg-red-600'
                  : workspaceMode === 'lecture' && isLectureRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-[#4F46E5]'
              }`}
            >
              {workspaceMode === 'pomodoro' && isFocusTimerRunning ? <Pause className="w-4 h-4" /> : 
               workspaceMode === 'lecture' && isLectureRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>
                {workspaceMode === 'pomodoro' && isFocusTimerRunning ? 'Jeda Sesi' :
                 workspaceMode === 'lecture' && isLectureRunning ? 'Jeda Kuliah' : 'Mulai Kuliah'}
              </span>
            </button>
          </div>

          {/* Opsi Tambahan Bawah sesuai Mode */}
          {workspaceMode === 'pomodoro' && (
            <div className="mt-8 w-full max-w-sm space-y-4 text-center">
              {/* Dropdown Pengikatan Tugas */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Tautkan dengan Tugas Akademik:
                </label>
                <CustomSelect
                  value={pomodoroTaskId === null ? '' : String(pomodoroTaskId)}
                  onChange={(val) => setPomodoroTaskId(val === '' ? null : Number(val))}
                  options={pomodoroTaskOptions}
                  placeholder="-- Tidak Ada Tugas Terikat (Umum) --"
                />
              </div>

              {/* Indikator Siklus Pomodoro */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((cycle) => {
                    const activeCount = completedPomodoroCount % 4;
                    const isCompleted = cycle <= activeCount || (activeCount === 0 && completedPomodoroCount > 0);
                    return (
                      <span
                        key={cycle}
                        className={`w-2.5 h-2.5 rounded-full border transition-all ${
                          isCompleted
                            ? 'bg-primary border-primary ring-2 ring-primary/20'
                            : 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                        title={`Siklus ke-${cycle}`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">
                  Total Sesi Selesai: <strong className="text-on-surface">{completedPomodoroCount}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Info Mata Kuliah terpilih di Mode Kuliah */}
          {workspaceMode === 'lecture' && (
            <div className="mt-6 w-full space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Pilih Mata Kuliah Kuliah Aktif:
                </label>
                <CustomSelect
                  value={activeLectureCourseId === null ? '' : String(activeLectureCourseId)}
                  onChange={(val) => setActiveLectureCourseId(val === '' ? null : Number(val))}
                  options={courseOptions}
                  placeholder="-- Pilih Mata Kuliah --"
                />
              </div>

              {activeLectureCourseId && (
                <div className="p-3.5 bg-slate-50 dark:bg-input-bg border border-card-border rounded-xl text-left space-y-1 text-xs">
                  <div className="font-bold text-on-surface">
                    {courses.find(c => c.id === activeLectureCourseId)?.course_name}
                  </div>
                  <div className="text-on-surface-variant">
                    Dosen: {courses.find(c => c.id === activeLectureCourseId)?.lecturer_name}
                  </div>
                  <div className="text-on-surface-variant">
                    Ruangan: {courses.find(c => c.id === activeLectureCourseId)?.room}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Kolom Kanan: Catatan Kuliah Split-screen & Tugas Terpisah (Hanya tampil di Mode Kuliah) */}
        {workspaceMode === 'lecture' && (
          <div className="lg:col-span-2 flex flex-col gap-6 h-auto">
            
            {/* Panel Catatan Kuliah */}
            <div className="bg-white dark:bg-card-bg border border-card-border rounded-2xl p-5 shadow-sm flex flex-col flex-1 min-h-[250px]">
              <div className="flex items-center justify-between border-b border-card-border pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-on-surface">Catatan Kuliah (Materi)</h3>
                </div>
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Materi
                </span>
              </div>

              <textarea
                className="flex-1 w-full bg-[#F8FAFC] dark:bg-input-bg border border-card-border rounded-xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant placeholder:font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[150px] font-sans"
                placeholder="Ketik ringkasan materi, teori, rumus, atau poin penjelasan dosen langsung di sini..."
                value={lectureNoteContent}
                onChange={(e) => setLectureNoteContent(e.target.value)}
                disabled={!activeLectureCourseId}
              />
            </div>

            {/* Panel Tugas & PR Baru dari Kuliah */}
            <div className="bg-white dark:bg-card-bg border border-card-border rounded-2xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-card-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-on-surface">Daftar Tugas Baru dari Kuliah Ini</h3>
                </div>
                <span className="text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Tugas / PR
                </span>
              </div>

              {/* Form Tambah Tugas */}
              <form onSubmit={handleAddLocalTask} className="flex flex-col sm:flex-row gap-2.5 items-end sm:items-center">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Contoh: Membuat laporan Bab 3..."
                    className="w-full bg-[#F8FAFC] dark:bg-input-bg border border-card-border rounded-xl py-2 px-3 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant font-medium"
                    value={taskInputTitle}
                    onChange={(e) => setTaskInputTitle(e.target.value)}
                    disabled={!activeLectureCourseId}
                  />
                </div>
                
                <div className="w-full sm:w-auto">
                  <input
                    type="date"
                    className="w-full sm:w-auto bg-[#F8FAFC] dark:bg-input-bg border border-card-border rounded-xl py-2 px-3 text-xs text-on-surface focus:outline-none cursor-pointer font-medium"
                    value={taskInputDeadline}
                    onChange={(e) => setTaskInputDeadline(e.target.value)}
                    disabled={!activeLectureCourseId}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!activeLectureCourseId || !taskInputTitle.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-on-surface-variant text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>

              {/* List Tugas Baru Lokal */}
              {localTasks.length > 0 ? (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {localTasks.map((t, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-input-bg border border-card-border rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="font-bold text-on-surface">{t.title}</span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-on-surface-variant font-semibold">
                          Deadline: {t.deadline}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocalTask(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                        title="Hapus tugas dari list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50/50 dark:bg-input-bg/30 border border-dashed border-card-border rounded-xl">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Belum ada tugas baru yang ditambahkan selama perkuliahan ini.
                  </span>
                </div>
              )}

              {/* Tombol Selesaikan Sesi */}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-[10px] text-on-surface-variant font-semibold">
                  Menyelesaikan kuliah akan merekam catatan materi dan semua tugas di atas sekaligus.
                </span>
                
                <button
                  type="button"
                  onClick={handleFinishLecture}
                  disabled={!activeLectureCourseId}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-on-surface-variant text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Selesaikan Perkuliahan</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
