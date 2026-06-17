/**
 * =============================================================================
 * Planly — courseHelpers.ts
 * 
 * Kegunaan:
 * Komponen antarmuka modul Mata Kuliah terdaftar (daftar grid kelas, ruangan, dosen, absensi, & detail materi).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan CoursesView.tsx (orkestrator) dan berkomunikasi dengan server via coursesService.
 * 
 * Aliran Data / State:
 * - Mengambil data detail perkuliahan user aktif, menghitung kelas terdekat hari berjalan, dan mendaftarkan kelas baru.
 * =============================================================================
 */

import type { SelectOption } from '../ui/CustomSelect';

export const dayOfWeekOptions: SelectOption[] = [
  { value: 'Monday', label: 'Senin' },
  { value: 'Tuesday', label: 'Selasa' },
  { value: 'Wednesday', label: 'Rabu' },
  { value: 'Thursday', label: 'Kamis' },
  { value: 'Friday', label: 'Jumat' },
  { value: 'Saturday', label: 'Sabtu' },
  { value: 'Sunday', label: 'Minggu' },
];

export const dayNameIndonesian: Record<string, string> = {
  'Monday': 'Senin',
  'Tuesday': 'Selasa',
  'Wednesday': 'Rabu',
  'Thursday': 'Kamis',
  'Friday': 'Jumat',
  'Saturday': 'Sabtu',
  'Sunday': 'Minggu'
};

export const colorsOption = [
  { label: 'Indigo', value: '#3525cd' },
  { label: 'Cokelat Karat', value: '#7e3000' },
  { label: 'Abu-abu Slate', value: '#505f76' },
  { label: 'Ungu Violet', value: '#4f46e5' },
  { label: 'Merah Crimson', value: '#ba1a1a' },
  { label: 'Hijau Zamrud', value: '#16a34a' }
];

/**
 * Menghitung tanggal kelas perkuliahan berikutnya berdasarkan nama hari bahasa Inggris
 */
export const getNextClassDate = (dayName: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = days.indexOf(dayName);
  if (targetDayIndex === -1) return '';

  const d = new Date();
  const currentDayIndex = d.getDay();
  
  let daysUntil = targetDayIndex - currentDayIndex;
  if (daysUntil <= 0) {
    daysUntil += 7; // Kalau hari ini adalah hari tersebut atau sudah lewat, cari di minggu depan
  }
  
  d.setDate(d.getDate() + daysUntil);
  return d.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
