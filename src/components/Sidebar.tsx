import { BookOpen, CalendarDays, Calendar, CheckSquare, FileText, LayoutDashboard, User as UserIcon, GraduationCap, Pause, Play, RotateCcw, Timer, UserCheck, Sparkles, LogOut } from 'lucide-react';
import { SidebarTab } from '../types';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
  focusTimeLeft: number;
  isFocusTimerRunning: boolean;
  setIsFocusTimerRunning: (running: boolean) => void;
  onResetFocusTimer: () => void;
  lectureTime?: number;
  isLectureRunning?: boolean;
  theme: 'light' | 'dark';
  pomodoroStage?: 'work' | 'short-break' | 'long-break';
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onSignOut,
  isOpen,
  onClose,
  focusTimeLeft,
  isFocusTimerRunning,
  setIsFocusTimerRunning,
  onResetFocusTimer,
  lectureTime = 0,
  isLectureRunning = false,
  theme,
  pomodoroStage = 'work',
}: SidebarProps) {
  const menuItems = [
    { id: 'today' as SidebarTab, label: 'Hari Ini', icon: LayoutDashboard },
    { id: 'calendar' as SidebarTab, label: 'Jadwal', icon: CalendarDays },
    { id: 'attendance' as SidebarTab, label: 'Absensi', icon: UserCheck },
    { id: 'events' as SidebarTab, label: 'Event Kampus', icon: Calendar },
    { id: 'tasks' as SidebarTab, label: 'Tugas', icon: CheckSquare },
    { id: 'courses' as SidebarTab, label: 'Mata Kuliah', icon: BookOpen },
    { id: 'notes' as SidebarTab, label: 'Catatan', icon: FileText },
    { id: 'workspace' as SidebarTab, label: 'Ruang Belajar', icon: Timer },
    { id: 'ai-companion' as SidebarTab, label: 'Asisten AI', icon: Sparkles },
    { id: 'profile' as SidebarTab, label: 'Profil', icon: UserIcon },
  ];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = pomodoroStage === 'work' ? 1500 : pomodoroStage === 'short-break' ? 300 : 900;
  const progressPercent = isLectureRunning ? 100 : Math.max(0, Math.min(100, (focusTimeLeft / totalDuration) * 100));
  const strokeCircumference = 2 * Math.PI * 13;
  const strokeDashoffset = strokeCircumference - (progressPercent / 100) * strokeCircumference;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-white border-r border-[#E2E8F0] shadow-sm flex flex-col py-6 z-50 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">Planly</h1>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Ruang Kerja Akademik</p>
          </div>
        </div>

        {/* Menu Navigasi Samping */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  // Manipulasi URL browser secara real-time tanpa reload page
                  const urlPath = item.id === 'today' ? '/' : `/${item.id}`;
                  window.history.pushState({}, '', urlPath);

                  onTabChange(item.id);
                  onClose();
                }}
                className={`group relative w-full flex items-center gap-3 pl-5 pr-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer select-none origin-left hover:scale-[1.01] active:scale-[0.97] no-animate ${
                  isActive
                    ? theme === 'light'
                      ? 'text-primary bg-[#F5F2FF] shadow-[0_2px_8px_rgba(53,37,205,0.06)]'
                      : 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/10 shadow-[0_2px_12px_rgba(99,102,241,0.1)]'
                    : theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full transition-all duration-300 origin-left ${
                    isActive ? (theme === 'light' ? 'bg-primary scale-y-100 opacity-100' : 'bg-indigo-400 scale-y-100 opacity-100') : 'scale-y-0 opacity-0'
                  }`}
                />

                <IconComponent className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : 'opacity-70 group-hover:opacity-100'}`} />
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
                {item.id === 'ai-companion' && (
                  <span className="ml-auto px-1.5 py-0.5 text-[8px] font-extrabold bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 rounded-md uppercase tracking-wider">
                    Demo
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Widget Timer Fokus */}
        <div className="px-4 mt-auto space-y-3">
          <div className="group/timer relative flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isLectureRunning) {
                  onTabChange('workspace');
                } else {
                  setIsFocusTimerRunning(!isFocusTimerRunning);
                }
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center relative cursor-pointer group/circle transition-all duration-200 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 shadow-2xs hover:shadow-xs active:scale-95 border border-slate-100 dark:border-slate-800/80 flex-shrink-0 no-animate"
            >
              <svg className="w-8 h-8 absolute inset-0 m-auto" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="13" className="stroke-slate-200/60 dark:stroke-slate-800/80 fill-none" strokeWidth="2.5" />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  className={`fill-none stroke-linecap-round transform -rotate-90 origin-center transition-all duration-300 ${
                    isLectureRunning ? 'stroke-emerald-500 dark:stroke-emerald-400 animate-pulse' : pomodoroStage === 'work' ? 'stroke-primary dark:stroke-indigo-400' : 'stroke-amber-500 dark:stroke-amber-400'
                  }`}
                  strokeWidth="2.5"
                  strokeDasharray={strokeCircumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                {isLectureRunning ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                ) : (
                  <>
                    <div className="transition-all duration-200 opacity-100 group-hover/circle:opacity-0 flex items-center justify-center">
                      {isFocusTimerRunning ? (
                        <Pause className={`w-2.5 h-2.5 ${pomodoroStage === 'work' ? 'text-primary dark:text-indigo-400' : 'text-amber-500 dark:text-amber-400'} fill-current`} />
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${pomodoroStage === 'work' ? 'bg-primary dark:bg-indigo-400' : 'bg-amber-500'}`} />
                      )}
                    </div>
                    <div className="absolute transition-all duration-200 opacity-0 group-hover/circle:opacity-100 flex items-center justify-center text-on-surface">
                      {isFocusTimerRunning ? <Pause className="w-2.5 h-2.5 text-slate-600 dark:text-slate-300 fill-current" /> : <Play className="w-2.5 h-2.5 text-slate-600 dark:text-slate-300 fill-current ml-0.5" />}
                    </div>
                  </>
                )}
              </div>
            </button>

            <div onClick={() => onTabChange('workspace')} className="flex-1 min-w-0 cursor-pointer text-left pl-1 group/text select-none">
              <div className="font-mono text-sm font-extrabold tracking-tight text-on-surface group-hover/text:text-primary dark:group-hover/text:text-indigo-400 transition-colors">
                {isLectureRunning ? formatTimer(lectureTime) : formatTimer(focusTimeLeft)}
              </div>
              <div className="text-[8px] font-extrabold text-on-surface-variant uppercase tracking-widest mt-0.5">{isLectureRunning ? 'Kuliah Aktif' : pomodoroStage === 'work' ? 'Sesi Fokus' : 'Istirahat'}</div>
            </div>

            <div className="flex-shrink-0 pr-1">
              {isLectureRunning ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabChange('workspace');
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-emerald-500 dark:hover:text-emerald-400 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer no-animate"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetFocusTimer();
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-red-500 dark:hover:text-red-400 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer group/reset no-animate"
                >
                  <RotateCcw className="w-3.5 h-3.5 transition-transform duration-300 group-hover/reset:rotate-180" />
                </button>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 border border-red-200/80 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-650 dark:hover:text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs hover:shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
