/**
 * =============================================================================
 * Planly — TaskCard.tsx
 * 
 * Kegunaan:
 * Komponen manajemen tugas kuliah akademik (daftar tugas tertunggak & selesai, prioritas, & unduh berkas lampiran).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan TasksView.tsx (orkestrator) dan berkomunikasi dengan backend via tasksService.
 * 
 * Aliran Data / State:
 * - Menampilkan daftar tugas terstruktur, upload lampiran Base64, dan mengubah status pengerjaan tugas.
 * =============================================================================
 */

import React from 'react';
import { GraduationCap, Clock, Paperclip } from 'lucide-react';
import { Task, Course } from '../../types';
import { hexToRgb } from '../../utils/color';
import { getCourseName, formatRelDeadline } from './taskHelpers';

interface TaskCardProps {
  task: Task;
  courses: Course[];
  onClick: () => void;
  onToggleState: (e: React.MouseEvent) => void;
}

/**
 * Komponen TaskCard
 * 
 * Baris kartu tunggal tugas akademik di daftar tugas.
 * Mendukung:
 * - Checklist interaktif langsung dari baris list.
 * - Deteksi tugas terlambat (Overdue) secara dinamis.
 * - Glow visual glow kustom mengikuti warna mata kuliah terkait.
 * - Informasi prioritas, relasi mata kuliah, tenggat waktu, dan jumlah berkas terlampir.
 */
export default function TaskCard({
  task,
  courses,
  onClick,
  onToggleState
}: TaskCardProps) {
  const deadlineParts = task.deadline.split(' ');
  const deadlineDate = deadlineParts[0];
  const deadlineTime = deadlineParts[1]?.slice(0, 5) || '23:59';
  const isOverdue = !task.is_finished && new Date(`${deadlineDate}T${deadlineTime}`) < new Date();
  
  const course = courses.find((c) => c.id === task.course_id);
  const courseColor = course?.color_hex || '#3525cd';

  return (
    <div
      style={{ '--glow-color': hexToRgb(courseColor) } as React.CSSProperties}
      className={`border backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(var(--glow-color),0.04)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] transition-all duration-300 group flex items-start gap-4 cursor-pointer ${
        task.is_finished
          ? 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/30 opacity-60'
          : 'bg-white/65 dark:bg-slate-900/70 border-white/60 dark:border-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-900/85'
      }`}
      onClick={onClick}
    >
      {/* Checkbox interaktif cepat */}
      <div className="pt-1 select-none" onClick={onToggleState}>
        <input
          type="checkbox"
          checked={task.is_finished}
          onChange={() => {}} // Dikontrol lewat penanganan onClick di container div
          className="w-5 h-5 rounded border-[#C7C4D8] text-primary focus:ring-primary cursor-pointer transition-all accent-primary"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h3
            className={`text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors cursor-pointer ${
              task.is_finished ? 'line-through decoration-[#94A3B8] text-on-surface-variant' : ''
            }`}
          >
            {task.task_title}
          </h3>
          
          {/* Lencana prioritas / status terlambat */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              task.is_priority || isOverdue
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-[#F1F5F9] dark:bg-slate-800 text-on-surface-variant border border-[#E2E8F0] dark:border-slate-700/80'
            }`}
          >
            {isOverdue && !task.is_finished ? 'Terlambat!' : task.is_priority ? 'Tinggi' : 'Sedang'}
          </span>
        </div>

        <p className="text-xs text-on-surface-variant mb-2 line-clamp-2">
          {task.description || 'Tidak ada detail tambahan yang disediakan.'}
        </p>

        <div className="flex flex-wrap gap-4 text-xs font-semibold text-on-surface-variant">
          {/* Label mata kuliah */}
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 stroke-[2px]" />
            {getCourseName(task.course_id, courses)}
          </span>
          
          {/* Label waktu */}
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatRelDeadline(deadlineDate, deadlineTime, task.is_finished)}
          </span>
          
          {/* Jumlah lampiran berkas */}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] bg-[#F1F5F9] dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-[#E2E8F0] dark:border-slate-700/80">
              <Paperclip className="w-3 h-3 text-primary" />
              <span>{task.attachments.length} Lampiran</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
