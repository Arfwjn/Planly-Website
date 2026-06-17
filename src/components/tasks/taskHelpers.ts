/**
 * =============================================================================
 * Planly — taskHelpers.ts
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

import { Course } from '../../types';

/**
 * Mendapatkan nama mata kuliah berdasarkan ID mata kuliah.
 * Jika ID null, dikembalikan kategori Umum / Pribadi.
 */
export const getCourseName = (courseId: number | null, courses: Course[]): string => {
  if (courseId === null) return 'Umum / Pribadi';
  const c = courses.find((item) => item.id === courseId);
  return c ? c.course_name : 'Acara Universitas';
};

/**
 * Memformat batas waktu (deadline) secara relatif terhadap hari berjalan.
 * Berguna untuk menampilkan teks "Besok", "Hari ini", "Terlambat!", dst.
 */
export const formatRelDeadline = (dateStr: string, timeStr: string, isFinished: boolean): string => {
  const today = new Date();
  
  // Set jam, menit, detik hari berjalan ke nol untuk perbandingan hari murni
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const taskDateOnly = new Date(year, month - 1, day);
  
  const diffTime = taskDateOnly.getTime() - todayDateOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

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
