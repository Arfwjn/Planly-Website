import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { Task, Course } from '../../types';
import Skeleton from '../ui/Skeleton';
import TaskCard from './TaskCard';
import TaskFormDrawer from './TaskFormDrawer';
import TaskDetailModal from './TaskDetailModal';

interface TasksViewProps {
  tasks: Task[];
  courses: Course[];
  onToggleTaskState: (taskId: number) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (taskId: number, updatedTask: Task) => void;
  onDeleteTask: (taskId: number) => void;
  isSlideOverOpen: boolean;
  onSetSlideOverOpen: (open: boolean) => void;
  searchQuery: string;
  loading?: boolean;
  autoInspectTaskId?: number | null;
  onClearAutoInspect?: () => void;
}

/**
 * Komponen TasksView (Orkestrator)
 * 
 * Halaman utama pengelolaan tugas kuliah (Tasks).
 * Tanggung jawab:
 * - Menampilkan loading skeletons saat data masih diunduh.
 * - Mengatur tab penyaringan tugas aktif vs selesai (`activeTab`).
 * - Mengatur data tugas terpilih untuk inspeksi detail (`selectedTask`).
 * - Menangani pemicu inspeksi otomatis jika ada instruksi luar (`autoInspectTaskId`).
 * - Merakit list tugas ke layout halaman terpadu.
 */
export default function TasksView({
  tasks,
  courses,
  onToggleTaskState,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isSlideOverOpen,
  onSetSlideOverOpen,
  searchQuery,
  loading = false,
  autoInspectTaskId = null,
  onClearAutoInspect
}: TasksViewProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'done'>('pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Auto-inspect pemicu eksternal (misal dari notifikasi/deadlines)
  useEffect(() => {
    if (autoInspectTaskId) {
      const task = tasks.find((t) => t.id === autoInspectTaskId);
      if (task) {
        setActiveTab(task.is_finished ? 'done' : 'pending');
        setSelectedTask(task);
        if (onClearAutoInspect) {
          onClearAutoInspect();
        }
      }
    }
  }, [autoInspectTaskId, tasks, onClearAutoInspect]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="w-24 h-8 rounded-lg" />
            <Skeleton className="w-64 h-4 rounded-md" />
          </div>
          <Skeleton className="w-28 h-10 rounded-lg" />
        </div>

        <div className="flex gap-6 border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
          <Skeleton className="w-24 h-5 rounded-md" />
          <Skeleton className="w-20 h-5 rounded-md" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-4 h-[94px]">
              <Skeleton className="w-5 h-5 rounded mt-1 animate-pulse" />
              <div className="flex-1 space-y-2.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-1/3 h-4 rounded-md animate-pulse" />
                  <Skeleton className="w-12 h-4 rounded-full animate-pulse" />
                </div>
                <Skeleton className="w-2/3 h-3 rounded-md animate-pulse" />
                <div className="flex gap-4 pt-1">
                  <Skeleton className="w-24 h-3.5 rounded-md animate-pulse" />
                  <Skeleton className="w-28 h-3.5 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter tugas berdasarkan status tab dan pencarian kata kunci
  const filteredTasks = tasks
    .filter((t) => {
      const matchStatus = activeTab === 'pending' ? !t.is_finished : t.is_finished;
      const matchSearch =
        t.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchSearch;
    })
    .sort((a, b) => a.deadline.split(' ')[0].localeCompare(b.deadline.split(' ')[0]));

  return (
    <div className="max-w-[1000px] mx-auto w-full relative">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
              <CheckSquare className="w-8 h-8 text-primary" />
              <span>Tugas</span>
            </h1>
            <span className="bg-primary/10 text-primary dark:bg-primary/20 text-xs px-2.5 py-1 rounded-full font-semibold">
              {tasks.length} Tugas
            </span>
          </div>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Kelola beban akademik dan batas waktu tugas kuliah Anda.
          </p>
        </div>
        <button
          onClick={() => onSetSlideOverOpen(true)}
          className="bg-primary hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tugas Baru</span>
        </button>
      </div>

      {/* Tab filter status */}
      <div className="flex gap-6 border-b border-[#E2E8F0] dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 border-b-2 font-semibold text-sm px-1 cursor-pointer transition-all ${
            activeTab === 'pending'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Belum Selesai
        </button>
        <button
          onClick={() => setActiveTab('done')}
          className={`pb-3 border-b-2 font-semibold text-sm px-1 cursor-pointer transition-all ${
            activeTab === 'done'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Selesai
        </button>
      </div>

      {/* Render list tugas */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          /* Tampilan kosong */
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center text-primary/30">
              <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 18H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="absolute top-2 right-2 animate-bounce">
                <svg className="w-6 h-6 text-green-500/60" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-bold text-on-surface">Tidak ada tugas ditemukan</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm font-medium">
              {searchQuery ? 'Sesuaikan kata kunci atau filter pencarian Anda.' : 'Kerja bagus! Semua tugas akademik Anda saat ini telah diselesaikan.'}
            </p>
          </div>
        ) : (
          /* Iterasi kartu tugas */
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              courses={courses}
              onClick={() => setSelectedTask(task)}
              onToggleState={(e) => {
                e.stopPropagation();
                onToggleTaskState(task.id);
                // Jika sedang di-inspect, sinkronkan is_finished lokal
                if (selectedTask && selectedTask.id === task.id) {
                  setSelectedTask({ ...selectedTask, is_finished: !selectedTask.is_finished });
                }
              }}
            />
          ))
        )}
      </div>

      {/* Drawer Slide-over Pembuatan Tugas Baru */}
      <TaskFormDrawer
        courses={courses}
        isOpen={isSlideOverOpen}
        onClose={() => onSetSlideOverOpen(false)}
        onAddTask={onAddTask}
      />

      {/* Drawer Detail & Edit Tugas */}
      {selectedTask && (
        <TaskDetailModal
          selectedTask={selectedTask}
          courses={courses}
          onClose={() => setSelectedTask(null)}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onToggleTaskState={onToggleTaskState}
        />
      )}

    </div>
  );
}
