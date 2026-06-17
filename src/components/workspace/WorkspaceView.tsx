/**
 * =============================================================================
 * Planly — WorkspaceView.tsx
 * 
 * Kegunaan:
 * Berkas kode dalam proyek Planly.
 * 
 * Relasi & Dependency:
 * - Berhubungan dengan modul utama aplikasi.
 * 
 * Aliran Data / State:
 * - Mengikuti alur data terpadu (REST API / local mock storage).
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import { Flame, BookOpen, Timer } from 'lucide-react';
import { Course, Task, Note, SidebarTab } from '../../types';
import { useToast } from '../ui/Toast';
import { synthAudio } from '../../services/audio/synthAudio';

// Import sub-komponen modular
import AmbientSoundSelector from './AmbientSoundSelector';
import CircularTimer from './CircularTimer';
import PomodoroControls from './PomodoroControls';
import LectureNotePanel from './LectureNotePanel';
import LectureTaskPanel from './LectureTaskPanel';
import CustomSelect from '../ui/CustomSelect';
import Skeleton from '../ui/Skeleton';

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
  loading?: boolean;
}

/**
 * Komponen WorkspaceView (Orchestrator)
 * 
 * Pengelola Ruang Belajar mahasiswa.
 * Mendukung perpindahan mode belajar (Pomodoro Timer vs Sesi Kuliah Live dengan Catatan/Tugas terintegrasi).
 */
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
  pomodoroTaskId,
  setPomodoroTaskId,
  completedPomodoroCount,
  workspaceMode,
  setWorkspaceMode,
  lectureTime,
  setLectureTime,
  isLectureRunning,
  setIsLectureRunning,
  activeLectureCourseId,
  setActiveLectureCourseId,
  lectureNoteContent,
  setLectureNoteContent,
  loading = false
}: WorkspaceViewProps) {
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="w-44 h-8 rounded-lg" />
            <Skeleton className="w-72 h-4 rounded-md" />
          </div>
          <Skeleton className="w-48 h-10 rounded-lg" />
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Timer skeleton */}
          <div className="lg:col-span-2 bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <Skeleton className="w-56 h-56 rounded-full" />
            <Skeleton className="w-32 h-6 rounded-md mt-6" />
            <Skeleton className="w-48 h-10 rounded-lg mt-4" />
          </div>
          {/* Right Panel: Notes/Tasks panel skeletons */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-4">
              <Skeleton className="w-24 h-5 rounded-md" />
              <Skeleton className="w-full h-32 rounded-lg" />
            </div>
            <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-4">
              <Skeleton className="w-24 h-5 rounded-md" />
              <Skeleton className="w-full h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toast = useToast();
  const [selectedSound, setSelectedSound] = useState('none');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // State lokal untuk draft Tugas Baru selama kuliah live
  const [localTasks, setLocalTasks] = useState<{ title: string; deadline: string }[]>([]);

  // Efek menyalakan/mematikan audio ambient seirama status timer
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

  // Handle Mulai / Jeda
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

  // Handle Reset Timer
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
  const handleAddTaskSubmit = (title: string, deadline: string) => {
    setLocalTasks(prev => [...prev, { title, deadline }]);
  };

  const handleRemoveLocalTask = (index: number) => {
    setLocalTasks(prev => prev.filter((_, i) => i !== index));
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
    
    // Menyusun Konten Catatan
    let fullContent = `## Catatan Kuliah: ${courseName}
* **Tanggal**: ${todayStr}
* **Durasi Kuliah**: ${durationMin} menit

### Rangkuman Materi Perkuliahan:
${lectureNoteContent || '*(Tidak ada catatan materi ditulis)*'}
`;

    if (localTasks.length > 0) {
      fullContent += `\n### Tugas & PR Baru dari Kuliah Ini:\n` + 
        localTasks.map((t, idx) => `${idx + 1}. **${t.title}** (Batas Waktu: ${t.deadline})`).join('\n');
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
      toast.success('Catatan kuliah dan daftar tugas baru berhasil disimpan!');
      
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

  // Opsi Dropdown Mata Kuliah
  const courseOptions = [
    { value: '', label: '-- Pilih Mata Kuliah --' },
    ...courses.map(course => ({
      value: String(course.id),
      label: `${course.course_code} - ${course.course_name}`
    }))
  ];

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Header Mode Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-150 dark:border-slate-800 pb-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
            <Timer className="w-8 h-8 text-primary" />
            <span>Ruang Belajar</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Dasbor produktivitas terintegrasi mahasiswa untuk fokus Pomodoro dan mencatat perkuliahan.
          </p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-white/45 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/40 p-1 rounded-xl shadow-2xs backdrop-blur-md select-none">
          <button
            onClick={() => {
              if (isLectureRunning) {
                toast.warning('Silakan jeda atau selesaikan timer kuliah aktif Anda sebelum berpindah mode.');
                return;
              }
              setWorkspaceMode('pomodoro');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
              workspaceMode === 'pomodoro'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface bg-transparent'
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
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
              workspaceMode === 'lecture'
                ? 'bg-primary text-white shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface bg-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Kuliah Live
          </button>
        </div>
      </div>

      {/* Grid Utama layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Timer Panel */}
        <div className={`bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center min-h-[350px] relative ${
          workspaceMode === 'lecture' ? 'lg:col-span-1' : 'lg:col-span-3'
        }`}>
          
          {/* Lencana Status Sesi Pomodoro */}
          {workspaceMode === 'pomodoro' && (
            <div className="absolute top-4 left-4 select-none">
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

          {/* Pemilih Suara Ambient */}
          <div className="absolute top-4 right-4 select-none">
            <AmbientSoundSelector
              selectedSound={selectedSound}
              onSelectedSoundChange={setSelectedSound}
              isAudioMuted={isAudioMuted}
              onMuteToggle={() => setIsAudioMuted(!isAudioMuted)}
            />
          </div>

          {/* Cincin Jam/Timer Bulat */}
          <CircularTimer
            workspaceMode={workspaceMode}
            pomodoroStage={pomodoroStage}
            focusTimeLeft={focusTimeLeft}
            lectureTime={lectureTime}
            isFocusTimerRunning={isFocusTimerRunning}
            isLectureRunning={isLectureRunning}
            onStartPause={handleStartPause}
            onReset={handleReset}
          />

          {/* Kontrol Pomodoro (Dropdown Tugas & Dots Siklus) */}
          {workspaceMode === 'pomodoro' && (
            <PomodoroControls
              tasks={tasks}
              pomodoroTaskId={pomodoroTaskId}
              setPomodoroTaskId={setPomodoroTaskId}
              completedPomodoroCount={completedPomodoroCount}
            />
          )}

          {/* Pilihan Mata Kuliah pada Mode Kuliah Live */}
          {workspaceMode === 'lecture' && (
            <div className="mt-6 w-full space-y-4 text-left">
              <div className="space-y-1.5">
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
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1 text-xs">
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

        {/* Kolom Kanan: Catatan Kuliah & Panel Tugas Live (Hanya tampil di Mode Kuliah) */}
        {workspaceMode === 'lecture' && (
          <div className="lg:col-span-2 flex flex-col gap-6 h-auto">
            {/* Editor Catatan */}
            <LectureNotePanel
              activeLectureCourseId={activeLectureCourseId}
              lectureNoteContent={lectureNoteContent}
              setLectureNoteContent={setLectureNoteContent}
            />

            {/* Pencatatan Tugas Baru */}
            <LectureTaskPanel
              activeLectureCourseId={activeLectureCourseId}
              localTasks={localTasks}
              onAddTaskSubmit={handleAddTaskSubmit}
              onRemoveLocalTask={handleRemoveLocalTask}
              onFinishLecture={handleFinishLecture}
            />
          </div>
        )}

      </div>
    </div>
  );
}
