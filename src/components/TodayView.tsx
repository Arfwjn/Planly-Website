import { useState, useEffect } from 'react';
import { Clock, Play, Pause, AlertTriangle, ExternalLink, MessageSquare, MapPin, Users, Notebook, ChevronRight } from 'lucide-react';
import { Course, Task, SidebarTab } from '../types';

interface TodayViewProps {
  user: { name: string };
  courses: Course[];
  tasks: Task[];
  onTabChange: (tab: SidebarTab) => void;
  onOpenNotesWithCourse: (courseId: number) => void;
}

export default function TodayView({
  user,
  courses,
  tasks,
  onTabChange,
  onOpenNotesWithCourse
}: TodayViewProps) {
  const [timeLeft, setTimeLeft] = useState(2700); // 45:00 in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Focus Timer Tick Loop
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayDateString = () => {
    const d = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  };

  const getTodayDayOfWeek = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const todayDay = getTodayDayOfWeek(); // e.g. "Wednesday"

  // Filter courses that happen today
  const todayCourses = courses
    .filter((c) => c.day_of_week === todayDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const hasCoursesToday = todayCourses.length > 0;

  // Let's filter tasks to check counts
  const pendingTasks = tasks.filter((t) => !t.is_finished);
  const highPriorityCount = pendingTasks.filter((t) => t.is_priority).length;
  
  // First pending task for current focus
  const focusTask = pendingTasks[0];
  
  const completedCount = tasks.filter(t => t.is_finished).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getCourseStatus = (course: Course) => {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    
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

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-1">
          Today's Schedule
        </h1>
        <p className="text-sm text-on-surface-variant font-medium">
          {getTodayDateString()}
        </p>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pending Tasks Bento Box */}
        <div
          onClick={() => onTabChange('tasks')}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-[48px] font-bold tracking-tight text-on-surface leading-none mb-2 group-hover:text-primary transition-colors">
              {pendingTasks.length}
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              {highPriorityCount} High Priority
            </p>
          </div>
        </div>

        {/* Current Focus Bento Box */}
        <div className="bg-primary text-white border border-primary/25 rounded-2xl p-6 shadow-md md:col-span-2 relative overflow-hidden group">
          {/* Decorative Background Accent */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                Current Focus
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors"
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{formatTimer(timeLeft)}</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2 truncate">
                {focusTask ? focusTask.task_title : 'No pending tasks!'}
              </h3>
              <p className="text-xs text-white/85 mb-3 line-clamp-2 min-h-8">
                {focusTask ? (focusTask.description || 'No additional details.') : 'All your assignments for the semester are completed.'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full relative transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  >
                  </div>
                </div>
                <span className="text-xs font-bold">{progressPercentage}% Tasks Completed</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Timeline Area */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-[#E2E8F0] pb-4">
          <h3 className="text-lg font-bold text-on-surface">Daily Schedule</h3>
          <span className="text-xs text-on-surface-variant font-medium bg-[#F1F5F9] px-3 py-1 rounded-full">
            {todayDay} View
          </span>
        </div>

        {/* Interactive Schedule List */}
        <div className="relative pl-4 md:pl-8">
          {/* Vertical timeline connector */}
          <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-px bg-[#E2E8F0]"></div>

          {!hasCoursesToday ? (
            <div className="text-center py-12 bg-white border border-dashed border-[#C7C4D8] rounded-xl flex flex-col items-center justify-center">
              <Clock className="w-12 h-12 text-[#94A3B8] mb-3 opacity-60 animate-pulse" />
              <h3 className="text-sm font-semibold text-on-surface">No classes for today</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Enjoy your free day or work on your pending tasks.
              </p>
            </div>
          ) : (
            todayCourses.map((course) => {
              const status = getCourseStatus(course);
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in-progress';

              return (
                <div key={course.id} className={`relative flex gap-6 md:gap-8 mb-8 transition-opacity duration-300 ${isCompleted ? 'opacity-50' : ''}`}>
                  <div className="w-16 flex-shrink-0 text-right pt-4">
                    <span className={`text-sm font-bold block ${isInProgress ? 'text-primary' : 'text-on-surface'}`}>{course.start_time}</span>
                    <span className="text-[10px] font-semibold text-on-surface-variant block">
                      {parseInt(course.start_time) >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                  
                  {/* Dot Indicator */}
                  <div className={`absolute top-5 rounded-full bg-white border-2 z-10 ${
                    isInProgress 
                      ? 'w-[15px] h-[15px] left-[20px] md:left-[36px] bg-primary border-white ring-4 ring-primary/20 animate-pulse' 
                      : isCompleted 
                        ? 'w-[9px] h-[9px] left-[23px] md:left-[39px] border-[#94A3B8]' 
                        : 'w-[9px] h-[9px] left-[23px] md:left-[39px] border-primary'
                  }`}></div>
                  
                  <div className={`flex-1 bg-white border rounded-xl p-4 md:p-5 hover:border-primary transition-all shadow-sm ${
                    isInProgress ? 'border-primary/45 bg-primary/[0.02] ring-1 ring-primary/5' : 'border-[#E2E8F0]'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                          style={{ backgroundColor: course.color_hex }}
                        >
                          {course.course_code}
                        </span>
                        <h4 className={`text-base font-bold text-on-surface inline ${isCompleted ? 'line-through text-on-surface-variant/80' : ''}`}>
                          {course.course_name}
                        </h4>
                      </div>
                      
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-xs font-bold shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          In Progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-on-surface-variant rounded-full text-xs font-bold border border-slate-200">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant mt-2 pt-2 border-t border-slate-50 font-medium">
                      <p className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" /> {course.room}
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#94A3B8]" /> {course.lecturer_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-3 mt-3 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => onOpenNotesWithCourse(course.id)}
                        className="text-primary font-bold hover:underline flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                      >
                        <Notebook className="w-3.5 h-3.5" /> Open Notes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
