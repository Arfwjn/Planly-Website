// =============================================================================
// Planly — iCalendar Utility (Pengekspor File Kalender .ics)
//
// File utilitas ini dipake buat ngebantu nge-generate/bikin file dokumen berformat
// iCalendar (.ics) biar jadwal kuliah, tugas, sama event di Planly bisa disinkronin
// (import) langsung ke Google Calendar, Apple Calendar, ato Microsoft Outlook.
//Format standardnya ngikutin regulasi RFC 5545.
// =============================================================================

import { Course, RescheduledSession, Task, CampusEvent } from '../types';

// Map nama hari bahasa Inggris ke angka indeks JavaScript (Minggu = 0, Senin = 1, dst)
const DAY_MAP: Record<string, number> = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6
};

/**
 * Format tanggal ("YYYY-MM-DD") dan jam ("HH:MM") ke format iCalendar standard ("YYYYMMDDTHHMMSS").
 * Contoh: "2026-06-09" dan "08:00" -> "20260609T080000"
 */
const formatICalDate = (dateStr: string, timeStr: string): string => {
  const cleanDate = dateStr.replace(/-/g, ''); // Hapus strip "-"
  const cleanTime = timeStr.replace(/:/g, '').substring(0, 4) + '00'; // Hapus titik dua ":" dan tambahin detik "00"
  return `${cleanDate}T${cleanTime}`;
};

/**
 * Nyari tanggal awal perkuliahan satu semester (ditentukan Senin, 4 minggu yang lalu dari sekarang).
 * Ini biar pas di-export, riwayat kuliah 4 minggu ke belakang juga ikut ke-export di kalender.
 */
const getSemesterStartDate = (): Date => {
  const d = new Date();
  const day = d.getDay();
  // Hitung mundur biar dapet hari Senin di minggu ini
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  // Mundurin lagi 28 hari (4 minggu) ke belakang
  monday.setDate(monday.getDate() - 28);
  return monday;
};

interface ICalEventParams {
  uid: string;
  start: string;
  end: string;
  summary: string;
  description?: string;
  location?: string;
}

/**
 * Bikin satu blok data event (VEVENT) iCalendar.
 * Blok ini yang nantinya dibaca sama aplikasi kalender luar sebagai satu jadwal/kegiatan.
 */
const createICalEvent = (params: ICalEventParams): string => {
  // Timestamp waktu pembuatan data (DTSTAMP) berformat UTC Zulu ("Z")
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const eventLines = [
    'BEGIN:VEVENT',
    `UID:${params.uid}`, // ID unik buat event ini biar gak tabrakan atau double sync
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${params.start}`, // Waktu mulai event
    `DTEND:${params.end}`, // Waktu selesai event
    `SUMMARY:${params.summary.replace(/[,;]/g, '\\$&')}` // Judul event (karakter koma/titik koma di-escape)
  ];

  // Tambahin deskripsi/keterangan kalo ada (karakter khusus di-escape biar gak ngerusak format .ics)
  if (params.description) {
    const cleanDesc = params.description
      .replace(/\\/g, '\\\\')
      .replace(/[\r\n]+/g, '\\n')
      .replace(/[,;]/g, '\\$&');
    eventLines.push(`DESCRIPTION:${cleanDesc}`);
  }

  // Tambahin info lokasi/ruangan kelas kuliah/event kalo ada
  if (params.location) {
    eventLines.push(`LOCATION:${params.location.replace(/[,;]/g, '\\$&')}`);
  }

  eventLines.push('END:VEVENT');
  // Gabungin tiap baris dengan Carriage Return + Line Feed (\r\n) sesuai spec iCal
  return eventLines.join('\r\n');
};

/**
 * Fungsi utama buat ngerakit seluruh data (Mata Kuliah, Tugas, Event Kampus)
 * jadi satu kesatuan string dokumen kalender iCalendar (.ics) yang utuh.
 */
export const generateICalendarData = (
  courses: Course[],
  rescheduledSessions: RescheduledSession[],
  tasks: Task[],
  events: CampusEvent[]
): string => {
  const icalEvents: string[] = [];
  const semesterStart = getSemesterStartDate();
  // Kita bakal nge-generate jadwal rutin mingguan selama 18 minggu berturut-turut
  const totalWeeks = 18; 

  // --- 1. PROSES JADWAL KULIAH RUTIN & OVERRIDE JADWAL (RESCHEDULE) ---
  courses.forEach((course) => {
    const courseDayNum = DAY_MAP[course.day_of_week] ?? 1;

    for (let w = 0; w < totalWeeks; w++) {
      // Cari tanggal di minggu ke-w
      const currentSessionDate = new Date(semesterStart);
      currentSessionDate.setDate(semesterStart.getDate() + (w * 7));
      
      // Geser tanggalnya biar pas sama hari kuliah yang bersangkutan (contoh: dipasin ke hari Kamis)
      const sessionDay = currentSessionDate.getDay();
      const dayDiff = courseDayNum - sessionDay;
      currentSessionDate.setDate(currentSessionDate.getDate() + dayDiff);

      // Konversi ke format string "YYYY-MM-DD"
      const year = currentSessionDate.getFullYear();
      const month = String(currentSessionDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentSessionDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Cek apakah ada jadwal reschedule / pembatalan kelas untuk tanggal ini
      const override = rescheduledSessions.find(
        (r) => r.course_id === course.id && r.original_date === dateStr
      );

      if (override) {
        if (override.is_canceled) {
          // Kalo kelas dibatalkan (diliburkan), lewatin aja minggu ini (gak usah dibikin event iCal-nya)
          continue;
        } else if (override.new_date && override.new_start_time && override.new_end_time) {
          // Kalo kelas dipindahkan (reschedule), ganti jadwalnya pake tanggal & jam yang baru
          const start = formatICalDate(override.new_date, override.new_start_time);
          const end = formatICalDate(override.new_date, override.new_end_time);
          icalEvents.push(
            createICalEvent({
              uid: `planly-course-reschedule-${course.id}-${dateStr}@planly.app`,
              start,
              end,
              summary: `[Pindahan] ${course.course_name}`,
              description: `Kelas kuliah pindahan pengganti sesi kuliah normal tanggal ${dateStr}. ${override.note || ''}`,
              location: course.room
            })
          );
        }
      } else {
        // Kalo gak ada pemindahan jadwal, kita bikin sesi kuliah rutin normal mingguan biasa
        const start = formatICalDate(dateStr, course.start_time);
        const end = formatICalDate(dateStr, course.end_time);
        icalEvents.push(
          createICalEvent({
            uid: `planly-course-routine-${course.id}-${dateStr}@planly.app`,
            start,
            end,
            summary: course.course_name,
            description: `Mata kuliah rutin: ${course.course_name} (${course.course_code})\nDosen: ${course.lecturer_name}\nSKS: ${course.sks}`,
            location: course.room
          })
        );
      }
    }
  });

  // --- 2. PROSES TENGGAT TUGAS (TASKS) ---
  tasks.forEach((task) => {
    // Kalo tugasnya gak punya info deadline, ya gak usah dimasukin ke kalender
    if (!task.deadline) return;
    
    // Format tanggal deadline dari Planly: "YYYY-MM-DD HH:MM:SS" -> dipecah
    const parts = task.deadline.split(' ');
    const dateStr = parts[0];
    const timeStr = parts[1] ? parts[1].substring(0, 5) : '23:59'; // Kalo jam gak diset, default jam 23:59 malem

    const start = formatICalDate(dateStr, timeStr);
    
    // Set durasi event deadline tugas di kalender selama 30 menit (biar keliatan balok kecil di kalender)
    const [h, m] = timeStr.split(':').map(Number);
    const endMinutes = m + 30;
    const endH = String(h + Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const end = formatICalDate(dateStr, `${endH}:${endM}`);

    const courseName = task.course_id ? `Mata Kuliah ID: ${task.course_id}` : 'Tugas Umum';

    icalEvents.push(
      createICalEvent({
        uid: `planly-task-${task.id}@planly.app`,
        start,
        end,
        summary: `[Tugas] ${task.task_title}`,
        description: `Tenggat tugas kuliah (${courseName})\nStatus: ${task.is_finished ? 'SELESAI' : 'BELUM SELESAI'}\nDetail: ${task.description || 'Tidak ada deskripsi.'}`,
        location: 'Planly Tasks App'
      })
    );
  });

  // --- 3. PROSES EVENT KAMPUS (CAMPUS EVENTS) ---
  events.forEach((event) => {
    const start = formatICalDate(event.event_date, event.start_time);
    const end = formatICalDate(event.event_date, event.end_time);

    icalEvents.push(
      createICalEvent({
        uid: `planly-campusevent-${event.id}@planly.app`,
        start,
        end,
        summary: `[Event] ${event.event_name}`,
        description: `Event Kampus: ${event.event_name} (${event.category.toUpperCase()})\nPenyelenggara: ${event.organizer}\nKeterangan: ${event.description || 'Tidak ada deskripsi.'}`,
        location: event.location
      })
    );
  });

  // Gabungin semua baris iCalendar data ke dalam satu kerangka utuh
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planly//Academic Calendar//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Planly Academic Calendar',
    'X-WR-TIMEZONE:Asia/Jakarta', // Set zona waktu default ke Waktu Indonesia Barat (WIB)
    icalEvents.join('\r\n'),
    'END:VCALENDAR'
  ].join('\r\n');
};

/**
 * Memicu pengunduhan berkas .ics langsung di browser user
 */
export const downloadICSFile = (content: string, filename = 'planly_calendar.ics'): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click(); // Klik link download palsu via JS
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Bersihin memory URL blob
};
