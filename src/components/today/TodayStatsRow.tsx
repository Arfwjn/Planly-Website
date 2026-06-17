/**
 * =============================================================================
 * Planly — TodayStatsRow.tsx
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
import { CheckSquare, BookOpen, Flame } from 'lucide-react';
import { SidebarTab } from '../../types';
import { hexToRgb } from '../../utils/color';

interface TodayStatsRowProps {
  pendingTasksCount: number;
  highPriorityCount: number;
  todayCoursesCount: number;
  completedCoursesCount: number;
  upcomingCoursesCount: number;
  completedPomodoroCount: number;
  onTabChange: (tab: SidebarTab) => void;
}

/**
 * Komponen TodayStatsRow
 * 
 * Baris metrik ringkasan di dasbor harian (Tugas Aktif, Kuliah Hari Ini, Fokus Pomodoro)
 * lengkap dengan interaktivitas klik untuk berpindah tab.
 */
export default function TodayStatsRow({
  pendingTasksCount,
  highPriorityCount,
  todayCoursesCount,
  completedCoursesCount,
  upcomingCoursesCount,
  completedPomodoroCount,
  onTabChange
}: TodayStatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
      
      {/* Kartu 1: Tugas Aktif */}
      <div
        onClick={() => onTabChange('tasks')}
        style={{ '--glow-color': hexToRgb('#6366F1') } as React.CSSProperties}
        className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex items-center justify-between group cursor-pointer"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Tugas Aktif
          </span>
          <div className="text-3xl font-black text-on-surface group-hover:text-primary dark:group-hover:!text-primary/80 transition-colors leading-none">
            {pendingTasksCount} <span className="text-xs font-semibold text-on-surface-variant">Tugas</span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80 font-medium block">
            {highPriorityCount} Prioritas Tinggi
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
          <CheckSquare className="w-5 h-5" />
        </div>
      </div>

      {/* Kartu 2: Kuliah Hari Ini */}
      <div
        onClick={() => onTabChange('calendar')}
        style={{ '--glow-color': hexToRgb('#10B981') } as React.CSSProperties}
        className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex items-center justify-between group cursor-pointer"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Kuliah Hari Ini
          </span>
          <div className="text-3xl font-black text-on-surface group-hover:text-emerald-600 dark:group-hover:!text-emerald-400 transition-colors leading-none">
            {todayCoursesCount} <span className="text-xs font-semibold text-on-surface-variant">Kelas</span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80 font-medium block">
            {completedCoursesCount} Selesai, {upcomingCoursesCount} Mendatang
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      {/* Kartu 3: Fokus Pomodoro */}
      <div
        onClick={() => onTabChange('workspace')}
        style={{ '--glow-color': hexToRgb('#F59E0B') } as React.CSSProperties}
        className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.03)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.08)] transition-all duration-300 flex items-center justify-between group cursor-pointer"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Fokus Pomodoro
          </span>
          <div className="text-3xl font-black text-on-surface group-hover:text-amber-500 dark:group-hover:!text-amber-300 transition-colors leading-none">
            {completedPomodoroCount} <span className="text-xs font-semibold text-on-surface-variant">Sesi</span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80 font-medium block">
            Target Harian: 4 Sesi Kerja
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
          <Flame className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
}
