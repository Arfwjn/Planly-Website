import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Flame, LayoutDashboard } from 'lucide-react';
import { Course, Task, SidebarTab, CampusEvent, RescheduledSession } from '../../types';
import NotificationBanner from '../ui/NotificationBanner';
import Skeleton from '../ui/Skeleton';
import { getCoursesForDate } from '../../utils/reschedule';

// Import sub-komponen modular
import TodayStatsRow from './TodayStatsRow';
import TodayFocusPanel from './TodayFocusPanel';
import TodayScheduleTimeline from './TodayScheduleTimeline';
import TodayEventsPanel from './TodayEventsPanel';

interface TodayViewProps {
  user: { name: string };
  courses: Course[];
  tasks: Task[];
  onToggleTaskState: (taskId: number) => void;
  onTabChange: (tab: SidebarTab) => void;
  onOpenNotesWithCourse: (courseId: number | null) => void;
  focusTimeLeft: number;
  isFocusTimerRunning: boolean;
  setIsFocusTimerRunning: (running: boolean) => void;
  onResetFocusTimer: () => void;
  loading?: boolean;
  events?: CampusEvent[];
  rescheduledSessions: RescheduledSession[];
  pomodoroStage: 'work' | 'short-break' | 'long-break';
  pomodoroTaskId: number | null;
  completedPomodoroCount: number;
}

/**
 * Komponen TodayView (Orchestrator)
 * 
 * Dasbor harian mahasiswa yang merakit sub-komponen statistik harian,
 * panel fokus Pomodoro, timeline kuliah hari ini, dan daftar event harian.
 */
export default function TodayView({
  user,
  courses,
  tasks,
  onToggleTaskState,
  onTabChange,
  onOpenNotesWithCourse,
  focusTimeLeft,
  isFocusTimerRunning,
  setIsFocusTimerRunning,
  onResetFocusTimer,
  loading = false,
  events = [],
  rescheduledSessions,
  pomodoroStage,
  pomodoroTaskId,
  completedPomodoroCount
}: TodayViewProps) {
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer internal untuk ticker waktu berjalan (untuk mengecek keaktifan kelas)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const getTodayDateString = () => {
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const getTodayDayOfWeek = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const todayISODate = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  // Filter & proses override reschedule untuk hari ini
  const { dayCoursesProcessed } = getCoursesForDate(
    todayISODate,
    courses,
    rescheduledSessions
  );

  const getCourseStatus = (course: Course): 'in-progress' | 'completed' | 'upcoming' => {
    const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    
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

  // Metrik Tugas Aktif
  const pendingTasks = tasks.filter(t => !t.is_finished);
  const highPriorityCount = pendingTasks.filter(t => t.is_priority).length;
  
  const activeFocusTask = pomodoroTaskId 
    ? tasks.find(t => t.id === pomodoroTaskId) 
    : pendingTasks[0];
  
  const completedCount = tasks.filter(t => t.is_finished).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Metrik Kuliah Hari Ini
  const completedCoursesCount = dayCoursesProcessed.filter(c => getCourseStatus(c) === 'completed').length;
  const upcomingCoursesCount = dayCoursesProcessed.length - completedCoursesCount;

  // Tampilkan loading skeleton
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8 rounded-lg" />
          <Skeleton className="w-32 h-4 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 h-[160px] flex flex-col justify-between">
              <Skeleton className="w-28 h-4 rounded-md" />
              <Skeleton className="w-12 h-10 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6">
          <Skeleton className="w-32 h-6 rounded-md" />
          <div className="space-y-6 relative pl-4">
            <Skeleton className="w-full h-[110px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      {/* Header Halaman */}
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-1 flex items-center gap-2.5">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <span>Jadwal Hari Ini</span>
        </h1>
        <p className="text-sm text-on-surface-variant font-medium">
          {getTodayDateString()}
        </p>
      </div>

      {/* Banner Notifikasi Browser */}
      <NotificationBanner />

      {/* Baris Metrik Summaries */}
      <TodayStatsRow
        pendingTasksCount={pendingTasks.length}
        highPriorityCount={highPriorityCount}
        todayCoursesCount={dayCoursesProcessed.length}
        completedCoursesCount={completedCoursesCount}
        upcomingCoursesCount={upcomingCoursesCount}
        completedPomodoroCount={completedPomodoroCount}
        onTabChange={onTabChange}
      />

      {/* Baris Detail Fokus & Progres Tugas */}
      <TodayFocusPanel
        focusTimeLeft={focusTimeLeft}
        isFocusTimerRunning={isFocusTimerRunning}
        setIsFocusTimerRunning={setIsFocusTimerRunning}
        pomodoroStage={pomodoroStage}
        activeFocusTask={activeFocusTask}
        completedCount={completedCount}
        totalTasksCount={tasks.length}
        progressPercentage={progressPercentage}
        onTabChange={onTabChange}
      />

      {/* Timeline Kuliah Hari Ini */}
      <TodayScheduleTimeline
        todayCourses={dayCoursesProcessed}
        todayDayName={getTodayDayOfWeek()}
        tasks={tasks}
        onToggleTaskState={onToggleTaskState}
        onOpenNotesWithCourse={onOpenNotesWithCourse}
        currentTime={currentTime}
      />

      {/* Panel Event Hari Ini */}
      <TodayEventsPanel
        events={events}
        onTabChange={onTabChange}
      />
    </div>
  );
}
