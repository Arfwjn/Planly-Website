/**
 * =============================================================================
 * Planly — CircularTimer.tsx
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


import { Play, Pause, RotateCcw } from 'lucide-react';

interface CircularTimerProps {
  workspaceMode: 'pomodoro' | 'lecture';
  pomodoroStage: 'work' | 'short-break' | 'long-break';
  focusTimeLeft: number;
  lectureTime: number;
  isFocusTimerRunning: boolean;
  isLectureRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
}

/**
 * Komponen CircularTimer
 * 
 * Penggambar jam melingkar SVG (radial progress ring) untuk menghitung sisa waktu Pomodoro (mundur)
 * maupun durasi kuliah live (maju). Menyediakan visualisasi progress bar yang responsif.
 */
export default function CircularTimer({
  workspaceMode,
  pomodoroStage,
  focusTimeLeft,
  lectureTime,
  isFocusTimerRunning,
  isLectureRunning,
  onStartPause,
  onReset
}: CircularTimerProps) {
  
  // Format waktu ke string (MM:SS atau HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Kalkulasi persentase Progress Ring melingkar
  const getProgressPercentage = () => {
    if (workspaceMode === 'pomodoro') {
      const totalSeconds = pomodoroStage === 'work' ? 1500 : pomodoroStage === 'short-break' ? 300 : 900;
      return (focusTimeLeft / totalSeconds) * 100;
    }
    if (workspaceMode === 'lecture') {
      return ((lectureTime % 60) / 60) * 100;
    }
    return 100;
  };

  const circumference = 2 * Math.PI * 80; // r = 80 -> ~502.4
  const strokeDashoffset = circumference - (getProgressPercentage() / 100) * circumference;

  const isRunning = workspaceMode === 'pomodoro' ? isFocusTimerRunning : isLectureRunning;

  return (
    <div className="flex flex-col items-center justify-center">
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
        <div className="absolute text-center select-none">
          <span className="text-4xl font-extrabold tracking-tight text-on-surface block leading-none">
            {workspaceMode === 'pomodoro' 
              ? formatTime(focusTimeLeft) 
              : formatTime(lectureTime)}
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1.5 block">
            {workspaceMode === 'pomodoro'
              ? (isFocusTimerRunning ? 'FOKUS' : 'JEDA')
              : (isLectureRunning ? 'KULIAH' : 'BELUM MULAI')}
          </span>
        </div>
      </div>

      {/* Tombol Kendali Timer */}
      <div className="flex items-center gap-4 mt-2">
        {/* Reset Button */}
        <button
          onClick={onReset}
          className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant hover:text-on-surface rounded-xl cursor-pointer transition-colors shadow-2xs bg-white dark:bg-slate-900"
          title="Atur Ulang Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        {/* Play/Pause Button */}
        <button
          onClick={onStartPause}
          className={`px-8 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer transition-all flex items-center gap-2 text-white border-none ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-primary hover:bg-[#4F46E5]'
          }`}
        >
          {isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>
            {workspaceMode === 'pomodoro' && isFocusTimerRunning ? 'Jeda Sesi' :
             workspaceMode === 'lecture' && isLectureRunning ? 'Jeda Kuliah' : 
             workspaceMode === 'lecture' ? 'Mulai Kuliah' : 'Mulai Sesi'}
          </span>
        </button>
      </div>
    </div>
  );
}
