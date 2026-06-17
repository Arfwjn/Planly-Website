/**
 * =============================================================================
 * Planly — CourseCard.tsx
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

import React from 'react';
import { User, Clock, MapPin } from 'lucide-react';
import { Course, Task } from '../../types';
import { hexToRgb } from '../../utils/color';
import { dayNameIndonesian } from './courseHelpers';

interface CourseCardProps {
  course: Course;
  tasks: Task[];
  onClick: () => void;
}

/**
 * Komponen CourseCard
 * 
 * Blok kartu visual untuk satu mata kuliah terdaftar.
 * Menampilkan:
 * - Kode & nama mata kuliah dengan aksen warna glow dinamis.
 * - Badge merah berisi jumlah tugas belum selesai (pending tasks count) yang terkait.
 * - Informasi dosen, jadwal kuliah, dan ruangan kelas.
 */
export default function CourseCard({
  course,
  tasks,
  onClick
}: CourseCardProps) {
  // Hitung jumlah tugas yang belum selesai (pending) untuk matakuliah ini
  const courseTasksCount = tasks.filter((t) => t.course_id === course.id && !t.is_finished).length;

  return (
    <article
      onClick={onClick}
      style={{ '--glow-color': hexToRgb(course.color_hex) } as React.CSSProperties}
      className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 relative shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.08)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_20px_40px_rgba(var(--glow-color),0.12)] transition-all duration-300 group cursor-pointer h-full"
    >
      <div className="flex justify-between items-start">
        <span
          className="text-[11px] font-black px-3 py-1 rounded-lg text-white tracking-wider uppercase border border-white/10"
          style={{
            backgroundColor: course.color_hex,
            boxShadow: `0 4px 12px rgba(var(--glow-color), 0.25)`
          }}
        >
          {course.course_code}
        </span>
        
        {/* Badge jumlah tugas tertunda */}
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

      {/* Rincian info mata kuliah */}
      <div className="mt-auto pt-4 border-t border-[#F1F5F9] dark:border-slate-800/60 flex flex-col gap-2 text-xs font-semibold text-on-surface-variant">
        <div className="flex items-center gap-2.5">
          <User className="text-[#94A3B8] w-3.5 h-3.5" />
          <span className="truncate">{course.lecturer_name}</span>
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
}
