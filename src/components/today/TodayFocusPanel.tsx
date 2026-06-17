/**
 * =============================================================================
 * Planly — TodayFocusPanel.tsx
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

import React from 'react';
import { Pause, Play, Sparkles } from 'lucide-react';
import { Task, SidebarTab } from '../../types';
import { hexToRgb } from '../../utils/color';

interface TodayFocusPanelProps {
  focusTimeLeft: number;
  isFocusTimerRunning: boolean;
  setIsFocusTimerRunning: (val: boolean) => void;
  pomodoroStage: 'work' | 'short-break' | 'long-break';
  activeFocusTask: Task | undefined;
  completedCount: number;
  totalTasksCount: number;
  progressPercentage: number;
  onTabChange: (tab: SidebarTab) => void;
}

/**
 * Komponen TodayFocusPanel
 * 
 * Menggabungkan visualisasi sesi fokus Pomodoro aktif yang sedang berjalan
 * dengan widget progres penyelesaian tugas kuliah semester ini.
 */
export default function TodayFocusPanel({
  focusTimeLeft,
  isFocusTimerRunning,
  setIsFocusTimerRunning,
  pomodoroStage,
  activeFocusTask,
  completedCount,
  totalTasksCount,
  progressPercentage,
  onTabChange
}: TodayFocusPanelProps) {
  
  // Format detik timer ke MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageTotalSeconds = (stage: 'work' | 'short-break' | 'long-break') => {
    if (stage === 'work') return 1500;
    if (stage === 'short-break') return 300;
    return 900;
  };

  const totalStageSecs = getStageTotalSeconds(pomodoroStage);
  const sessionProgressPercentage = Math.min(100, Math.max(0, Math.round(((totalStageSecs - focusTimeLeft) / totalStageSecs) * 100)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Sesi Fokus Pomodoro (Ungu Premium, Span 2) */}
      <div
        style={{ '--glow-color': hexToRgb('#3525cd') } as React.CSSProperties}
        className="bg-primary/85 dark:bg-primary/75 text-white border border-primary/20 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgba(var(--glow-color),0.08)] hover:-translate-y-1 hover:bg-primary/90 dark:hover:bg-primary/80 hover:shadow-[0_20px_40px_rgba(var(--glow-color),0.15)] transition-all duration-300 lg:col-span-2 relative overflow-hidden group flex flex-col justify-between"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                Fokus Saat Ini
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider">
                {pomodoroStage === 'work' 
                  ? 'Sesi Fokus' 
                  : pomodoroStage === 'short-break' 
                    ? 'Istirahat Pendek' 
                    : 'Istirahat Panjang'}
              </span>
            </div>
            
            <button
              onClick={() => setIsFocusTimerRunning(!isFocusTimerRunning)}
              className="px-3.5 py-1.5 bg-white text-primary hover:bg-white/95 active:scale-95 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
            >
              {isFocusTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{formatTimer(focusTimeLeft)}</span>
            </button>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-xl font-extrabold tracking-tight truncate">
              {activeFocusTask ? activeFocusTask.task_title : 'Tidak ada tugas tersisa!'}
            </h3>
            <p className="text-xs text-white/80 line-clamp-2 min-h-8 font-medium leading-relaxed">
              {activeFocusTask ? (activeFocusTask.description || 'Tidak ada deskripsi tambahan.') : 'Semua tugas kuliah semester kamu telah selesai dikerjakan. Mantap!'}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white/90">Kemajuan Sesi Pomodoro</span>
              <span className="font-bold">{sessionProgressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${sessionProgressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Progres Tugas Semester (Putih/Gelap) */}
      <div
        onClick={() => onTabChange('tasks')}
        style={{ '--glow-color': hexToRgb('#6366F1') } as React.CSSProperties}
        className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex flex-col justify-between group cursor-pointer"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Progres Tugas Semester
          </span>
          <h3 className="text-base font-bold text-on-surface leading-tight pt-1">
            Penyelesaian Tugas
          </h3>
          <p className="text-xs text-on-surface-variant font-medium">
            {completedCount} tugas telah selesai dari total {totalTasksCount} tugas.
          </p>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-on-surface-variant">Progres Keseluruhan</span>
            <span className="font-bold text-primary">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-[9px] text-on-surface-variant/80 font-bold block pt-1 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            {progressPercentage === 100 ? 'Luar Biasa! Semua selesai' : 'Ayo selesaikan tugas kamu!'}
          </span>
        </div>
      </div>

    </div>
  );
}
