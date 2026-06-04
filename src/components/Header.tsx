import { Bell, Search, Settings, Menu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
}

export default function Header({
  user,
  onMenuToggle,
  searchQuery,
  onSearchChange,
  activeTab
}: HeaderProps) {
  
  // Dynamic placeholder dependent on active folder
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'tasks':
        return 'Cari tugas akademik...';
      case 'courses':
        return 'Cari mata kuliah terdaftar...';
      case 'notes':
        return 'Cari catatan & perkuliahan...';
      case 'calendar':
        return 'Cari jadwal kegiatan...';
      default:
        return 'Cari tugas, catatan, atau mata kuliah...';
    }
  };

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-white/85 backdrop-blur-md sticky top-0 z-40 border-b border-[#E2E8F0] w-full">
      {/* Search Input & Menu Toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Buka sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-primary transition-colors" />
          <input
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full py-1.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type="text"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Trailing Controls & Profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Tidak ada notifikasi baru untuk semester ini')}
          className="text-on-surface-variant hover:bg-[#F1F5F9] rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all flex items-center justify-center relative cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>

        <button
          onClick={() => alert('Pengaturan Planly: Semester 6 aktif')}
          className="text-on-surface-variant hover:bg-[#F1F5F9] rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all flex items-center justify-center cursor-pointer"
          aria-label="Pengaturan"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-[#E2E8F0] mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 pl-1">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <img
              src={user.profile_photo_url || ''}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xs font-semibold text-on-surface hidden md:block">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
