/**
 * =============================================================================
 * Planly — DateStrip.tsx
 * 
 * Kegunaan:
 * Komponen visualisasi jadwal perkuliahan, agenda rutin, reschedule, & kalender interaktif bulanan/mingguan.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan CalendarView.tsx (orkestrator) dan terintegrasi dengan Google / Outlook Calendar.
 * 
 * Aliran Data / State:
 * - Membaca kueri jadwal kuliah harian/bulanan mahasiswa, memicu form reschedule kelas, dan check-in kehadiran.
 * =============================================================================
 */

import { Course, RescheduledSession, CampusEvent } from '../../types';
import { getCoursesForDate } from '../../utils/reschedule';

interface DayInWeek {
  dayName: string;
  fullName: string;
  dateNum: number;
  dateObject: Date;
}

interface DateStripProps {
  daysInWeek: DayInWeek[];
  selectedDayObj: DayInWeek;
  onSelectDay: (day: DayInWeek) => void;
  courses: Course[];
  rescheduledSessions: RescheduledSession[];
  events: CampusEvent[];
}

/**
 * Komponen DateStrip
 * 
 * Baris navigasi tanggal horizontal yang menampilkan rentang 7 hari ke depan.
 * Menandai hari ini dengan badge khusus "KINI" dan menampilkan dots indikator kelas terjadwal.
 */
export default function DateStrip({
  daysInWeek,
  selectedDayObj,
  onSelectDay,
  courses,
  rescheduledSessions,
  events
}: DateStripProps) {
  
  // Format Date ke "YYYY-MM-DD"
  const formatDateYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isTodayDate = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
        {daysInWeek.map((day) => {
          const isSelected = selectedDayObj.dateObject.getDate() === day.dateObject.getDate() &&
                             selectedDayObj.dateObject.getMonth() === day.dateObject.getMonth() &&
                             selectedDayObj.dateObject.getFullYear() === day.dateObject.getFullYear();
          const isToday = isTodayDate(day.dateObject);
          const dateStr = formatDateYYYYMMDD(day.dateObject);

          // Ambil kelas & event untuk tanggal strip ini
          const { dayCoursesProcessed } = getCoursesForDate(
            dateStr,
            courses,
            rescheduledSessions
          );
          const dayEvents = (events || []).filter((e) => e.event_date === dateStr);
          const dayItems = [
            ...dayCoursesProcessed.map((c) => ({
              id: `course-${c.id}`,
              color: c.is_canceled ? '#94A3B8' : c.color_hex,
              title: `Kuliah: ${c.course_name}`
            })),
            ...dayEvents.map((e) => ({
              id: `event-${e.id}`,
              color: e.color_hex,
              title: `Event: ${e.event_name}`
            }))
          ];

          return (
            <button
              key={day.fullName}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`group flex-1 min-w-[64px] max-w-[130px] flex flex-col items-center justify-between h-[84px] py-2.5 px-2 rounded-xl border transition-all duration-205 cursor-pointer select-none no-animate ${
                isSelected
                  ? 'bg-gradient-to-br from-primary to-indigo-600 text-white border-transparent shadow-md shadow-primary/20'
                  : 'border-date-btn-border dark:border-slate-800 bg-date-btn-bg dark:bg-slate-950 text-on-surface-variant hover:bg-primary/[0.04] dark:hover:bg-slate-800/40 hover:border-primary/30 hover:text-primary'
              }`}
            >
              <span className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors duration-200 ${
                isSelected ? 'text-white/85' : 'text-[#94A3B8] group-hover:text-primary/70'
              }`}>
                {day.dayName}
              </span>
              
              <span className="text-lg font-black tracking-tight leading-none mt-0.5">
                {day.dateNum}
              </span>

              {/* Indikator Hari Ini atau Titik Mata Kuliah & Event */}
              {isToday ? (
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none transition-colors duration-200 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary border border-primary/10 group-hover:bg-primary/20'
                }`}>
                  KINI
                </span>
              ) : (
                <div className="flex gap-1 justify-center items-center h-2 mt-0.5">
                  {dayItems.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        isSelected ? 'bg-white' : ''
                      }`}
                      style={isSelected ? {} : { backgroundColor: item.color }}
                      title={item.title}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <span className={`text-[8px] font-black ${isSelected ? 'text-white' : 'text-[#94A3B8] group-hover:text-primary'}`}>
                      +
                    </span>
                  )}
                  {dayItems.length === 0 && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/30' : 'bg-[#E2E8F0] dark:bg-slate-800'}`} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
