/**
 * =============================================================================
 * Planly — MonthViewGrid.tsx
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

interface MonthViewGridProps {
  viewedMonth: Date;
  onViewedMonthChange: (date: Date) => void;
  selectedISODate: string;
  courses: Course[];
  rescheduledSessions: RescheduledSession[];
  onSelectDate: (date: Date) => void;
  events: CampusEvent[];
}

/**
 * Komponen MonthViewGrid
 * 
 * Menampilkan grid bulanan 6x7 (42 hari) berisi tanggal-tanggal bulan aktif serta
 * irisan bulan sebelum/sesudahnya. Setiap tanggal menampilkan dots berwarna
 * sesuai dengan jadwal kuliah yang aktif pada hari tersebut.
 */
export default function MonthViewGrid({
  viewedMonth,
  onViewedMonthChange,
  selectedISODate,
  courses,
  rescheduledSessions,
  onSelectDate,
  events
}: MonthViewGridProps) {
  
  // Format Date ke "YYYY-MM-DD"
  const formatDateYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Menghasilkan daftar 42 hari untuk grid kalender bulanan (6 baris x 7 kolom)
  const getMonthGridDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    // Hari pertama pada bulan yang bersangkutan
    const firstDayOfMonth = new Date(year, month, 1);
    // Hari pertama dalam baris pertama kalender grid
    const startDay = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu, 1 = Senin, dst.
    startDay.setDate(startDay.getDate() - dayOfWeek);

    const gridDays = [];
    for (let i = 0; i < 42; i++) {
      const current = new Date(startDay);
      current.setDate(startDay.getDate() + i);
      gridDays.push({
        date: current,
        isCurrentMonth: current.getMonth() === month
      });
    }
    return gridDays;
  };

  const handlePrevMonth = () => {
    const prev = new Date(viewedMonth);
    prev.setMonth(prev.getMonth() - 1);
    onViewedMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(viewedMonth);
    next.setMonth(next.getMonth() + 1);
    onViewedMonthChange(next);
  };

  const todayStr = formatDateYYYYMMDD(new Date());

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header Bulan & Navigasi */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">
          {viewedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-on-surface-variant cursor-pointer transition-colors bg-white dark:bg-slate-900 no-animate"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-on-surface-variant cursor-pointer transition-colors bg-white dark:bg-slate-900 no-animate"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Label Nama Hari */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider pb-2 border-b border-[#F1F5F9] dark:border-slate-800">
        <div>Min</div>
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div>Sab</div>
      </div>

      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-1.5">
        {getMonthGridDays(viewedMonth).map((gridDay, idx) => {
          const gridDateStr = formatDateYYYYMMDD(gridDay.date);
          const isToday = todayStr === gridDateStr;
          const isSelected = selectedISODate === gridDateStr;
          
          // Hitung kelas untuk hari ini menggunakan helper reschedule
          const { dayCoursesProcessed } = getCoursesForDate(
            gridDateStr,
            courses,
            rescheduledSessions
          );
          const dayEvents = (events || []).filter((e) => e.event_date === gridDateStr);
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
              key={idx}
              type="button"
              onClick={() => onSelectDate(gridDay.date)}
              className={`min-h-[60px] flex flex-col justify-between p-1.5 border rounded-xl transition-all cursor-pointer no-animate ${
                gridDay.isCurrentMonth
                  ? isSelected
                    ? 'bg-[#F5F2FF] dark:bg-slate-800 border-primary text-primary font-bold shadow-xs'
                    : isToday
                      ? 'border-primary/45 bg-primary/[0.02] text-on-surface hover:bg-slate-50 dark:hover:bg-slate-850/40'
                      : 'border-[#F1F5F9] dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-on-surface hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  : 'border-[#F8FAFC] dark:border-slate-950 bg-white dark:bg-slate-950 text-on-surface-variant/40 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <span className={`text-[10px] font-bold self-start ${isToday && !isSelected ? 'text-primary' : ''}`}>
                {gridDay.date.getDate()}
              </span>

              {/* Dots Penanda Mata Kuliah & Event */}
              <div className="flex flex-wrap gap-0.5 mt-1 self-stretch items-center min-h-[8px]">
                {dayItems.slice(0, 4).map((item) => (
                  <span
                    key={item.id}
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                    title={item.title}
                  />
                ))}
                {dayItems.length > 4 && (
                  <span className="text-[7px] font-extrabold text-[#94A3B8] leading-none">+</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
