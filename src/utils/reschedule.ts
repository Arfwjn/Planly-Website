// =============================================================================
// Planly — Reschedule Utility (Pengolah Jadwal Pindahan & Pembatalan Kuliah)
//
// File utilitas ini bertugas buat memproses pergeseran kelas / reschedule
// dan pembatalan kuliah harian (cancelation). Logika di dalamnya bakal nentuin
// kelas mana aja yang kudu tampil di hari tertentu dan menyembunyikan kelas normal
// yang dipindahkan / diliburkan.
// =============================================================================

import { Course, RescheduledSession } from '../types';

export interface ProcessedCourse extends Course {
  is_canceled?: boolean;
  is_rescheduled_in?: boolean;
  is_time_shifted?: boolean;
  original_start_time?: string;
  original_end_time?: string;
  reschedule_note?: string | null;
  rescheduled_session_id?: number;
  reschedule_original_date?: string;
}

/**
 * Fungsi buat ngitung dan nyaring daftar mata kuliah pada tanggal tertentu (format "YYYY-MM-DD")
 * dengan memperhitungkan semua aturan reschedule (pindah jadwal) dan cancel (diliburkan).
 * 
 * Hasil return-nya berupa object dengan dua array:
 * - dayCoursesProcessed: Sesi kuliah yang aktif di tanggal tersebut (termasuk kelas pindahan/pengganti).
 * - rescheduledOutCourses: Sesi kuliah rutin yang aslinya hari ini, tapi lagi dipindahin ke hari lain.
 */
export function getCoursesForDate(
  dateStr: string, // Format "YYYY-MM-DD"
  courses: Course[],
  rescheduledSessions: RescheduledSession[]
): { dayCoursesProcessed: ProcessedCourse[]; rescheduledOutCourses: Course[] } {
  // Cari nama hari bahasa Inggris sesuai tanggal input (misal: "Monday", "Tuesday", dst)
  const dateObj = new Date(dateStr);
  const weekdaysEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNameEng = weekdaysEng[dateObj.getDay()];

  // Filter kelas rutin yang emang aslinya terjadwal di hari ini
  const normalDayCourses = courses.filter((c) => c.day_of_week === dayNameEng);

  const dayCoursesProcessed: ProcessedCourse[] = [];
  const rescheduledOutCourses: Course[] = [];

  // 1. Cek satu per satu kelas rutin hari ini, apakah ada override (reschedule/cancel)
  normalDayCourses.forEach((course) => {
    const override = rescheduledSessions.find(
      (s) => s.course_id === course.id && s.original_date === dateStr
    );

    if (override) {
      if (override.is_canceled) {
        // Kasus A: Kuliahnya dibatalkan/diliburkan khusus di tanggal ini
        dayCoursesProcessed.push({
          ...course,
          is_canceled: true,
          reschedule_note: override.note,
          rescheduled_session_id: override.id,
          reschedule_original_date: override.original_date,
        });
      } else if (override.new_date !== dateStr) {
        // Kasus B: Sesi kuliah aslinya hari ini, tapi digeser ke tanggal lain (rescheduled out)
        rescheduledOutCourses.push(course);
      } else {
        // Kasus C: Kuliahnya tetep hari ini, tapi dipindahin jam mulainya (misal dari jam 8 digeser ke jam 10)
        dayCoursesProcessed.push({
          ...course,
          start_time: override.new_start_time || course.start_time,
          end_time: override.new_end_time || course.end_time,
          is_rescheduled_in: false,
          is_time_shifted: true,
          original_start_time: course.start_time,
          original_end_time: course.end_time,
          reschedule_note: override.note,
          rescheduled_session_id: override.id,
          reschedule_original_date: override.original_date,
        });
      }
    } else {
      // Kasus D: Gak ada perubahan jadwal sama sekali, tampilkan normal
      dayCoursesProcessed.push(course);
    }
  });

  // 2. Cari kelas dari hari lain yang dipindahkan / masuk ke tanggal ini (Kelas Pengganti / Rescheduled In)
  rescheduledSessions.forEach((override) => {
    // Kalo tanggal barunya pas hari ini dan statusnya gak dibatalkan, DAN aslinya bukan dari hari ini (agar tidak duplikat), kita masukin
    if (override.new_date === dateStr && !override.is_canceled && override.original_date !== dateStr) {
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

  // 3. Urutkan jadwal kuliah dari jam paling pagi ke jam paling sore biar rapi pas dibaca
  dayCoursesProcessed.sort((a, b) => a.start_time.localeCompare(b.start_time));

  return { dayCoursesProcessed, rescheduledOutCourses };
}
