/**
 * Komponen TasksView
 * 
 * File ini berfungsi untuk mengelola dan menampilkan daftar tugas (Tasks) pengguna.
 * Di sini kita bisa melihat daftar tugas, menyaring berdasarkan status (pending/selesai)
 * atau pencarian, melihat detail tugas, menambahkan tugas baru, mengubah data tugas, 
 * serta menghapus tugas yang ada.
 */

import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, GraduationCap, Plus, X, Calendar, AlertCircle, Trash2, Edit2, Info } from 'lucide-react';
import { Task, Course } from '../types';
import Skeleton from './ui/Skeleton';

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
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        {/* Header Halaman Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="w-24 h-8 rounded-lg" />
            <Skeleton className="w-64 h-4 rounded-md" />
          </div>
          <Skeleton className="w-28 h-10 rounded-lg" />
        </div>

        {/* Tab Filter Skeleton */}
        <div className="flex gap-6 border-b border-[#E2E8F0] pb-3">
          <Skeleton className="w-24 h-5 rounded-md" />
          <Skeleton className="w-20 h-5 rounded-md" />
        </div>

        {/* List Tugas Skeletons */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-start gap-4 h-[94px]">
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
  // State untuk menyaring tab aktif: 'pending' (tugas belum selesai) vs 'done' (tugas selesai)
  const [activeTab, setActiveTab] = useState<'pending' | 'done'>('pending');

  // State untuk melacak tugas yang sedang dipilih untuk detail/inspeksi dan status edit mode
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State Manajemen Form untuk Tugas Baru (New Task)
  // State ini menampung nilai input dari form penambahan tugas baru di dalam slide-over drawer
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState<number | null>(null);
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [newDeadlineTime, setNewDeadlineTime] = useState('23:59');
  const [newIsPriority, setNewIsPriority] = useState(false);
  const [newIsFinished, setNewIsFinished] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  // State Manajemen Form untuk Mengedit Tugas (Edit Task)
  // State ini menyimpan nilai sementara ketika pengguna sedang mengubah data tugas yang dipilih
  const [editTitle, setEditTitle] = useState('');
  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [editDeadlineDate, setEditDeadlineDate] = useState('');
  const [editDeadlineTime, setEditDeadlineTime] = useState('23:59');
  const [editIsPriority, setEditIsPriority] = useState(false);
  const [editIsFinished, setEditIsFinished] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editValidationError, setEditValidationError] = useState('');

  // Fungsi untuk memuat data tugas ke dalam form edit saat pengguna membuka detail tugas
  const handleInspectTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditing(false);
    setEditTitle(task.task_title);
    setEditCourseId(task.course_id);
    setEditDeadlineDate(task.deadline.split(' ')[0]);
    setEditDeadlineTime(task.deadline.split(' ')[1]?.slice(0, 5) || '23:59');
    setEditIsPriority(task.is_priority);
    setEditIsFinished(task.is_finished);
    setEditDescription(task.description || '');
    setEditValidationError('');
  };

  // Effect untuk otomatis membuka inspeksi detail tugas jika dipicu dari luar (misal notifikasi)
  useEffect(() => {
    if (autoInspectTaskId) {
      const task = tasks.find((t) => t.id === autoInspectTaskId);
      if (task) {
        // Otomatis arahkan ke tab yang sesuai dengan status tugas (selesai/belum selesai)
        setActiveTab(task.is_finished ? 'done' : 'pending');
        handleInspectTask(task);
        if (onClearAutoInspect) {
          onClearAutoInspect();
        }
      }
    }
  }, [autoInspectTaskId, tasks, onClearAutoInspect]);

  // Fungsi untuk menangani pengiriman form pembuatan tugas baru
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validasi input form secara sederhana
    if (!newTitle.trim()) {
      setValidationError('Harap masukkan judul tugas.');
      return;
    }
    if (!newDeadlineDate) {
      setValidationError('Harap tentukan tanggal batas waktu (deadline).');
      return;
    }

    // Mengirim data tugas baru ke fungsi callback parent
    onAddTask({
      task_title: newTitle,
      description: newDescription,
      deadline: `${newDeadlineDate} ${newDeadlineTime}:00`,
      is_finished: newIsFinished,
      is_priority: newIsPriority,
      course_id: newCourseId,
      user_id: 0
    });

    // Reset seluruh field form setelah berhasil dikirim
    setNewTitle('');
    setNewCourseId(null);
    setNewDeadlineDate('');
    setNewDeadlineTime('23:59');
    setNewIsPriority(false);
    setNewIsFinished(false);
    setNewDescription('');
    // Menutup slide-over drawer tugas baru
    onSetSlideOverOpen(false);
  };

  // Fungsi untuk menangani pengiriman form edit/pembaruan tugas
  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditValidationError('');

    // Validasi input form edit
    if (!editTitle.trim()) {
      setEditValidationError('Judul tugas tidak boleh kosong.');
      return;
    }
    if (!editDeadlineDate) {
      setEditValidationError('Tanggal batas waktu wajib diisi.');
      return;
    }

    // Mengirim pembaruan tugas ke fungsi callback parent
    onEditTask(selectedTask!.id, {
      ...selectedTask!,
      task_title: editTitle,
      description: editDescription,
      deadline: `${editDeadlineDate} ${editDeadlineTime}:00`,
      is_finished: editIsFinished,
      is_priority: editIsPriority,
      course_id: editCourseId
    });

    // Mereset state inspeksi setelah selesai mengedit
    setSelectedTask(null);
    setIsEditing(false);
  };

  // Fungsi untuk menangani penghapusan tugas dan menutup panel detail/inspeksi
  const handleDeleteTaskClick = (taskId: number) => {
    onDeleteTask(taskId);
    setSelectedTask(null);
    setIsEditing(false);
  };

  // Helper untuk mendapatkan nama mata kuliah berdasarkan ID mata kuliah.
  // Jika ID kosong, dikembalikan kategori Umum / Pribadi.
  const getCourseName = (courseId: number | null) => {
    if (courseId === null) return 'Umum / Pribadi';
    const c = courses.find((item) => item.id === courseId);
    return c ? c.course_name : 'Acara Universitas';
  };

  // Helper untuk memformat batas waktu (deadline) secara relatif terhadap hari ini.
  const formatRelDeadline = (dateStr: string, timeStr: string, isFinished: boolean) => {
    const today = new Date();
    const taskDate = new Date(`${dateStr}T${timeStr}`);
    
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (isFinished) return `Selesai | ${dateStr}`;

    if (diffDays === 0) {
      return `Hari ini, ${timeStr}`;
    } else if (diffDays === 1) {
      return `Besok, ${timeStr}`;
    } else if (diffDays === -1) {
      return `Kemarin (Terlambat!), ${timeStr}`;
    } else if (diffDays < 0) {
      return `Terlambat ${Math.abs(diffDays)} hari (${dateStr})`;
    } else {
      return `${dateStr}, ${timeStr}`;
    }
  };

  // Menyaring tugas berdasarkan tab aktif (Pending vs Finished) dan query pencarian (searchQuery)
  // Hasilnya kemudian diurutkan berdasarkan tanggal deadline terkecil/terdekat.
  const filteredTasks = tasks
    .filter((t) => {
      const matchStatus = activeTab === 'pending' ? !t.is_finished : t.is_finished;
      const matchSearch =
        t.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => a.deadline.split(' ')[0].localeCompare(b.deadline.split(' ')[0]));

  return (
    <div className="max-w-[1000px] mx-auto w-full relative">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Tugas</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Kelola beban akademik dan batas waktu tugas kuliah Anda.
          </p>
        </div>
        {/* Tombol untuk membuka Slide-Over Drawer tugas baru */}
        <button
          onClick={() => onSetSlideOverOpen(true)}
          className="bg-primary hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tugas Baru</span>
        </button>
      </div>

      {/* Tab Filter (Belum Selesai vs Selesai) */}
      <div className="flex gap-6 border-b border-[#E2E8F0] mb-6">
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

      {/* Daftar Tugas (Kanvas Daftar Tugas) */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center p-6">
            {/* Custom SVG Illustration for Empty Tasks */}
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center text-primary/30">
              <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 18H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {/* Animated sparkles or check icons */}
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
          filteredTasks.map((task) => {
            const deadlineParts = task.deadline.split(' ');
            const deadlineDate = deadlineParts[0];
            const deadlineTime = deadlineParts[1]?.slice(0, 5) || '23:59';
            const isOverdue = !task.is_finished && new Date(`${deadlineDate}T${deadlineTime}`) < new Date();
            return (
              <div
                key={task.id}
                className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group flex items-start gap-4 cursor-pointer ${
                  task.is_finished
                    ? 'bg-date-btn-bg border border-date-btn-border'
                    : 'bg-white border border-[#E2E8F0] hover:border-primary/20'
                }`}
                onClick={() => handleInspectTask(task)}
              >
                {/* Checkbox untuk mengubah status tugas secara instan tanpa masuk drawer detail */}
                <div className="pt-1 select-none" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={task.is_finished}
                    onChange={() => onToggleTaskState(task.id)}
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
                    
                    {/* Badge Prioritas atau Terlambat (Overdue) */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        task.is_priority || isOverdue
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-[#F1F5F9] text-on-surface-variant border border-[#E2E8F0]'
                      }`}
                    >
                      {isOverdue && !task.is_finished ? 'Terlambat!' : task.is_priority ? 'Tinggi' : 'Sedang'}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mb-2 line-clamp-2">
                    {task.description || 'Tidak ada detail tambahan yang disediakan.'}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-on-surface-variant">
                    {/* Menampilkan pemetaan mata kuliah terkait */}
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 stroke-[2px]" />
                      {getCourseName(task.course_id)}
                    </span>
                    {/* Menampilkan waktu tenggat (deadline) */}
                    <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelDeadline(deadlineDate, deadlineTime, task.is_finished)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-Over Side Drawer untuk Menambahkan Tugas Baru */}
      {isSlideOverOpen && (
        <div
          className="fixed inset-0 bg-[#1b1b24]/30 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => onSetSlideOverOpen(false)}
        >
          <div
            className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0] transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <h2 className="text-lg font-bold text-on-surface">Tugas Baru</h2>
              <button
                onClick={() => onSetSlideOverOpen(false)}
                className="text-on-surface-variant hover:bg-[#F1F5F9] p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Input Tugas Baru */}
            <form onSubmit={handleCreateTaskSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Judul Tugas */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Nama / Judul Tugas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Apa yang perlu dikerjakan?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                />
              </div>

              {/* Dropdown Pemetaan Mata Kuliah Terkait */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Mata Kuliah Terkait
                </label>
                <select
                  value={newCourseId === null ? '' : newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
                >
                  <option value="">Tugas Umum / Pribadi</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} - {c.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batas Waktu (Tanggal & Jam) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Tanggal Batas Waktu
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadlineDate}
                    onChange={(e) => setNewDeadlineDate(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Waktu
                  </label>
                  <input
                    type="time"
                    required
                    value={newDeadlineTime}
                    onChange={(e) => setNewDeadlineTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>

              {/* Tombol Toggle Prioritas Utama */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                    Tugas Prioritas Tinggi
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewIsPriority(!newIsPriority)}
                    className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${
                      newIsPriority ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      newIsPriority ? 'left-5' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Status Awal (Belum Selesai / Selesai) */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Status Awal
                </label>
                <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] gap-1">
                  <button
                    type="button"
                    onClick={() => setNewIsFinished(false)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      !newIsFinished ? 'bg-white text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Belum Selesai
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIsFinished(true)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      newIsFinished ? 'bg-white text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Selesai
                  </button>
                </div>
              </div>

              {/* Catatan / Keterangan Tambahan */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Catatan / Deskripsi (Opsional)
                </label>
                <textarea
                  placeholder="Tambahkan detail, daftar tugas, atau sumber daya..."
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                ></textarea>
              </div>

              {/* Aksi Tambah Tugas */}
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => onSetSlideOverOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-on-surface hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Buat Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer Inspeksi Tugas (Detail & Edit) */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-[#1b1b24]/30 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0] transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Detail / Edit */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <h2 className="text-lg font-bold text-on-surface">
                {isEditing ? 'Edit Tugas' : 'Detail Tugas'}
              </h2>
              <div className="flex items-center gap-1.5">
                {!isEditing && (
                  <>
                    {/* Tombol Edit Mode */}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                      title="Ubah metadata tugas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Tombol Hapus dengan Konfirmasi Instan */}
                    <button
                      onClick={() => handleDeleteTaskClick(selectedTask.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus tugas secara permanen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-on-surface-variant hover:bg-[#F1F5F9] p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Konten Inspeksi */}
            {isEditing ? (
              /* Form Edit Tugas Aktif */
              <form onSubmit={handleEditTaskSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {editValidationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{editValidationError}</span>
                  </div>
                )}

                {/* Edit Judul Tugas */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Nama / Judul Tugas
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>

                {/* Edit Pemetaan Mata Kuliah */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Mata Kuliah Terkait
                  </label>
                  <select
                    value={editCourseId === null ? '' : editCourseId}
                    onChange={(e) => setEditCourseId(e.target.value === '' ? null : Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
                  >
                    <option value="">Tugas Umum / Pribadi</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_code} - {c.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Edit Tanggal & Waktu Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                      Tanggal Batas Waktu
                    </label>
                    <input
                      type="date"
                      required
                      value={editDeadlineDate}
                      onChange={(e) => setEditDeadlineDate(e.target.value)}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                      Waktu
                    </label>
                    <input
                      type="time"
                      required
                      value={editDeadlineTime}
                      onChange={(e) => setEditDeadlineTime(e.target.value)}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Edit Prioritas Tugas */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                      Tugas Prioritas Tinggi
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditIsPriority(!editIsPriority)}
                      className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${
                        editIsPriority ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        editIsPriority ? 'left-5' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Edit Status Tugas */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Status Tugas
                  </label>
                  <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] gap-1">
                    <button
                      type="button"
                      onClick={() => setEditIsFinished(false)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        !editIsFinished ? 'bg-white text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Belum Selesai
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditIsFinished(true)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        editIsFinished ? 'bg-white text-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Selesai
                    </button>
                  </div>
                </div>

                {/* Edit Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Catatan / Deskripsi
                  </label>
                  <textarea
                    placeholder="Detail tentang tugas..."
                    rows={6}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-medium"
                  ></textarea>
                </div>

                {/* Aksi Perubahan Edit */}
                <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            ) : (
              /* Detail Info Tugas Mode View Saja */
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedTask.is_finished 
                      ? 'bg-green-50 text-green-600 border border-green-100'
                      : 'bg-primary-container text-primary border border-primary/20'
                  }`}>
                    {selectedTask.is_finished ? 'Selesai' : 'Belum Selesai'}
                  </span>
                  {selectedTask.is_priority && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                      Prioritas Tinggi
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-on-surface leading-tight">
                    {selectedTask.task_title}
                  </h3>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 text-sm">
                  {/* Pemetaan Mata Kuliah pada Detail Tugas */}
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-on-surface-variant" />
                    <div>
                      <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Mata Kuliah / Subjek</p>
                      <p className="font-semibold text-on-surface mt-0.5">{getCourseName(selectedTask.course_id)}</p>
                    </div>
                  </div>

                  {/* Tenggat Waktu pada Detail Tugas */}
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-on-surface-variant" />
                    <div>
                      <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Batas Waktu</p>
                      <p className="font-semibold text-on-surface mt-0.5">
                        {formatRelDeadline(selectedTask.deadline.split(' ')[0], selectedTask.deadline.split(' ')[1]?.slice(0, 5) || '23:59', selectedTask.is_finished)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deskripsi/Catatan Detail Tugas */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider mb-2">Deskripsi</p>
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-xs text-on-surface leading-relaxed min-h-24 whitespace-pre-wrap">
                    {selectedTask.description || 'Tidak ada catatan tambahan yang diberikan untuk tugas ini.'}
                  </div>
                </div>

                {/* Tombol Utama Toggle Status Tugas (Tandai Belum Selesai / Tandai Selesai) */}
                <div className="pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onToggleTaskState(selectedTask.id);
                      setSelectedTask({ ...selectedTask, is_finished: !selectedTask.is_finished });
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                      selectedTask.is_finished 
                        ? 'border border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant'
                        : 'bg-primary hover:bg-[#4F46E5] text-white'
                    }`}
                  >
                    {selectedTask.is_finished ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
