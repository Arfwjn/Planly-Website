/**
 * Komponen CoursesView
 * 
 * File ini berguna untuk mengelola dan menampilkan daftar mata kuliah (Courses) pengguna.
 * Komponen ini menyediakan visualisasi jadwal mata kuliah, daftar tugas terkait per mata kuliah,
 * pendaftaran mata kuliah baru melalui modal popup, serta pengubahan dan pembatalan pendaftaran (hapus).
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, GraduationCap, X, Plus, AlertCircle, BookOpen, Edit2, Trash2, CheckSquare } from 'lucide-react';
import { Course, Task } from '../types';
import Skeleton from './ui/Skeleton';

interface CoursesViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onEditCourse: (courseId: number, updatedCourse: Course) => void;
  onDeleteCourse: (courseId: number) => void;
  onToggleTaskState?: (taskId: number) => void; // Opsional agar tidak merusak fungsionalitas check-in
  tasks: Task[];
  isEnrollModalOpen: boolean;
  onSetEnrollModalOpen: (open: boolean) => void;
  searchQuery: string;
  loading?: boolean;
}

export default function CoursesView({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onToggleTaskState,
  tasks,
  isEnrollModalOpen,
  onSetEnrollModalOpen,
  searchQuery,
  loading = false
}: CoursesViewProps) {
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        {/* Header Halaman Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-56 h-8 rounded-lg" />
            <Skeleton className="w-64 h-4 rounded-md" />
          </div>
          <Skeleton className="w-40 h-10 rounded-lg" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm h-[250px]">
              <Skeleton className="absolute left-0 top-0 bottom-0 w-1.5" />
              <div className="flex justify-between items-start">
                <Skeleton className="w-16 h-5 rounded-md animate-pulse" />
                <Skeleton className="w-24 h-4 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-5 rounded-md animate-pulse" />
                <Skeleton className="w-1/2 h-4 rounded-md animate-pulse" />
              </div>
              <div className="mt-auto pt-4 border-t border-[#F1F5F9] flex flex-col gap-2">
                <Skeleton className="w-2/3 h-4 rounded-md animate-pulse" />
                <Skeleton className="w-3/4 h-4 rounded-md animate-pulse" />
                <Skeleton className="w-1/2 h-4 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // State untuk melacak mata kuliah yang sedang dipilih/diinspeksi detailnya oleh pengguna
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // State untuk melacak apakah pengguna sedang dalam mode edit informasi mata kuliah
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields State
  // Kumpulan state ini digunakan bersama oleh Form Pendaftaran (Enroll) dan Form Edit
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [sks, setSks] = useState(3);
  const [room, setRoom] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [colorHex, setColorHex] = useState('#3525cd');
  const [errorMsg, setErrorMsg] = useState('');

  // Kamus terjemahan nama hari dari bahasa Inggris ke bahasa Indonesia
  const dayNameIndonesian: Record<string, string> = {
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu'
  };

  // Pilihan palet warna dot bulat untuk membedakan mata kuliah secara visual
  const colorsOption = [
    { label: 'Indigo', value: '#3525cd' },
    { label: 'Cokelat Karat', value: '#7e3000' },
    { label: 'Abu-abu Slate', value: '#505f76' },
    { label: 'Ungu Violet', value: '#4f46e5' },
    { label: 'Merah Crimson', value: '#ba1a1a' },
    { label: 'Hijau Zamrud', value: '#16a34a' }
  ];

  // Helper untuk menentukan tanggal pertemuan kuliah berikutnya berdasarkan nama hari
  // Fungsi ini menghitung selisih hari antara hari ini dan hari kuliah yang ditargetkan,
  // lalu memformatnya dalam string tanggal terformat menggunakan format lokal Indonesia ('id-ID').
  const getNextClassDate = (dayName: string): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(dayName);
    if (targetDayIndex === -1) return '';

    const d = new Date();
    const currentDayIndex = d.getDay();
    
    let daysUntil = targetDayIndex - currentDayIndex;
    if (daysUntil <= 0) {
      daysUntil += 7; // Jika hari ini adalah hari tersebut atau sudah lewat, cari hari yang sama di minggu depan
    }
    
    d.setDate(d.getDate() + daysUntil);
    return d.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Menangani pengiriman form pendaftaran mata kuliah baru
  // Melakukan validasi sederhana, memicu callback onAddCourse pada komponen induk,
  // lalu mereset state formulir kembali ke nilai bawaan.
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi sederhana untuk memastikan data wajib diisi
    if (!courseCode || !courseName || !room || !lecturerName) {
      setErrorMsg('Harap isi semua kolom pendaftaran.');
      return;
    }

    // Mengirim data mata kuliah baru ke parent component
    onAddCourse({
      id: 0,
      course_code: courseCode.trim().toUpperCase(),
      course_name: courseName,
      sks,
      room,
      lecturer_name: lecturerName,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      color_hex: colorHex,
      user_id: 1
    });

    // Reset isi form fields ke nilai default setelah pendaftaran berhasil
    setCourseCode('');
    setCourseName('');
    setSks(3);
    setRoom('');
    setLecturerName('');
    setDayOfWeek('Monday');
    setStartTime('09:00');
    setEndTime('10:30');
    // Menutup modal popup pendaftaran
    onSetEnrollModalOpen(false);
  };

  // Mengisi form edit dengan data mata kuliah yang akan diubah sebelum modal edit ditampilkan
  // Memasukkan data mata kuliah terpilih ke dalam state formulir untuk ditampilkan di modal edit.
  const handleInspectEditClick = (course: Course) => {
    setIsEditing(true);
    setCourseCode(course.course_code);
    setCourseName(course.course_name);
    setSks(course.sks);
    setRoom(course.room);
    setLecturerName(course.lecturer_name);
    setDayOfWeek(course.day_of_week);
    setStartTime(course.start_time);
    setEndTime(course.end_time);
    setColorHex(course.color_hex);
    setErrorMsg('');
  };

  // Menangani pengiriman form perubahan data mata kuliah
  // Memvalidasi data, memicu callback onEditCourse pada komponen induk untuk memperbarui data,
  // serta memperbarui data selectedCourse lokal dan menutup modal edit.
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!courseCode || !courseName || !room || !lecturerName) {
      setErrorMsg('Harap lengkapi semua data mata kuliah.');
      return;
    }

    const updated: Course = {
      id: selectedCourse!.id,
      course_code: courseCode.trim().toUpperCase(),
      course_name: courseName,
      sks,
      room,
      lecturer_name: lecturerName,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      color_hex: colorHex,
      user_id: 1
    };

    // Mengirim data hasil edit ke parent component
    onEditCourse(selectedCourse!.id, updated);
    setSelectedCourse(updated);
    setIsEditing(false);
  };

  // Menangani proses pembatalan pendaftaran (unenroll/hapus) mata kuliah
  // Memicu callback onDeleteCourse dan membersihkan pilihan mata kuliah aktif.
  const handleDeleteClick = (courseId: number) => {
    onDeleteCourse(courseId);
    setSelectedCourse(null);
    setIsEditing(false);
  };

  // Menghitung total SKS dari semua mata kuliah terdaftar
  const totalSks = courses.reduce((sum, item) => sum + item.sks, 0);

  // Menyaring mata kuliah berdasarkan kata kunci pencarian (nama, kode mata kuliah, atau dosen)
  const filteredCourses = courses.filter((c) => {
    return (
      c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Semester Ganjil 2026</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {courses.length} Mata Kuliah Aktif Terdaftar • {totalSks} SKS Terdaftar
          </p>
        </div>
        <div className="flex gap-2">
          {/* Tombol pemicu untuk membuka modal pendaftaran mata kuliah */}
          <button
            onClick={() => onSetEnrollModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      {/* Panel Detail Mata Kuliah (Ditampilkan jika ada mata kuliah yang dipilih untuk diinspeksi) */}
      {selectedCourse && (
        <div className="p-6 bg-primary/[0.02] border-2 border-primary/20 rounded-2xl relative shadow-xs animate-fade-in">
          
          {/* Tombol aksi: Edit, Hapus, dan Tutup Panel */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => handleInspectEditClick(selectedCourse)}
              className="text-on-surface-variant hover:text-primary p-2 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Edit informasi mata kuliah"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteClick(selectedCourse.id)}
              className="text-red-500 hover:text-red-700 p-2 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              title="Batalkan pendaftaran mata kuliah"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg cursor-pointer bg-white border border-[#E2E8F0]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-extrabold px-3 py-1 rounded text-white shadow-xs"
              style={{ backgroundColor: selectedCourse.color_hex }}
            >
              {selectedCourse.course_code}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
              Mata Kuliah Aktif
            </span>
          </div>

          <h3 className="text-xl font-bold text-on-surface mt-3">{selectedCourse.course_name}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs font-semibold text-on-surface-variant pb-4 border-b border-dashed border-[#C7C4D8]">
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <User className="w-3.5 h-3.5 text-primary" />
              {selectedCourse.lecturer_name}
            </span>
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {dayNameIndonesian[selectedCourse.day_of_week] || selectedCourse.day_of_week}, {selectedCourse.start_time} - {selectedCourse.end_time}
            </span>
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {selectedCourse.room}
            </span>
            <span className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              {selectedCourse.sks} SKS (Kredit)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Jadwal Kuliah Berikutnya */}
            <div>
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Jadwal Mendatang
              </h4>
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-2xs">
                <p className="text-sm font-bold text-on-surface">
                  Jadwal Seri Kuliah
                </p>
                <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
                  Kelas Berikutnya: <span className="text-primary font-bold">{getNextClassDate(selectedCourse.day_of_week)}</span>
                </p>
                <p className="text-[10px] text-[#94A3B8] font-bold mt-1 uppercase">
                  Waktu: {selectedCourse.start_time} - {selectedCourse.end_time} ({selectedCourse.room})
                </p>
              </div>
            </div>

            {/* Checklist Tugas Terkait Mata Kuliah Terpilih */}
            <div>
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-primary" />
                Checklist Tugas Terbaru
              </h4>
              {tasks.filter((t) => t.course_id === selectedCourse.id).length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-2xs">
                  <p className="text-xs text-on-surface-variant italic font-medium">Tidak ada tugas tertunda yang terkait dengan mata kuliah ini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {tasks
                    .filter((t) => t.course_id === selectedCourse.id)
                    .map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-2 bg-white p-2.5 rounded-lg text-xs font-bold border border-slate-100 shadow-3xs cursor-pointer select-none"
                        onClick={() => onToggleTaskState && onToggleTaskState(task.id)}
                      >
                        <input
                          type="checkbox"
                          checked={task.is_finished}
                          onChange={() => onToggleTaskState && onToggleTaskState(task.id)}
                          className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                        />
                        <span className={`truncate ${task.is_finished ? 'line-through text-[#94A3B8]' : 'text-on-surface'}`}>
                          {task.task_title}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout Courses */}
      {/* Di sini layout grid menyusun kartu mata kuliah secara responsif.
          cols-1 pada mobile, cols-2 pada tablet (md), dan cols-3 pada komputer (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center p-6">
            {/* Custom SVG Illustration for Empty Courses */}
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center text-primary/30">
              <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Book stack */}
                <path d="M4 19.5C4 18.6716 4.67157 18 5.5 18H20V22H5.5C4.67157 22 4 21.3284 4 19.5Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 19.5C4 18.6716 4.67157 18 5.5 18H20V4H5.5C4.67157 4 4 4.67157 4 5.5V19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M6 8H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {/* Dynamic decorative icon */}
              <div className="absolute top-2 right-2 animate-bounce">
                <svg className="w-6 h-6 text-indigo-500/60" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-bold text-on-surface">Belum ada mata kuliah terdaftar</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm font-medium">
              {searchQuery ? 'Tidak ada mata kuliah yang cocok dengan pencarian Anda.' : 'Anda belum mendaftarkan mata kuliah apa pun untuk semester ini.'}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            // Task count per course: menghitung jumlah tugas 'pending' (belum selesai)
            // yang dikaitkan dengan mata kuliah ini
            const courseTasksCount = tasks.filter((t) => t.course_id === course.id && !t.is_finished).length;
            return (
              <article
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer h-full"
              >
                {/* Pita penanda warna di sisi kiri kartu */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                  style={{ backgroundColor: course.color_hex }}
                ></div>

                <div className="flex justify-between items-start">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md border"
                    style={{
                      color: course.color_hex,
                      backgroundColor: `${course.color_hex}10`,
                      borderColor: `${course.color_hex}25`
                    }}
                  >
                    {course.course_code}
                  </span>
                  
                  {/* Badge jumlah tugas pending yang terdeteksi */}
                  {courseTasksCount > 0 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full">
                      {courseTasksCount} Belum Selesai
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors">
                    {course.course_name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-semibold">
                    Mata kuliah dengan {course.sks} SKS.
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-[#F1F5F9] flex flex-col gap-2 text-xs font-semibold text-on-surface-variant">
                  <div className="flex items-center gap-2.5">
                    <User className="text-[#94A3B8] w-3.5 h-3.5" />
                    <span>{course.lecturer_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="text-[#94A3B8] w-3.5 h-3.5" />
                    <span>
                      {dayNameIndonesian[course.day_of_week] || course.day_of_week}, {course.start_time} - {course.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="text-[#94A3B8] w-3.5 h-3.5" />
                    <span>{course.room}</span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Modal Popup Pendaftaran Mata Kuliah Baru (Tambah Mata Kuliah Baru Modal) */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] overflow-hidden border border-[#E2E8F0] animate-zoom-in">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-lg">Tambah Mata Kuliah Baru</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Masukkan rincian untuk jadwal akademik Anda berikutnya
                </p>
              </div>
              <button
                onClick={() => onSetEnrollModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Input Pendaftaran */}
            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Field: Kode & Nama Mata Kuliah */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Kode Mata Kuliah
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS301"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Nama Mata Kuliah
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Analisis Algoritma"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Form Field: Jumlah SKS & Ruangan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    SKS (Kredit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={sks}
                    onChange={(e) => setSks(parseInt(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Ruangan / Lokasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Gedung Sains, Ruang 304"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Form Field: Nama Dosen Pengampu */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Nama Dosen
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Alan Turing"
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              {/* Form Field: Waktu Kuliah (Hari, Jam Mulai & Jam Selesai) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Hari Kuliah
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface font-semibold"
                  >
                    <option value="Monday">Senin</option>
                    <option value="Tuesday">Selasa</option>
                    <option value="Wednesday">Rabu</option>
                    <option value="Thursday">Kamis</option>
                    <option value="Friday">Jumat</option>
                    <option value="Saturday">Sabtu</option>
                    <option value="Sunday">Minggu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              {/* Pemilihan warna visual (Color Dot Selections) */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Warna Tema
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorsOption.map((c) => {
                    const isSelected = colorHex === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColorHex(c.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                          isSelected ? 'border-primary scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => onSetEnrollModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Tambah Mata Kuliah
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Popup Edit Informasi Mata Kuliah (Edit Course Modal) */}
      {isEditing && selectedCourse && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] overflow-hidden border border-[#E2E8F0] animate-zoom-in">
            {/* Header Modal Edit */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-lg">Edit Informasi Mata Kuliah</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Perbarui data informasi kelas untuk {selectedCourse.course_code}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Input Edit */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Edit Kode & Nama Mata Kuliah */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Kode Mata Kuliah
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Nama Mata Kuliah
                  </label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Edit SKS & Ruangan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    SKS (Kredit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={sks}
                    onChange={(e) => setSks(parseInt(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Ruangan / Lokasi
                  </label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Edit Nama Dosen Pengampu */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Nama Dosen
                </label>
                <input
                  type="text"
                  required
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                />
              </div>

              {/* Edit Waktu Kuliah (Hari, Jam Mulai & Selesai) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Hari Kuliah
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface font-semibold"
                  >
                    <option value="Monday">Senin</option>
                    <option value="Tuesday">Selasa</option>
                    <option value="Wednesday">Rabu</option>
                    <option value="Thursday">Kamis</option>
                    <option value="Friday">Jumat</option>
                    <option value="Saturday">Sabtu</option>
                    <option value="Sunday">Minggu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              {/* Edit Pilihan Warna */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Warna Tema
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorsOption.map((c) => {
                    const isSelected = colorHex === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColorHex(c.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                          isSelected ? 'border-primary scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Tombol Aksi Edit */}
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
          </div>
        </div>
      )}

    </div>
  );
}
