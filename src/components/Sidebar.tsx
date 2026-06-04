import { BookOpen, CalendarDays, CheckSquare, FileText, LayoutDashboard, User as UserIcon, Plus, GraduationCap } from 'lucide-react';
import { SidebarTab } from '../types';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onNewTaskClick: () => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onNewTaskClick,
  onSignOut,
  isOpen,
  onClose
}: SidebarProps) {
  const menuItems = [
    { id: 'today' as SidebarTab, label: 'Today', icon: LayoutDashboard },
    { id: 'calendar' as SidebarTab, label: 'Calendar', icon: CalendarDays },
    { id: 'tasks' as SidebarTab, label: 'Tasks', icon: CheckSquare },
    { id: 'courses' as SidebarTab, label: 'Courses', icon: BookOpen },
    { id: 'notes' as SidebarTab, label: 'Notes', icon: FileText },
    { id: 'profile' as SidebarTab, label: 'Profile', icon: UserIcon },
  ];

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
              Academic Workspace
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

        {/* CTA Button */}
        <div className="px-4 mt-auto space-y-2">
          <button
            onClick={() => {
              onNewTaskClick();
              onClose();
            }}
            className="w-full bg-primary hover:bg-[#4F46E5] text-white py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
          
          <button
            onClick={onSignOut}
            className="w-full border border-dashed border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
