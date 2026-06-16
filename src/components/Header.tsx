// =============================================================================
// Planly — Header Component (Navigasi Atas & Pengaturan Cepat)
//
// Komponen ini berfungsi sebagai navbar atas yang nampilin tombol menu burger
// (khusus mobile), kolom pencarian dinamis, dropdown notifikasi real-time,
// tombol panel pengaturan cepat (semester/tema), dan jalan pintas ke profil user.
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Settings, Menu, Clock, Calendar, CheckSquare, Check, HelpCircle } from 'lucide-react';
import { User, Task, Course, SidebarTab } from '../types';
import { useToast } from './ui/Toast';


interface HeaderProps {
  user: User;
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  
  // Properti tambahan baru
  tasks: Task[];
  courses: Course[];
  onTabChange: (tab: SidebarTab) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onUserUpdate: (payload: Partial<User>) => void;
}

export default function Header({
  user,
  onMenuToggle,
  searchQuery,
  onSearchChange,
  activeTab,
  tasks,
  courses,
  onTabChange,
  theme,
  onThemeChange,
  onUserUpdate
}: HeaderProps) {
  const toast = useToast();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // Toggle popup notifikasi
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Toggle popup setting cepat
  const [hasBadge, setHasBadge] = useState(false); // Menandai ada notifikasi baru yang belum dibaca
  const [isScrolled, setIsScrolled] = useState(false); // Efek bayangan (shadow) pas halaman di-scroll down

  // Efek buat mendeteksi scroll halaman biar header dapet efek shadow tipis pas user nge-scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Fungsi buat nentuin tulisan placeholder di input pencarian sesuai dengan tab aktif saat ini
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
      case 'events':
        return 'Cari kegiatan & event kampus...';
      default:
        return 'Cari tugas, catatan, atau mata kuliah...';
    }
  };

  // Fungsi buat nge-generate notifikasi dinamis berdasarkan deadline tugas terdekat & jadwal kuliah hari ini
  const getDynamicNotifications = () => {
    const list: { id: string; type: 'task' | 'course'; title: string; desc: string; targetTab: SidebarTab }[] = [];
    const now = new Date();
    
    // 1. Deteksi tugas kuliah yang belum selesai dan sisa waktunya kurang dari 24 jam (mepet banget!)
    tasks
      .filter(t => !t.is_finished)
      .forEach(t => {
        const parts = t.deadline.split(' ');
        const dateStr = parts[0];
        const timeStr = parts[1]?.slice(0, 5) || '23:59';
        const deadlineDate = new Date(`${dateStr}T${timeStr}`);
        const diffMs = deadlineDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        if (diffHours > 0 && diffHours <= 24) {
          list.push({
            id: `task-${t.id}`,
            type: 'task',
            title: `Tenggat Dekat: ${t.task_title}`,
            desc: `Tersisa waktu ${Math.floor(diffHours)} jam lagi untuk menyelesaikan tugas ini!`,
            targetTab: 'tasks'
          });
        }
      });
      
    // 2. Deteksi kelas kuliah rutin yang terjadwal di hari ini
    const weekdaysEng = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayEng = weekdaysEng[now.getDay()];
    courses
      .filter(c => c.day_of_week === todayDayEng)
      .forEach(c => {
        list.push({
          id: `course-${c.id}`,
          type: 'course',
          title: `Kuliah Hari Ini: ${c.course_name}`,
          desc: `Jadwal pukul ${c.start_time} - ${c.end_time} di Ruang ${c.room}`,
          targetTab: 'calendar'
        });
      });
      
    return list;
  };

  const notifications = getDynamicNotifications();

  // Ngatur lencana merah (badge) notifikasi di atas tombol lonceng
  useEffect(() => {
    if (notifications.length > 0) {
      // Kalo user udah pernah ngeklik 'Tandai dibaca' di sesi ini, badge-nya gak usah nongol lagi
      const isCleared = sessionStorage.getItem('planly_badge_cleared') === 'true';
      if (!isCleared) {
        setHasBadge(true);
      }
    } else {
      setHasBadge(false);
    }
  }, [tasks, courses]);

  // Efek buat nutup menu popover dropdown secara otomatis pas user ngeklik di luar area dropdown tersebut (click outside)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = () => {
    setHasBadge(false);
    sessionStorage.setItem('planly_badge_cleared', 'true');
  };

  // Menentukan fitur pencarian di header didukung atau nggak buat halaman yang lagi aktif
  const isSearchSupported = activeTab === 'tasks' || activeTab === 'courses' || activeTab === 'notes' || activeTab === 'events';

  return (
    <header className={`flex justify-between items-center h-16 px-4 sm:px-6 bg-header-bg backdrop-blur-md sticky top-0 z-40 border-b w-full transition-all duration-300 ${
      isScrolled 
        ? 'border-header-border shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]' 
        : 'border-transparent'
    }`}>
      {/* Kolom Pencarian & Menu burger untuk perangkat mobile */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-slate-100 dark:hover:bg-input-bg lg:hidden cursor-pointer"
          aria-label="Buka sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isSearchSupported && (
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
        )}
      </div>

      {/* Kontrol Utama & Foto Profil */}
      <div className="flex items-center gap-2">
        
        {/* Kontrol Notifikasi (Lonceng) */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsSettingsOpen(false);
            }}
            className="text-on-surface-variant hover:bg-[#F1F5F9] dark:hover:bg-input-bg rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all flex items-center justify-center relative cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {hasBadge && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
            )}
            {hasBadge && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Popover Dropdown Notifikasi */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-card-bg border border-card-border rounded-2xl shadow-xl z-50 overflow-hidden py-1.5">
              <div className="flex items-center justify-between px-4 py-2 border-b border-card-border">
                <span className="text-xs font-bold text-on-surface">Notifikasi Akademik</span>
                {hasBadge && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    Tandai dibaca
                  </button>
                )}
              </div>
              
              <div className="max-h-[300px] overflow-y-auto divide-y divide-card-border">
                {notifications.length > 0 ? (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.targetTab);
                        setIsNotificationOpen(false);
                      }}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-input-bg transition-colors cursor-pointer flex gap-3 text-left"
                    >
                      <div className="mt-0.5 text-primary flex-shrink-0">
                        {item.type === 'task' ? <CheckSquare className="w-4 h-4 text-red-500" /> : <Calendar className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-on-surface leading-tight">{item.title}</div>
                        <div className="text-[10px] text-on-surface-variant leading-relaxed font-semibold">{item.desc}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center space-y-1.5">
                    <Clock className="w-6 h-6 text-on-surface-variant mx-auto opacity-45" />
                    <p className="text-xs font-semibold text-on-surface-variant">Tidak ada notifikasi mendesak</p>
                    <p className="text-[10px] text-[#94A3B8] font-medium">Jadwal kuliah hari ini dan tenggat tugas akan muncul di sini.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Kontrol Pengaturan Cepat (Roda Gigi) */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsNotificationOpen(false);
            }}
            className="text-on-surface-variant hover:bg-[#F1F5F9] dark:hover:bg-input-bg rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all flex items-center justify-center cursor-pointer"
            aria-label="Pengaturan Cepat"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Popover Dropdown Pengaturan */}
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-card-bg border border-card-border rounded-2xl shadow-xl z-50 py-4 px-4 space-y-4">
              <h3 className="text-xs font-bold text-on-surface border-b border-card-border pb-1.5">
                Pengaturan Cepat
              </h3>
              
              {/* Pengubah Semester Aktif */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Ubah Semester Aktif:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <button
                      key={sem}
                      onClick={() => {
                        onUserUpdate({ semester: sem });
                        toast.success(`Semester aktif berhasil diubah menjadi Semester ${sem}`);
                      }}
                      className={`h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        user.semester === sem
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface-variant'
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Tema Cepat */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Tampilan Aplikasi:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`flex-1 py-1 px-2 border rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-card-border hover:bg-slate-50 dark:hover:bg-input-bg text-on-surface-variant'
                    }`}
                  >
                    Terang
                  </button>
                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`flex-1 py-1 px-2 border rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-card-border hover:bg-slate-50 dark:hover:bg-input-bg text-on-surface-variant'
                    }`}
                  >
                    Gelap
                  </button>
                </div>
              </div>

              {/* Status Sistem */}
              <div className="border-t border-card-border pt-3 space-y-1 text-left">
                <div className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Planly v1.0
                </div>                
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#E2E8F0] dark:bg-card-border mx-2 hidden sm:block"></div>

        {/* Profil Akun Ringkas */}
        <div
          onClick={() => onTabChange('profile')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] dark:border-card-border group-hover:ring-2 group-hover:ring-primary transition-all">
            <img
              src={user.profile_photo_url || ''}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xs font-semibold text-on-surface hidden md:block group-hover:text-primary transition-colors">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
