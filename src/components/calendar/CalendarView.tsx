/**
 * =============================================================================
 * Planly — CalendarView.tsx
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

import React, { useState, useEffect } from 'react';
import { CalendarDays, Info, Undo2, Calendar as CalendarIcon, Coffee, Smile, BookOpen } from 'lucide-react';
import { Course, RescheduledSession, Task, AttendanceRecord, CampusEvent } from '../../types';
import Skeleton from '../ui/Skeleton';
import { getCoursesForDate } from '../../utils/reschedule';
import { hexToRgb } from '../../utils/color';
import EmptyState from '../ui/InteractiveEmptyState';

// Import sub-komponen modular
import MonthViewGrid from './MonthViewGrid';
import DateStrip from './DateStrip';
import CourseTimelineCard from './CourseTimelineCard';
import EventTimelineCard from './EventTimelineCard';
import RescheduleModal from './RescheduleModal';

interface CalendarViewProps {
  courses: Course[];
  tasks: Task[];
  onToggleTaskState: (taskId: number) => void;
  onOpenAddNewCourseModal: () => void;
  loading?: boolean;
  rescheduledSessions: RescheduledSession[];
  onAddReschedule: (session: Omit<RescheduledSession, 'id'>) => void;
  onDeleteReschedule: (courseId: number, originalDate: string) => void;
  onTabChange?: (tab: any) => void;
  attendanceRecords: AttendanceRecord[];
  events: CampusEvent[];
}

interface DayInWeek {
  dayName: string;
  fullName: string;
  dateNum: number;
  dateObject: Date;
}

/**
 * Komponen CalendarView (Orchestrator)
 * 
 * Mengelola navigasi hari, mode visualisasi (Mingguan vs Bulanan), jam internal sistem,
 * dan perakitan layout utama halaman Kalender/Jadwal Kuliah.
 */
export default function CalendarView({
  courses,
  tasks,
  onToggleTaskState,
  onOpenAddNewCourseModal,
  loading = false,
  rescheduledSessions,
  onAddReschedule,
  onDeleteReschedule,
  onTabChange,
  attendanceRecords,
  events
}: CalendarViewProps) {
  
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

  const getDayObjFromDate = (date: Date): DayInWeek => {
    const daysNameShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      dayName: daysNameShort[date.getDay()],
      fullName: daysFullName[date.getDay()],
      dateNum: date.getDate(),
      dateObject: date
    };
  };

  // dynamic week strip generation centered/aligned around reference date
  const getDaysOfWeek = (refDate: Date): DayInWeek[] => {
    const daysList = [];
    const daysNameShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysFullName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Cari hari Minggu terdekat yang sebelum atau sama dengan refDate
    const startOfWeek = new Date(refDate);
    const dayIndex = refDate.getDay(); // 0 (Sun) s.d. 6 (Sat)
    startOfWeek.setDate(startOfWeek.getDate() - dayIndex);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      daysList.push({
        dayName: daysNameShort[d.getDay()],
        fullName: daysFullName[d.getDay()],
        dateNum: d.getDate(),
        dateObject: d
      });
    }
    return daysList;
  };

  const [selectedDayObj, setSelectedDayObj] = useState<DayInWeek>(() => getDayObjFromDate(new Date()));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMonthView, setIsMonthView] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(() => new Date());

  // Generasikan rentang 7 hari aktif secara dinamis berdasarkan dateObject yang sedang dipilih
  const daysInWeek = getDaysOfWeek(selectedDayObj.dateObject);

  // State Reschedule
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedCourseForReschedule, setSelectedCourseForReschedule] = useState<Course | null>(null);

  // Timer Detak Waktu Sistem
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sinkronisasi viewedMonth saat tanggal dipilih berubah
  useEffect(() => {
    setViewedMonth(new Date(selectedDayObj.dateObject));
  }, [selectedDayObj]);

  const selectedISODate = formatDateYYYYMMDD(selectedDayObj.dateObject);

  // Handler Kirim Reschedule
  const handleSubmitReschedule = (payload: {
    course_id: number;
    original_date: string;
    new_date: string;
    new_start_time: string;
    new_end_time: string;
    is_canceled: boolean;
    note: string | null;
  }) => {
    onAddReschedule(payload);
    setIsRescheduleModalOpen(false);
    setSelectedCourseForReschedule(null);
  };

  // Proses jadwal harian menggunakan reschedule helper
  const { dayCoursesProcessed, rescheduledOutCourses } = getCoursesForDate(
    selectedISODate,
    courses,
    rescheduledSessions
  );

  // Saring event kampus untuk tanggal terpilih
  const dayEvents = (events || []).filter((e) => e.event_date === selectedISODate);

  // Satukan mata kuliah dan event kampus ke dalam satu timeline
  const timelineItems: (
    | { type: 'course'; id: string; timeKey: string; data: Course }
    | { type: 'event'; id: string; timeKey: string; data: CampusEvent }
  )[] = [
    ...dayCoursesProcessed.map((c) => ({
      type: 'course' as const,
      id: `course-${c.id}`,
      timeKey: c.start_time,
      data: c
    })),
    ...dayEvents.map((e) => ({
      type: 'event' as const,
      id: `event-${e.id}`,
      timeKey: e.start_time,
      data: e
    }))
  ];

  // Urutkan timeline gabungan secara kronologis berdasarkan jam mulai
  timelineItems.sort((a, b) => a.timeKey.localeCompare(b.timeKey));

  const getCourseStatus = (course: Course): 'in-progress' | 'completed' | 'upcoming' => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentMin = hours * 60 + minutes;
    
    const [startH, startM] = course.start_time.split(':').map(Number);
    const [endH, endM] = course.end_time.split(':').map(Number);
    
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    
    if (currentMin >= startMin && currentMin <= endMin) {
      return 'in-progress';
    } else if (currentMin > endMin) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getIndonesianDayName = (day: string) => {
    const map: Record<string, string> = {
      'Sunday': 'Minggu',
      'Monday': 'Senin',
      'Tuesday': 'Selasa',
      'Wednesday': 'Rabu',
      'Thursday': 'Kamis',
      'Friday': 'Jumat',
      'Saturday': 'Sabtu'
    };
    return map[day] || day;
  };

  const activeCourseNow = dayCoursesProcessed.find(c => getCourseStatus(c) === 'in-progress');
  const activeEventNow = dayEvents.find((e) => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentMin = hours * 60 + minutes;
    
    const [startH, startM] = e.start_time.split(':').map(Number);
    const [endH, endM] = e.end_time.split(':').map(Number);
    
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    
    return currentMin >= startMin && currentMin <= endMin;
  });

  // Loading skeleton state
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-32 h-4 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-16 h-8 rounded-lg" />
            <Skeleton className="w-36 h-8 rounded-lg" />
          </div>
        </div>
        <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 min-w-[64px] max-w-[130px] flex flex-col items-center justify-between h-[84px] py-2.5 px-2 rounded-xl border border-slate-100 bg-slate-50/20">
                <Skeleton className="w-8 h-3 rounded-md animate-pulse" />
                <Skeleton className="w-6 h-6 rounded-md mt-1 animate-pulse" />
                <Skeleton className="w-10 h-3 rounded-md mt-1 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
          <Skeleton className="w-48 h-4 rounded-md animate-pulse" />
        </div>
        <div className="relative pt-2 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 lg:gap-6 relative">
              <div className="w-[50px] lg:w-[60px] flex-shrink-0 text-right pt-4 space-y-1">
                <Skeleton className="w-10 h-4 rounded-md ml-auto animate-pulse" />
                <Skeleton className="w-8 h-3 rounded-md ml-auto animate-pulse" />
              </div>
              <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3 shadow-sm h-[130px]">
                <Skeleton className="w-1/3 h-5 rounded-md animate-pulse" />
                <Skeleton className="w-2/3 h-4 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
            <CalendarDays className="w-8 h-8 text-primary" />
            <span>Jadwal & Kalender Kegiatan</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {selectedDayObj.dateObject.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedDayObj(getDayObjFromDate(new Date()))}
            className="px-3 py-2 border border-[#E2E8F0] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/40 text-on-surface-variant text-xs font-semibold rounded-lg hover:text-on-surface transition-colors cursor-pointer bg-white dark:bg-slate-900"
          >
            Hari Ini
          </button>
          
          <button
            type="button"
            onClick={() => setIsMonthView(!isMonthView)}
            className={`px-3 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMonthView
                ? 'bg-primary border-primary text-white hover:bg-primary/90'
                : 'border-[#E2E8F0] dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/40 text-on-surface-variant hover:text-on-surface bg-white dark:bg-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{isMonthView ? 'Tampilan Mingguan' : 'Tampilan Bulanan'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddNewCourseModal}
            className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors border-none"
          >
            Tambah Mata Kuliah
          </button>
        </div>
      </div>

      {/* Tampilan Bulanan */}
      {isMonthView ? (
        <MonthViewGrid
          viewedMonth={viewedMonth}
          onViewedMonthChange={setViewedMonth}
          selectedISODate={selectedISODate}
          courses={courses}
          rescheduledSessions={rescheduledSessions}
          onSelectDate={(date) => {
            setSelectedDayObj(getDayObjFromDate(date));
            setIsMonthView(false);
          }}
          events={events}
        />
      ) : (
        /* Tampilan Mingguan (Horizontal Date Strip) */
        <DateStrip
          daysInWeek={daysInWeek}
          selectedDayObj={selectedDayObj}
          onSelectDay={setSelectedDayObj}
          courses={courses}
          rescheduledSessions={rescheduledSessions}
          events={events}
        />
      )}

      {/* Baris Live Status Jam Sekarang */}
      {isTodayDate(selectedDayObj.dateObject) && !isMonthView && (
        <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5 text-xs text-on-surface font-semibold">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span>
              Waktu Sekarang: <strong className="text-primary">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong>
            </span>
          </div>
          {activeCourseNow || activeEventNow ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-bold text-primary">
              {activeCourseNow && (
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Sedang berlangsung kelas: {activeCourseNow.course_name}</span>
                </div>
              )}
              {activeCourseNow && activeEventNow && (
                <span className="hidden sm:inline text-on-surface-variant/40 font-medium">|</span>
              )}
              {activeEventNow && (
                <div className="flex items-center gap-1.5">
                  {!activeCourseNow && <Info className="w-4 h-4" />}
                  <span>Sedang berlangsung event: {activeEventNow.event_name}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-on-surface-variant font-medium">Tidak ada kelas atau event yang sedang berlangsung saat ini.</span>
          )}
        </div>
      )}

      {/* Timeline Jadwal Harian */}
      <div className="relative pt-2">
        <div className="space-y-6 relative pl-2">
          
          {timelineItems.length > 0 && (
            <div className="absolute left-[65px] lg:left-[75px] top-6 bottom-6 w-px bg-[#E2E8F0] dark:bg-slate-800 z-0"></div>
          )}

          {timelineItems.length === 0 ? (
            /* Fallback kosong */
            <EmptyState
              icons={[
                <Coffee className="w-5 h-5" />,
                <CalendarIcon className="w-5 h-5" />,
                <Smile className="w-5 h-5" />,
              ]}
              title="Tidak Ada Jadwal & Event"
              description={`Tidak ada mata kuliah atau event kampus yang terjadwal untuk hari ${getIndonesianDayName(selectedDayObj.fullName)}.`}
              action={{
                label: 'Kelola Mata Kuliah',
                icon: <BookOpen className="w-4 h-4" />,
                onClick: () => onTabChange?.('courses'),
              }}
              action2={{
                label: 'Event Kampus',
                icon: <CalendarIcon className="w-4 h-4" />,
                onClick: () => onTabChange?.('events'),
              }}
            />
          ) : (
            /* Render baris kelas & event gabungan */
            timelineItems.map((item) => {
              if (item.type === 'course') {
                const course = item.data;
                const status = getCourseStatus(course);
                const hasCheckedInSelectedDate = attendanceRecords.some(
                  r => r.course_id === course.id && r.date === selectedISODate && r.status === 'Hadir'
                );

                return (
                  <CourseTimelineCard
                    key={item.id}
                    course={course}
                    status={status}
                    selectedISODate={selectedISODate}
                    tasks={tasks}
                    onToggleTaskState={onToggleTaskState}
                    hasCheckedInSelectedDate={hasCheckedInSelectedDate}
                    onTabChange={onTabChange}
                    onDeleteReschedule={onDeleteReschedule}
                    onOpenRescheduleModal={(c) => {
                      setSelectedCourseForReschedule(c);
                      setIsRescheduleModalOpen(true);
                    }}
                    isInProgressDayToday={selectedISODate === formatDateYYYYMMDD(currentTime)}
                  />
                );
              } else {
                const event = item.data;
                return (
                  <EventTimelineCard
                    key={item.id}
                    event={event}
                    selectedISODate={selectedISODate}
                    currentTime={currentTime}
                  />
                );
              }
            })
          )}
        </div>

        {/* Timeline kelas yang dipindahkan OUT dari hari ini */}
        {rescheduledOutCourses.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#F1F5F9] dark:border-slate-800 space-y-4 text-left">
            <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5 pl-2">
              <Undo2 className="w-4 h-4 text-primary" />
              <span>Kelas yang Dipindahkan dari Hari Ini</span>
            </h3>
            <div className="space-y-3 pl-2">
              {rescheduledOutCourses.map((c) => {
                const override = rescheduledSessions.find(
                  (s) => s.course_id === c.id && s.original_date === selectedISODate
                );
                const newDateFormatted = override?.new_date
                  ? new Date(override.new_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
                  : '';
                return (
                  <div
                    key={c.id}
                    style={{ '--glow-color': hexToRgb(c.color_hex) } as React.CSSProperties}
                    className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 rounded-2xl p-5 relative transition-all duration-300 shadow-[0_8px_30px_rgba(var(--glow-color),0.04)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-[11px] font-black px-3 py-1 rounded-lg text-white tracking-wider uppercase border border-white/10"
                          style={{
                            backgroundColor: c.color_hex,
                            boxShadow: `0 4px 12px rgba(var(--glow-color), 0.25)`
                          }}
                        >
                          {c.course_code}
                        </span>
                        <h4 className="font-bold text-sm text-on-surface">{c.course_name}</h4>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">
                        Dipindahkan ke: <strong className="text-primary">{newDateFormatted} ({override?.new_start_time} - {override?.new_end_time} WIB)</strong>
                      </p>
                      {override?.note && (
                        <p className="text-[10px] text-on-surface-variant/80 italic mt-1 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                          Alasan: "{override.note}"
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteReschedule(c.id, selectedISODate)}
                      className="px-3 py-1.5 text-primary hover:bg-primary/5 rounded-xl border border-primary/20 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 flex-shrink-0 bg-transparent"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Pulihkan Sesi Normal</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Reschedule */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        course={selectedCourseForReschedule}
        selectedISODate={selectedISODate}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedCourseForReschedule(null);
        }}
        onSubmit={handleSubmitReschedule}
      />
    </div>
  );
}
