import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, MapPin, Bell, Palette, LogOut, ArrowRight, Save, X, Camera, TrendingUp, Download, Upload, CheckSquare, Clock, Calendar, Link, Globe, RefreshCw, Check } from 'lucide-react';
import { User, Course, Task, RescheduledSession, CampusEvent, CalendarSyncConfig } from '../types';
import { useToast } from './ui/Toast';
import { calendarSyncService } from '../services/calendarSync';
import { generateICalendarData, downloadICSFile } from '../utils/ical';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  courses: Course[];
  tasks: Task[];
  notesCount: number;
  rescheduledSessions: RescheduledSession[];
  events: CampusEvent[];
}

/**
 * Komponen ProfileView
 * 
 * Komponen ini digunakan untuk menampilkan profil pengguna (mahasiswa), mengelola formulir akun,
 * menyalakan/menonaktifkan notifikasi, memilih tema tampilan, serta melakukan konfirmasi log out (keluar).
 */
export default function ProfileView({
  user,
  onUserUpdate,
  onSignOut,
  theme,
  onThemeChange,
  courses,
  tasks,
  notesCount,
  rescheduledSessions,
  events
}: ProfileViewProps) {
  const toast = useToast();

  const coursesCount = courses.length;
  const tasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.is_finished).length;

  const indonesianDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  // State untuk melacak apakah formulir pengeditan profil sedang aktif
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  // State untuk menyimpan nilai input formulir pengeditan akun (nama, NIM, program studi)
  const [editName, setEditName] = useState(user.name);
  const [editNim, setEditNim] = useState(user.nim || '');
  const [editMajor, setEditMajor] = useState(user.major || '');
  const [editSemester, setEditSemester] = useState(user.semester ? String(user.semester) : '');
  const [editGpaCurrent, setEditGpaCurrent] = useState(user.gpa_current ? String(user.gpa_current) : '');
  const [editGpaTarget, setEditGpaTarget] = useState(user.gpa_target ? String(user.gpa_target) : '');
  const [editTargetStudyHours, setEditTargetStudyHours] = useState(user.target_study_hours ? String(user.target_study_hours) : '');
  const [editAddress, setEditAddress] = useState(user.address || '');

  // Referensi untuk input file tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk melacak status saklar notifikasi pengingat & email rangkuman harian (notifications toggles)
  const [reminders, setReminders] = useState(() => {
    return localStorage.getItem('planly_notifications_enabled') !== 'false';
  });
  const [dailyDigest, setDailyDigest] = useState(() => {
    return localStorage.getItem('planly_daily_digest_enabled') === 'true';
  });
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleToggleReminders = () => {
    const nextVal = !reminders;
    if (nextVal) {
      if (!('Notification' in window)) {
        toast.error('Peramban Anda tidak mendukung notifikasi sistem.');
        return;
      }
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setReminders(true);
          localStorage.setItem('planly_notifications_enabled', 'true');
          toast.success('Pengingat tugas & jadwal aktif!');
          new Notification('Planly - Pengingat Aktif', {
            body: 'Notifikasi pengingat tenggat tugas & jadwal kuliah telah aktif.',
            icon: '/assets/logo.png'
          });
        } else {
          toast.error('Izin notifikasi diblokir browser. Harap aktifkan izin notifikasi pada pengaturan peramban Anda.');
        }
      });
    } else {
      setReminders(false);
      localStorage.setItem('planly_notifications_enabled', 'false');
      toast.info('Pengingat tugas & jadwal dinonaktifkan.');
    }
  };

  const handleToggleDailyDigest = () => {
    const nextVal = !dailyDigest;
    setDailyDigest(nextVal);
    localStorage.setItem('planly_daily_digest_enabled', String(nextVal));
    if (nextVal) {
      toast.success(`Rangkuman harian diaktifkan untuk email: ${user.email}`);
    } else {
      toast.info('Rangkuman harian dinonaktifkan.');
    }
  };

  // --- STATES FOR SUB-TABS & CALENDAR SYNC ---
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'sync' | 'system'>('account');
  const [syncConfig, setSyncConfig] = useState<CalendarSyncConfig>(() => calendarSyncService.getConfig());
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState<'google' | 'outlook' | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Sync back to local storage whenever config changes
  useEffect(() => {
    calendarSyncService.saveConfig(syncConfig);
  }, [syncConfig]);

  const handleConnectGoogle = () => {
    setShowOAuthModal('google');
  };

  const handleConnectOutlook = () => {
    setShowOAuthModal('outlook');
  };

  const handleConfirmOAuthConnect = async () => {
    setOauthLoading(true);
    try {
      if (showOAuthModal === 'google') {
        await calendarSyncService.connectGoogle();
        setSyncConfig(prev => ({
          ...prev,
          google_connected: true,
          last_sync_time: new Date().toLocaleString('id-ID')
        }));
        toast.success('Berhasil menghubungkan Planly dengan Google Calendar!');
      } else if (showOAuthModal === 'outlook') {
        await calendarSyncService.connectOutlook();
        setSyncConfig(prev => ({
          ...prev,
          outlook_connected: true,
          last_sync_time: new Date().toLocaleString('id-ID')
        }));
        toast.success('Berhasil menghubungkan Planly dengan Microsoft Outlook!');
      }
    } catch (err) {
      toast.error('Gagal menghubungkan kalender eksternal.');
    } finally {
      setOauthLoading(false);
      setShowOAuthModal(null);
    }
  };

  const handleDisconnectGoogle = () => {
    setSyncConfig(prev => ({
      ...prev,
      google_connected: false
    }));
    toast.info('Koneksi Google Calendar diputuskan.');
  };

  const handleDisconnectOutlook = () => {
    setSyncConfig(prev => ({
      ...prev,
      outlook_connected: false
    }));
    toast.info('Koneksi Microsoft Outlook diputuskan.');
  };

  const handleToggleSyncSetting = (key: keyof CalendarSyncConfig) => {
    setSyncConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Pengaturan sinkronisasi diperbarui.');
  };

  const handleForceMassSync = async () => {
    if (!syncConfig.google_connected && !syncConfig.outlook_connected) {
      toast.error('Harap hubungkan setidaknya satu kalender eksternal terlebih dahulu.');
      return;
    }
    setIsSyncingAll(true);
    const totalItems = courses.length + rescheduledSessions.length + tasks.length + events.length;
    try {
      const syncTime = await calendarSyncService.syncAllData(totalItems, toast);
      setSyncConfig(prev => ({
        ...prev,
        last_sync_time: syncTime
      }));
    } catch (err) {
      // Error ditangani di service
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleExportICS = () => {
    try {
      const icsData = generateICalendarData(courses, rescheduledSessions, tasks, events);
      downloadICSFile(icsData, `planly_calendar_${user.nim || 'academic'}.ics`);
      toast.success('Berkas iCalendar (.ics) berhasil dibuat dan diunduh.');
    } catch (err) {
      console.error("Gagal ekspor ICS:", err);
      toast.error('Gagal mengekspor data kalender.');
    }
  };

  const handleCopySubscriptionLink = () => {
    const dummySubLink = `https://planly.app/feeds/calendar/${user.nim || 'arfwjn'}.ics`;
    navigator.clipboard.writeText(dummySubLink).then(() => {
      toast.success('Link langganan kalender disalin! Gunakan link ini pada menu "Subscribe/Add Calendar from URL" di Google Calendar atau Outlook.');
    }).catch(err => {
      toast.error('Gagal menyalin link.');
    });
  };

  const handleStartEditing = () => {
    setEditName(user.name);
    setEditNim(user.nim || '');
    setEditMajor(user.major || '');
    setEditSemester(user.semester ? String(user.semester) : '');
    setEditGpaCurrent(user.gpa_current ? String(user.gpa_current) : '');
    setEditGpaTarget(user.gpa_target ? String(user.gpa_target) : '');
    setEditTargetStudyHours(user.target_study_hours ? String(user.target_study_hours) : '');
    setEditAddress(user.address || '');
    setIsEditingAccount(true);
  };

  // Menangani pengubahan foto profil ke format Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Batasi ukuran gambar maksimal 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal adalah 2MB!');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUserUpdate({
          ...user,
          profile_photo_url: base64String
        });
        toast.success('Foto profil berhasil diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Menangani pengiriman formulir akun. Fungsi ini memperbarui data profil pengguna
  // melalui callback onUserUpdate dan menonaktifkan mode edit setelah selesai.
  const handleAccountUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const semesterVal = editSemester ? Number(editSemester) : null;
    const gpaCurrentVal = editGpaCurrent ? Number(editGpaCurrent) : null;
    const gpaTargetVal = editGpaTarget ? Number(editGpaTarget) : null;
    const targetHoursVal = editTargetStudyHours ? Number(editTargetStudyHours) : null;

    if (gpaCurrentVal !== null && (gpaCurrentVal < 0 || gpaCurrentVal > 4.0)) {
      toast.error('IPK saat ini harus di antara 0.00 dan 4.00!');
      return;
    }

    if (gpaTargetVal !== null && (gpaTargetVal < 0 || gpaTargetVal > 4.0)) {
      toast.error('Target IPK harus di antara 0.00 dan 4.00!');
      return;
    }

    onUserUpdate({
      ...user,
      name: editName,
      nim: editNim || null,
      major: editMajor || null,
      semester: semesterVal,
      gpa_current: gpaCurrentVal,
      gpa_target: gpaTargetVal,
      target_study_hours: targetHoursVal,
      address: editAddress || null
    });
    setIsEditingAccount(false);
    toast.success('Informasi profil berhasil disimpan.');
  };

  // Ekspor semua data lokal dari localStorage
  const handleExportData = () => {
    const data = {
      planly_user: localStorage.getItem('planly_user'),
      planly_courses: localStorage.getItem('planly_courses'),
      planly_tasks: localStorage.getItem('planly_tasks'),
      planly_notes: localStorage.getItem('planly_notes'),
      planly_events: localStorage.getItem('planly_events'),
      planly_reschedules: localStorage.getItem('planly_reschedules'),
      export_version: '1.0',
      export_date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planly-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Cadangan data berhasil diekspor!');
  };

  // Impor cadangan data JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (!data.planly_user && !data.planly_courses && !data.planly_tasks && !data.planly_notes) {
          toast.error('Berkas cadangan tidak valid!');
          return;
        }

        if (data.planly_user) localStorage.setItem('planly_user', data.planly_user);
        if (data.planly_courses) localStorage.setItem('planly_courses', data.planly_courses);
        if (data.planly_tasks) localStorage.setItem('planly_tasks', data.planly_tasks);
        if (data.planly_notes) localStorage.setItem('planly_notes', data.planly_notes);
        if (data.planly_events) localStorage.setItem('planly_events', data.planly_events);
        if (data.planly_reschedules) localStorage.setItem('planly_reschedules', data.planly_reschedules);

        toast.success('Data berhasil diimpor! Halaman akan dimuat ulang...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        toast.error('Gagal membaca atau mem-parse file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
      {/* Input File Gambar Tersembunyi */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Compact Horizontal Profile Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0 group">
            <div className="absolute inset-0 rounded-full border-2 border-white dark:border-card-bg shadow-sm z-15"></div>
            {user.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="Avatar Pengguna"
                className="w-full h-full object-cover rounded-full z-10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#F5F2FF] dark:bg-input-bg rounded-full flex items-center justify-center text-primary z-10 border border-card-border">
                <UserIcon className="w-8 h-8" />
              </div>
            )}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-primary hover:bg-[#4F46E5] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer border border-white dark:border-card-bg"
              aria-label="Edit Foto Profil"
              title="Unggah Foto Profil Baru"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="text-left space-y-1">
            <h1 className="text-lg md:text-xl font-bold text-on-surface leading-tight">{user.name}</h1>
            <p className="text-[10px] text-[#94A3B8] font-bold tracking-wider uppercase leading-none">{user.email}</p>
            <p className="text-xs font-semibold text-on-surface-variant">
              {user.major || 'Belum diatur'} • NIM {user.nim || 'Belum diatur'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
            Mahasiswa Aktif
          </span>
          {user.semester && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#EC4899]/10 text-[#EC4899] font-bold text-[10px] uppercase tracking-wider">
              Semester {user.semester}
            </span>
          )}
        </div>
      </section>

      {/* Settings Tabbed Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Side: Navigation Tabs Sidebar */}
        <div className="w-full md:w-[220px] flex-shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pr-0 md:pr-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('account')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer w-auto md:w-full text-left ${
              activeSubTab === 'account'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-on-surface bg-transparent'
            }`}
          >
            <UserIcon className="w-4 h-4 flex-shrink-0" />
            <span>Akun & Akademik</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('sync')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer w-auto md:w-full text-left ${
              activeSubTab === 'sync'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-on-surface bg-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Kalender & Notifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('system')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer w-auto md:w-full text-left ${
              activeSubTab === 'system'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-on-surface bg-transparent'
            }`}
          >
            <Palette className="w-4 h-4 flex-shrink-0" />
            <span>Tampilan & Cadangan</span>
          </button>
        </div>

        {/* Right Side: Active Settings Panel Content */}
        <div className="flex-1 w-full space-y-6">
          
          {/* SUB-TAB 1: AKUN & AKADEMIK */}
          {activeSubTab === 'account' && (
            <div className="space-y-6">
              {/* Formulir Profil Akun */}
              <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-input-bg flex items-center justify-center text-primary">
                    <UserIcon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">Informasi Akun</h3>
                </div>

                {isEditingAccount ? (
                  <form onSubmit={handleAccountUpdateSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                          NIM
                        </label>
                        <input
                          type="text"
                          value={editNim}
                          onChange={(e) => setEditNim(e.target.value)}
                          className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                          Program Studi
                        </label>
                        <input
                          type="text"
                          value={editMajor}
                          onChange={(e) => setEditMajor(e.target.value)}
                          className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                          Semester Aktif
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={14}
                          value={editSemester}
                          onChange={(e) => setEditSemester(e.target.value)}
                          placeholder="e.g. 4"
                          className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                          Target Jam Belajar
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={editTargetStudyHours}
                          onChange={(e) => setEditTargetStudyHours(e.target.value)}
                          placeholder="Jam/Hari (e.g. 3)"
                          className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                          IPK Saat Ini
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.00"
                          max="4.00"
                          value={editGpaCurrent}
                          onChange={(e) => setEditGpaCurrent(e.target.value)}
                          placeholder="e.g. 3.75"
                          className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                          Target IPK
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.00"
                          max="4.00"
                          value={editGpaTarget}
                          onChange={(e) => setEditGpaTarget(e.target.value)}
                          placeholder="e.g. 3.85"
                          className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                        Alamat / Tempat Tinggal
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="e.g. Purwokerto, Jawa Tengah"
                        className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingAccount(false)}
                        className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors bg-white dark:bg-slate-900"
                      >
                        <X className="w-3.5 h-3.5" /> Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-xs leading-relaxed text-on-surface-variant mb-6 font-medium">
                      Kelola informasi profil, nomor induk mahasiswa, program studi, target akademik, dan jam belajar harian Anda di sini.
                    </p>
                    <button
                      onClick={handleStartEditing}
                      className="self-start text-primary font-bold text-xs flex items-center gap-1 hover:underline group cursor-pointer bg-transparent border-none p-0"
                    >
                      <span>Perbarui profil</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              {/* Statistik Akademik & Progres IPK */}
              <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">Statistik & Progres Akademik</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/20 rounded-xl text-center">
                    <span className="block text-xl font-extrabold text-primary">{coursesCount}</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mata Kuliah</span>
                  </div>
                  <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 rounded-xl text-center">
                    <span className="block text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {tasksCount > 0 ? `${Math.round((completedTasksCount / tasksCount) * 100)}%` : '0%'}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tugas Selesai</span>
                  </div>
                  <div className="p-3 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-900/20 rounded-xl text-center">
                    <span className="block text-xl font-extrabold text-amber-600 dark:text-amber-400">{notesCount}</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Materi</span>
                  </div>
                </div>

                {user.gpa_current && user.gpa_target ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-on-surface">
                      <span>Progres IPK</span>
                      <span>{Number(user.gpa_current).toFixed(2)} / {Number(user.gpa_target).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((Number(user.gpa_current) / Number(user.gpa_target)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-semibold italic flex items-center gap-1.5 mt-1">
                      {Number(user.gpa_current) >= Number(user.gpa_target) ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="7"/>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                          </svg>
                          <span>Luar biasa! Anda telah mencapai target IPK Anda!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="6"/>
                            <circle cx="12" cy="12" r="2"/>
                          </svg>
                          <span>Butuh {(Number(user.gpa_target) - Number(user.gpa_current)).toFixed(2)} poin lagi untuk mencapai target IPK Semester ini.</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant font-semibold italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    Atur IPK saat ini dan target IPK Anda pada menu perbarui profil untuk melihat ringkasan visual progres IPK.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: KALENDER & NOTIFIKASI */}
          {activeSubTab === 'sync' && (
            <div className="space-y-6">
              {/* Pengaturan Saklar Notifikasi */}
              <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">Notifikasi Sistem</h3>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                    <span>Pengingat Tugas & Jadwal</span>
                    <button
                      type="button"
                      onClick={handleToggleReminders}
                      className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                        reminders ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        reminders ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
     
                  <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                    <div>
                      <span>Email Rangkuman Tugas Harian</span>
                      <span className="block text-[9px] text-[#94A3B8] font-bold mt-0.5">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleDailyDigest}
                      className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                        dailyDigest ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        dailyDigest ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {dailyDigest && (
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="mt-2 text-primary hover:text-[#4F46E5] text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <span>Simulasi & Pratinjau Email Rangkuman</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium">
                  Pemberitahuan dikirim melalui saluran notifikasi peramban dan email akademis Anda.
                </p>
              </div>

              {/* Integrasi Kalender Eksternal Card */}
              <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">Sinkronisasi Kalender Eksternal</h3>
                </div>

                <p className="text-xs leading-relaxed text-on-surface-variant font-medium mb-5">
                  Hubungkan Planly dengan Google Calendar atau Outlook untuk menyinkronkan jadwal kuliah, reschedule, dan tugas Anda secara otomatis.
                </p>

                {/* Google & Outlook Connection Rows */}
                <div className="space-y-3 mb-5">
                  {/* Google Calendar Row */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/30 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center border border-slate-100 flex-shrink-0">
                        <Globe className="w-4.5 h-4.5 text-blue-500" />
                      </div>
                      <div>
                        <span className="font-bold block text-on-surface">Google Calendar</span>
                        <span className={`text-[10px] font-bold block ${syncConfig.google_connected ? 'text-emerald-500' : 'text-[#94A3B8]'}`}>
                          {syncConfig.google_connected ? 'Terhubung' : 'Belum Terhubung'}
                        </span>
                      </div>
                    </div>
                    {syncConfig.google_connected ? (
                      <button
                        type="button"
                        onClick={handleDisconnectGoogle}
                        className="px-3 py-1.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold rounded-lg text-[10px] cursor-pointer transition-colors"
                      >
                        Putuskan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectGoogle}
                        className="px-3 py-1.5 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors"
                      >
                        Hubungkan
                      </button>
                    )}
                  </div>

                  {/* Outlook Row */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/30 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center border border-slate-100 flex-shrink-0">
                        <Calendar className="w-4.5 h-4.5 text-blue-700" />
                      </div>
                      <div>
                        <span className="font-bold block text-on-surface">Microsoft Outlook</span>
                        <span className={`text-[10px] font-bold block ${syncConfig.outlook_connected ? 'text-emerald-500' : 'text-[#94A3B8]'}`}>
                          {syncConfig.outlook_connected ? 'Terhubung' : 'Belum Terhubung'}
                        </span>
                      </div>
                    </div>
                    {syncConfig.outlook_connected ? (
                      <button
                        type="button"
                        onClick={handleDisconnectOutlook}
                        className="px-3 py-1.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold rounded-lg text-[10px] cursor-pointer transition-colors"
                      >
                        Putuskan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectOutlook}
                        className="px-3 py-1.5 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors"
                      >
                        Hubungkan
                      </button>
                    )}
                  </div>
                </div>

                {/* Sync Settings switches (visible only when connected) */}
                {(syncConfig.google_connected || syncConfig.outlook_connected) && (
                  <div className="bg-slate-50/50 dark:bg-slate-850/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-3.5 mb-5">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 pb-1">
                      Pengaturan Sinkronisasi Otomatis
                    </span>
                    
                    <div className="flex justify-between items-center text-on-surface">
                      <span className="font-medium">Sinkronkan Jadwal Kuliah</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSyncSetting('sync_courses')}
                        className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                          syncConfig.sync_courses ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          syncConfig.sync_courses ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-on-surface">
                      <span className="font-medium">Sinkronkan Kuliah Pengganti (Reschedule)</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSyncSetting('sync_reschedules')}
                        className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                          syncConfig.sync_reschedules ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          syncConfig.sync_reschedules ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-on-surface">
                      <span className="font-medium">Sinkronkan Tenggat Tugas</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSyncSetting('sync_tasks')}
                        className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                          syncConfig.sync_tasks ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          syncConfig.sync_tasks ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-on-surface">
                      <span className="font-medium">Sinkronkan Event Kampus</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSyncSetting('sync_events')}
                        className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                          syncConfig.sync_events ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          syncConfig.sync_events ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isSyncingAll}
                      onClick={handleForceMassSync}
                      className="w-full py-2 bg-primary hover:bg-[#4F46E5] disabled:bg-slate-200 disabled:dark:bg-slate-800 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      {isSyncingAll ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>Sinkronkan Sekarang</span>
                    </button>
                  </div>
                )}

                {/* Manual Export & Subscription Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Integrasi Manual & iCalendar (.ics)
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleExportICS}
                      className="flex-1 h-9 px-3 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-on-surface"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh File .ics</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySubscriptionLink}
                      className="flex-1 h-9 px-3 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-on-surface"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>Salin Link Kalender</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: TAMPILAN & CADANGAN */}
          {activeSubTab === 'system' && (
            <div className="space-y-6">
              {/* Pilihan Tema */}
              <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-input-bg flex items-center justify-center text-primary">
                    <Palette className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">Tema Tampilan</h3>
                </div>
       
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div
                    onClick={() => onThemeChange('light')}
                    className={`border rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5 text-primary shadow-xs'
                        : 'border-white/60 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60 hover:bg-white/80 dark:hover:bg-slate-900/80 text-on-surface-variant'
                    }`}
                  >
                    <Palette className="w-6 h-6 text-primary" />
                    <span className="text-xs font-bold text-primary">Mode Terang</span>
                  </div>
                  
                  <div
                    onClick={() => onThemeChange('dark')}
                    className={`border rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5 text-primary shadow-xs'
                        : 'border-white/60 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60 hover:bg-white/80 dark:hover:bg-slate-900/80 text-on-surface-variant'
                    }`}
                  >
                    <Palette className="w-6 h-6 text-on-surface-variant" />
                    <span className="text-xs font-bold text-on-surface-variant">Mode Gelap</span>
                  </div>
                </div>
              </div>

              {/* Portabilitas Data / Cadangan Card */}
              <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
                      <Download className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base font-bold text-on-surface">Ekspor & Impor Data</h3>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-on-surface-variant font-medium mb-4">
                    Data Planly Anda disimpan secara lokal di peramban. Ekspor berkala ke berkas JSON untuk mengamankan data Anda.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="flex-1 h-9 px-4 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-on-surface"
                    >
                      <Download className="w-4 h-4" />
                      <span>Ekspor Cadangan</span>
                    </button>

                    <label
                      className="flex-1 h-9 px-4 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Impor Cadangan</span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportData}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-[#94A3B8] font-bold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Mengimpor data akan menimpa data saat ini secara permanen.</span>
                </div>
              </div>

              {/* Tombol Keluar Sesi & Konfirmasi Log Out */}
              <div className="bg-red-50/20 dark:bg-red-950/5 border border-red-100/50 dark:border-red-900/20 backdrop-blur-md rounded-2xl p-6 text-center flex flex-col justify-center items-center">
                <LogOut className="w-8 h-8 text-red-600 mb-2" />
                <h3 className="text-base font-bold text-red-600 mb-1">Keluar Akun</h3>
                <p className="text-xs text-on-surface-variant max-w-[280px] mb-4 font-semibold">
                  Keluar dari sesi akademik Planly aktif Anda pada perangkat peramban ini dengan aman.
                </p>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full shadow-sm transition-colors cursor-pointer"
                >
                  Keluar Sekarang
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal Simulasi Email Rangkuman Harian */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setShowEmailModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in text-left" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-800 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-xs font-bold text-on-surface-variant ml-2 font-mono">Planly Email Client Simulator</span>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Metadata */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 text-xs text-on-surface-variant space-y-1.5 font-sans">
              <div>
                <span className="font-bold text-on-surface pr-1">From:</span> Planly Digest &lt;digest@planly.com&gt;
              </div>
              <div>
                <span className="font-bold text-on-surface pr-1">To:</span> {user.name} &lt;{user.email}&gt;
              </div>
              <div>
                <span className="font-bold text-on-surface pr-1">Subject:</span> [Planly] Rangkuman Agenda Kuliah & Tugas Hari Ini
              </div>
            </div>

            {/* Email Body Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F1F5F9] dark:bg-slate-950 font-sans">
              <div className="max-w-[500px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                
                {/* Email Banner */}
                <div className="bg-primary p-6 text-white text-center">
                  <h2 className="text-lg font-extrabold tracking-tight">Rangkuman Harian Anda</h2>
                  <p className="text-xs opacity-90 mt-1">Planly Academic Planner • {indonesianDate}</p>
                </div>

                {/* Email content details */}
                <div className="p-6 space-y-5 text-on-surface">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Halo, {user.name}!</h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Berikut adalah rangkuman jadwal perkuliahan dan status tugas kuliah Anda untuk hari ini. Tetap semangat belajarnya ya!
                    </p>
                  </div>

                  {/* 1. Jadwal Kuliah Hari Ini */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                      📚 Jadwal Kuliah Hari Ini
                    </h4>
                    {(() => {
                      const today = new Date();
                      const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const todayEnglishDay = ENGLISH_DAYS[today.getDay()];
                      const todayCourses = courses.filter(c => c.day_of_week === todayEnglishDay);

                      if (todayCourses.length === 0) {
                        return (
                          <p className="text-xs text-on-surface-variant italic py-1 pl-1">
                            Tidak ada jadwal kuliah hari ini. Waktunya belajar mandiri atau beristirahat!
                          </p>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {todayCourses.map((c) => (
                            <div key={c.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold block text-on-surface">{c.course_name}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">
                                  Dosen: {c.lecturer_name} • Ruang: {c.room}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                {c.start_time} - {c.end_time}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 2. Tugas Kuliah Mendatang */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                      ⏳ Tugas Kuliah Aktif (Belum Selesai)
                    </h4>
                    {(() => {
                      const activeTasks = tasks.filter(t => !t.is_finished);
                      if (activeTasks.length === 0) {
                        return (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1 pl-1">
                            Selamat! Semua tugas kuliah Anda telah selesai dikerjakan.
                          </p>
                        );
                      }

                      const sortedTasks = [...activeTasks].sort((a, b) => new Date(a.deadline.replace(' ', 'T')).getTime() - new Date(b.deadline.replace(' ', 'T')).getTime());
                      
                      return (
                        <div className="space-y-2">
                          {sortedTasks.slice(0, 3).map((t) => {
                            const course = courses.find(c => c.id === t.course_id);
                            return (
                              <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold block truncate text-on-surface">{t.task_title}</span>
                                  <span className="text-[10px] text-on-surface-variant font-semibold mt-0.5 block truncate">
                                    Mata Kuliah: {course ? course.course_name : 'Umum / Pribadi'}
                                  </span>
                                </div>
                                <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                                  <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded">
                                    Deadline: {t.deadline.split(' ')[0]}
                                  </span>
                                  {t.is_priority && (
                                    <span className="text-[8px] font-bold text-white bg-amber-500 px-1 py-0.2 rounded uppercase">
                                      Prioritas
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {sortedTasks.length > 3 && (
                            <p className="text-[10px] text-on-surface-variant font-bold italic pt-1 pl-1">
                              + {sortedTasks.length - 3} tugas aktif lainnya dapat Anda lihat langsung di tab Tugas.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Motivational footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[11px] font-semibold text-on-surface-variant italic">
                      "Pendidikan adalah paspor untuk masa depan, karena hari esok adalah milik mereka yang mempersiapkannya hari ini."
                    </p>
                    <p className="text-[10px] font-bold text-primary mt-2">Selamat Belajar & Have a Productive Day! 🚀</p>
                  </div>

                </div>

                {/* Email Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border-t border-slate-100 dark:border-slate-800 text-center text-[9px] text-[#94A3B8] font-semibold">
                  Email ini dikirim secara otomatis oleh Planly Academic Planner.<br />
                  &copy; 2026 Planly. All rights reserved.
                </div>

              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-800 border-t border-[#E2E8F0] dark:border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-[#4F46E5] cursor-pointer shadow-xs transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Otorisasi OAuth Kalender Simulator */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setShowOAuthModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in text-center" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-800 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant font-mono">
                {showOAuthModal === 'google' ? 'Google Account Consent' : 'Microsoft Account Consent'}
              </span>
              <button
                onClick={() => setShowOAuthModal(null)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Service Brand Logo */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-primary">
                  {showOAuthModal === 'google' ? (
                    <Globe className="w-6 h-6 text-blue-500" />
                  ) : (
                    <Calendar className="w-6 h-6 text-blue-700" />
                  )}
                </div>
                <div className="text-slate-400">⚡</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-on-surface">
                  Hubungkan Planly dengan Akun {showOAuthModal === 'google' ? 'Google' : 'Outlook'} Anda?
                </h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Planly meminta izin untuk mengelola agenda dan tugas pada {showOAuthModal === 'google' ? 'Google Calendar' : 'Microsoft Outlook'} Anda.
                </p>
              </div>

              {/* Permission Scopes Details */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-2 text-[10px] text-on-surface-variant font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px] flex-shrink-0 mt-0.5" />
                  <span>Membaca daftar kalender dan status agenda Anda</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px] flex-shrink-0 mt-0.5" />
                  <span>Membuat, mengedit, dan menghapus kegiatan/tugas kuliah Anda</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px] flex-shrink-0 mt-0.5" />
                  <span>Menyinkronkan data secara real-time di latar belakang</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white dark:bg-slate-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={oauthLoading}
                  onClick={handleConfirmOAuthConnect}
                  className="flex-1 py-2.5 bg-primary hover:bg-[#4F46E5] disabled:bg-slate-200 disabled:dark:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  {oauthLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Setujui & Hubungkan</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
