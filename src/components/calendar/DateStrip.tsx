import React from 'react';
import { Course, RescheduledSession } from '../../types';
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
  rescheduledSessions
}: DateStripProps) {
  
  // Format Date ke "YYYY-MM-DD"
  const formatDateYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
        {daysInWeek.map((day, index) => {
          const isSelected = selectedDayObj.fullName === day.fullName;
          const isToday = index === 0;
          const dateStr = formatDateYYYYMMDD(day.dateObject);

          // Ambil kelas untuk tanggal strip ini
          const { dayCoursesProcessed } = getCoursesForDate(
            dateStr,
            courses,
            rescheduledSessions
          );

          return (
            <button
              key={day.fullName}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`group flex-1 min-w-[64px] max-w-[130px] flex flex-col items-center justify-between h-[84px] py-2.5 px-2 rounded-xl border transition-all duration-205 cursor-pointer select-none ${
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

              {/* Indikator Hari Ini atau Titik Mata Kuliah */}
              {isToday ? (
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md leading-none transition-colors duration-200 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary border border-primary/10 group-hover:bg-primary/20'
                }`}>
                  KINI
                </span>
              ) : (
                <div className="flex gap-1 justify-center items-center h-2 mt-0.5">
                  {dayCoursesProcessed.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        isSelected ? 'bg-white' : ''
                      }`}
                      style={isSelected ? {} : { backgroundColor: c.is_canceled ? '#94A3B8' : c.color_hex }}
                      title={c.course_name}
                    />
                  ))}
                  {dayCoursesProcessed.length > 3 && (
                    <span className={`text-[8px] font-black ${isSelected ? 'text-white' : 'text-[#94A3B8] group-hover:text-primary'}`}>
                      +
                    </span>
                  )}
                  {dayCoursesProcessed.length === 0 && (
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
