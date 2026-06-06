import { Course, RescheduledSession } from '../types';

export interface ProcessedCourse extends Course {
  is_canceled?: boolean;
  is_rescheduled_in?: boolean;
  reschedule_note?: string | null;
  rescheduled_session_id?: number;
  reschedule_original_date?: string;
}

/**
 * Memproses mata kuliah untuk suatu tanggal berdasarkan aturan pemindahan (reschedule) dan pembatalan (cancel).
 * 
 * Mengembalikan:
 * - dayCoursesProcessed: Kelas yang aktif/tampil pada tanggal tersebut (termasuk kelas pengganti dan kelas dibatalkan).
 * - rescheduledOutCourses: Kelas normal hari tersebut yang dipindahkan ke tanggal lain.
 */
export function getCoursesForDate(
  dateStr: string, // Format "YYYY-MM-DD"
  courses: Course[],
  rescheduledSessions: RescheduledSession[]
): { dayCoursesProcessed: ProcessedCourse[]; rescheduledOutCourses: Course[] } {
  // Dapatkan nama hari bahasa Inggris
  const dateObj = new Date(dateStr);
  const weekdaysEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNameEng = weekdaysEng[dateObj.getDay()];

  // Ambil semua kuliah yang jadwal normalnya di hari ini
  const normalDayCourses = courses.filter((c) => c.day_of_week === dayNameEng);

  const dayCoursesProcessed: ProcessedCourse[] = [];
  const rescheduledOutCourses: Course[] = [];

  // Filter kelas normal berdasarkan override pada tanggal ini
  normalDayCourses.forEach((course) => {
    const override = rescheduledSessions.find(
      (s) => s.course_id === course.id && s.original_date === dateStr
    );

    if (override) {
      if (override.is_canceled) {
        // Kelas dibatalkan pada tanggal ini
        dayCoursesProcessed.push({
          ...course,
          is_canceled: true,
          reschedule_note: override.note,
          rescheduled_session_id: override.id,
          reschedule_original_date: override.original_date,
        });
      } else if (override.new_date !== dateStr) {
        // Kelas dipindahkan ke tanggal lain
        rescheduledOutCourses.push(course);
      } else {
        // Kelas tetap di tanggal ini tapi jam diubah
        dayCoursesProcessed.push({
          ...course,
          start_time: override.new_start_time || course.start_time,
          end_time: override.new_end_time || course.end_time,
          is_rescheduled_in: true,
          reschedule_note: override.note,
          rescheduled_session_id: override.id,
          reschedule_original_date: override.original_date,
        });
      }
    } else {
      // Tidak ada override, tampilkan normal
      dayCoursesProcessed.push(course);
    }
  });

  // Cari kelas dari hari lain yang dipindahkan ke tanggal ini (Kelas Pengganti / Rescheduled In)
  rescheduledSessions.forEach((override) => {
    if (override.new_date === dateStr && !override.is_canceled) {
      const course = courses.find((c) => c.id === override.course_id);
      if (course) {
        dayCoursesProcessed.push({
          ...course,
          start_time: override.new_start_time || course.start_time,
          end_time: override.new_end_time || course.end_time,
          is_rescheduled_in: true,
          reschedule_note: override.note,
          rescheduled_session_id: override.id,
          reschedule_original_date: override.original_date,
        });
      }
    }
  });

  // Urutkan kelas berdasarkan start_time terkecil ke terbesar
  dayCoursesProcessed.sort((a, b) => a.start_time.localeCompare(b.start_time));

  return { dayCoursesProcessed, rescheduledOutCourses };
}
