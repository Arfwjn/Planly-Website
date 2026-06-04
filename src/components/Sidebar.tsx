import { BookOpen, CalendarDays, CheckSquare, FileText, LayoutDashboard, User as UserIcon, GraduationCap, Play, Pause, RotateCcw } from 'lucide-react';
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
  onResetFocusTimer
}: SidebarProps) {
  const menuItems = [
    { id: 'today' as SidebarTab, label: 'Hari Ini', icon: LayoutDashboard },
    { id: 'calendar' as SidebarTab, label: 'Jadwal', icon: CalendarDays },
    { id: 'tasks' as SidebarTab, label: 'Tugas', icon: CheckSquare },
    { id: 'courses' as SidebarTab, label: 'Mata Kuliah', icon: BookOpen },
    { id: 'notes' as SidebarTab, label: 'Catatan', icon: FileText },
    { id: 'profile' as SidebarTab, label: 'Profil', icon: UserIcon },
  ];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 w-[260px] bg-white border-r border-[#E2E8F0] shadow-sm flex flex-col py-6 z-50 transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">Planly</h1>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Ruang Kerja Akademik
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-primary font-bold border-l-2 border-primary bg-[#F5F2FF]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-[#F1F5F9]'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Focus Timer Widget in Sidebar */}
        <div className="px-4 mt-auto space-y-3">
          <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xs">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Sesi Fokus (Pomodoro)
            </span>
            <div className={`text-2xl font-extrabold tracking-tight transition-colors ${
              isFocusTimerRunning ? 'text-primary' : 'text-on-surface'
            }`}>
              {formatTimer(focusTimeLeft)}
            </div>
            
            <div className="flex gap-2 w-full mt-1">
              <button
                onClick={() => setIsFocusTimerRunning(!isFocusTimerRunning)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  isFocusTimerRunning 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-primary hover:bg-[#4F46E5] text-white'
                }`}
              >
                {isFocusTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isFocusTimerRunning ? 'Jeda' : 'Mulai'}</span>
              </button>
              <button
                onClick={onResetFocusTimer}
                className="px-2.5 py-1.5 border border-[#E2E8F0] hover:bg-slate-100 text-on-surface-variant text-[10px] font-bold rounded-lg cursor-pointer transition-colors bg-white flex items-center justify-center"
                aria-label="Atur Ulang Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <button
            onClick={onSignOut}
            className="w-full border border-dashed border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
