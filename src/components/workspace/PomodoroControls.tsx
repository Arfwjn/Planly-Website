/**
 * =============================================================================
 * Planly — PomodoroControls.tsx
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


import CustomSelect from '../ui/CustomSelect';
import type { SelectOption } from '../ui/CustomSelect';
import { Task } from '../../types';

interface PomodoroControlsProps {
  tasks: Task[];
  pomodoroTaskId: number | null;
  setPomodoroTaskId: (val: number | null) => void;
  completedPomodoroCount: number;
}

/**
 * Komponen PomodoroControls
 * 
 * Widget khusus untuk mode Pomodoro. Memfasilitasi pengikatan tugas kuliah yang aktif
 * dengan timer berjalan, serta memetakan siklus progres visual Pomodoro harian (4 target sesi).
 */
export default function PomodoroControls({
  tasks,
  pomodoroTaskId,
  setPomodoroTaskId,
  completedPomodoroCount
}: PomodoroControlsProps) {
  
  // Saring tugas yang belum selesai untuk dropdown Pomodoro
  const pendingTasks = tasks.filter(t => !t.is_finished);

  // Buat option arrays untuk CustomSelect
  const pomodoroTaskOptions: SelectOption[] = [
    { value: '', label: '-- Tidak Ada Tugas Terikat (Umum) --' },
    ...pendingTasks.map(task => ({
      value: String(task.id),
      label: task.task_title
    }))
  ];

  return (
    <div className="w-full max-w-sm space-y-4 text-center mt-6">
      {/* Dropdown Tautkan Tugas */}
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

      {/* Indikator Siklus Target Pomodoro */}
      <div className="flex items-center justify-center gap-6 pt-2 select-none">
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
  );
}
