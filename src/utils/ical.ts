import { Course, RescheduledSession, Task, CampusEvent } from '../types';

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
 * Format tanggal ("YYYY-MM-DD") dan jam ("HH:MM") ke format iCalendar ("YYYYMMDDTHHMMSS").
 */
const formatICalDate = (dateStr: string, timeStr: string): string => {
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '').substring(0, 4) + '00';
  return `${cleanDate}T${cleanTime}`;
};

/**
 * Mendapatkan tanggal awal semester (Senin, 4 minggu yang lalu)
 */
const getSemesterStartDate = (): Date => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Sesuaikan jika hari Minggu
  const monday = new Date(d.setDate(diff));
  monday.setDate(monday.getDate() - 28); // 4 minggu lalu
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
 * Membuat blok string VEVENT untuk iCalendar
 */
const createICalEvent = (params: ICalEventParams): string => {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const eventLines = [
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${params.start}`,
    `DTEND:${params.end}`,
    `SUMMARY:${params.summary.replace(/[,;]/g, '\\$&')}`
  ];

  if (params.description) {
    const cleanDesc = params.description
      .replace(/\\/g, '\\\\')
      .replace(/[\r\n]+/g, '\\n')
      .replace(/[,;]/g, '\\$&');
    eventLines.push(`DESCRIPTION:${cleanDesc}`);
  }

  if (params.location) {
    eventLines.push(`LOCATION:${params.location.replace(/[,;]/g, '\\$&')}`);
  }

  eventLines.push('END:VEVENT');
  return eventLines.join('\r\n');
};

/**
 * Menghasilkan string dokumen iCalendar (.ics) lengkap
 */
export const generateICalendarData = (
  courses: Course[],
  rescheduledSessions: RescheduledSession[],
  tasks: Task[],
  events: CampusEvent[]
): string => {
  const icalEvents: string[] = [];
  const semesterStart = getSemesterStartDate();
  const totalWeeks = 18; // Menghasilkan event selama 18 minggu (4 minggu lalu s.d 14 minggu ke depan)

  // 1. Proses Mata Kuliah Mingguan & Rescheduled Sessions
  courses.forEach((course) => {
    const courseDayNum = DAY_MAP[course.day_of_week] ?? 1;

    for (let w = 0; w < totalWeeks; w++) {
      // Hitung tanggal pertemuan di minggu ke-w
      const currentSessionDate = new Date(semesterStart);
      currentSessionDate.setDate(semesterStart.getDate() + (w * 7));
      
      // Sesuaikan hari ke target day_of_week
      const sessionDay = currentSessionDate.getDay();
      const dayDiff = courseDayNum - sessionDay;
      currentSessionDate.setDate(currentSessionDate.getDate() + dayDiff);

      // Format ke YYYY-MM-DD
      const year = currentSessionDate.getFullYear();
      const month = String(currentSessionDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentSessionDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Cek apakah ada jadwal reschedule/dibatalkan untuk tanggal ini
      const override = rescheduledSessions.find(
        (r) => r.course_id === course.id && r.original_date === dateStr
      );

      if (override) {
        if (override.is_canceled) {
          // Kelas dibatalkan, lewati minggu ini
          continue;
        } else if (override.new_date && override.new_start_time && override.new_end_time) {
          // Kelas dipindahkan (rescheduled)
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
        // Sesi kuliah rutin normal
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

  // 2. Proses Tenggat Tugas (Tasks)
  tasks.forEach((task) => {
    if (!task.deadline) return;
    
    // Format deadline: "YYYY-MM-DD HH:MM:SS"
    const parts = task.deadline.split(' ');
    const dateStr = parts[0];
    const timeStr = parts[1] ? parts[1].substring(0, 5) : '23:59';

    const start = formatICalDate(dateStr, timeStr);
    
    // Buat durasi 30 menit untuk tenggat tugas
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

  // 3. Proses Event Kampus (Campus Events)
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

  // Susun VCALENDAR lengkap
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planly//Academic Calendar//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Planly Academic Calendar',
    'X-WR-TIMEZONE:Asia/Jakarta',
    icalEvents.join('\r\n'),
    'END:VCALENDAR'
  ].join('\r\n');
};

/**
 * Memicu download berkas .ics langsung di browser
 */
export const downloadICSFile = (content: string, filename = 'planly_calendar.ics'): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
