/**
 * =============================================================================
 * Planly — ProfileView.tsx
 * 
 * Kegunaan:
 * Komponen konfigurasi Profil pengguna, pencapaian target akademik (IPK/GPA), sinkronisasi kalender OAuth, & backup data.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan ProfileView.tsx (orkestrator), profileService, dan calendarSync.
 * 
 * Aliran Data / State:
 * - Mengambil ringkasan data nilai IPK mahasiswa, kontrol sinkronisasi kalender eksternal, dan ekspor/impor data JSON.
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { User as UserIcon, Bell, Palette, Calendar, X, ArrowRight, Save, Check, Globe, RefreshCw, LogOut } from 'lucide-react';
import { User, Course, Task, RescheduledSession, CampusEvent, CalendarSyncConfig } from '../../types';
import { useToast } from '../ui/Toast';
import { calendarSyncService } from '../../services/calendar/calendarSync';
import { generateICalendarData, downloadICSFile } from '../../utils/ical';

// Import sub-komponen yang telah dipisah
import ProfileHeader from './ProfileHeader';
import GpaProgressCard from './GpaProgressCard';
import CalendarSyncPanel from './CalendarSyncPanel';
import DailySummaryEmailModal from './DailySummaryEmailModal';
import BackupRecoveryPanel from './BackupRecoveryPanel';
import FaceEnrollment from './FaceEnrollment';
import { encryptApiKey, decryptApiKey } from '../../utils/security';

import Skeleton from '../ui/Skeleton';

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
  loading?: boolean;
}

/**
 * Komponen ProfileView (Orchestrator)
 * 
 * Halaman utama pengaturan profil mahasiswa yang modular. Menyediakan navigasi tab (Akun & Akademik,
 * Kalender & Notifikasi, Tampilan & Cadangan) dan mendelegasikan visualisasi serta aksi ke sub-komponen spesifik.
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
  events,
  loading = false
}: ProfileViewProps) {
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
        {/* Header */}
        <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2 text-center md:text-left">
            <Skeleton className="w-48 h-7 rounded-md mx-auto md:mx-0" />
            <Skeleton className="w-36 h-4 rounded-md mx-auto md:mx-0" />
          </div>
        </div>

        {/* GPA Progress & Academic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-4">
            <Skeleton className="w-32 h-5 rounded-md" />
            <Skeleton className="w-full h-8 rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          </div>
          <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-4">
            <Skeleton className="w-32 h-5 rounded-md" />
            <Skeleton className="w-full h-24 rounded-lg" />
          </div>
        </div>

        {/* Bottom panel: Settings tabs & content */}
        <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex gap-4 border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
            <Skeleton className="w-24 h-5 rounded-md" />
            <Skeleton className="w-36 h-5 rounded-md" />
            <Skeleton className="w-28 h-5 rounded-md" />
          </div>
          <div className="space-y-4">
            <Skeleton className="w-48 h-6 rounded-md" />
            <Skeleton className="w-full h-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const toast = useToast();

  // State Gemini API Key
  const [localApiKey, setLocalApiKey] = useState(() => {
    const saved = localStorage.getItem('planly_gemini_api_key');
    if (!saved) return '';
    return decryptApiKey(saved);
  });

  const [useSystemKey, setUseSystemKey] = useState(() => {
    return localStorage.getItem('planly_use_system_key') === 'true';
  });

  const envApiKey = import.meta.env.GEMINI_API_KEY;
  const isEnvKeyValid = envApiKey && envApiKey !== 'MY_GEMINI_API_KEY' && envApiKey !== '';

  const handleSaveApiKey = (key: string) => {
    setLocalApiKey(key);
    const encrypted = encryptApiKey(key);
    localStorage.setItem('planly_gemini_api_key', encrypted);
    toast.success('Kunci API Gemini berhasil disimpan secara terenkripsi.');
  };

  const handleDeleteApiKey = () => {
    setLocalApiKey('');
    localStorage.removeItem('planly_gemini_api_key');
    toast.info('Kunci API Gemini telah dihapus.');
  };

  const handleToggleSystemKey = (val: boolean) => {
    setUseSystemKey(val);
    localStorage.setItem('planly_use_system_key', String(val));
    if (val) {
      toast.success('Berhasil mengaktifkan API Key sistem bawaan.');
    } else {
      toast.info('API Key sistem bawaan dinonaktifkan.');
    }
  };

  // Hitung jumlah data akademis
  const coursesCount = courses.length;
  const tasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.is_finished).length;

  // State navigasi tab dalam halaman profil
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'sync' | 'system'>('account');

  // --- STATE AKUN & FORMULIR EDIT ---
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editNim, setEditNim] = useState(user.nim || '');
  const [editMajor, setEditMajor] = useState(user.major || '');
  const [editSemester, setEditSemester] = useState(user.semester ? String(user.semester) : '');
  const [editGpaCurrent, setEditGpaCurrent] = useState(user.gpa_current ? String(user.gpa_current) : '');
  const [editGpaTarget, setEditGpaTarget] = useState(user.gpa_target ? String(user.gpa_target) : '');
  const [editTargetStudyHours, setEditTargetStudyHours] = useState(user.target_study_hours ? String(user.target_study_hours) : '');
  const [editAddress, setEditAddress] = useState(user.address || '');

  // --- STATE NOTIFIKASI & EMAIL ---
  const [reminders, setReminders] = useState(() => {
    return localStorage.getItem('planly_notifications_enabled') !== 'false';
  });
  const [dailyDigest, setDailyDigest] = useState(() => {
    return localStorage.getItem('planly_daily_digest_enabled') === 'true';
  });
  const [showEmailModal, setShowEmailModal] = useState(false);

  // --- STATE SINKRONISASI KALENDER ---
  const [syncConfig, setSyncConfig] = useState<CalendarSyncConfig>(() => calendarSyncService.getConfig());
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState<'google' | 'outlook' | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Simpan konfigurasi kalender setiap kali ada perubahan
  useEffect(() => {
    calendarSyncService.saveConfig(syncConfig);
  }, [syncConfig]);

  // Handler Notifikasi Pengingat Tugas & Jadwal
  const handleToggleReminders = () => {
    const nextVal = !reminders;
    if (nextVal) {
      if (!('Notification' in window)) {
        toast.error('Peramban kamu tidak mendukung notifikasi sistem.');
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
          toast.error('Izin notifikasi diblokir browser. Harap aktifkan izin notifikasi pada pengaturan browser kamu.');
        }
      });
    } else {
      setReminders(false);
      localStorage.setItem('planly_notifications_enabled', 'false');
      toast.info('Pengingat tugas & jadwal dinonaktifkan.');
    }
  };

  // Handler Saklar Email Rangkuman Harian
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

  // Handler Otorisasi OAuth Google & Outlook
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
    setSyncConfig(prev => ({ ...prev, google_connected: false }));
    toast.info('Koneksi Google Calendar diputuskan.');
  };

  const handleDisconnectOutlook = () => {
    setSyncConfig(prev => ({ ...prev, outlook_connected: false }));
    toast.info('Koneksi Microsoft Outlook diputuskan.');
  };

  const handleToggleSyncSetting = (key: keyof CalendarSyncConfig) => {
    setSyncConfig(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Pengaturan sinkronisasi diperbarui.');
  };

  // Sinkronisasi Massal Semua Data
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
      // Error logging ditangani di layer service
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Unduh Kalender iCalendar (.ics)
  const handleExportICS = () => {
    try {
      const icsData = generateICalendarData(courses, rescheduledSessions, tasks, events);
      downloadICSFile(icsData, `planly_calendar_${user.nim || 'academic'}.ics`);
      toast.success('Berkas iCalendar (.ics) berhasil diunduh.');
    } catch (err) {
      console.error("Gagal ekspor ICS:", err);
      toast.error('Gagal mengekspor data kalender.');
    }
  };

  const handleCopySubscriptionLink = () => {
    const dummySubLink = `https://planly.app/feeds/calendar/${user.nim || 'arfwjn'}.ics`;
    navigator.clipboard.writeText(dummySubLink).then(() => {
      toast.success('Tautan kalender berhasil disalin! Tambahkan URL ini di Google Calendar atau Outlook.');
    }).catch(() => {
      toast.error('Gagal menyalin tautan.');
    });
  };

  // --- PENGELOLA DATA PROFIL ---
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

  // --- PORTABILITAS CADANGAN DATA ---
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
        toast.error('Gagal memproses file JSON cadangan.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
      {/* Header Halaman */}
      <div className="flex items-center gap-2.5">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
          <UserIcon className="w-8 h-8 text-primary" />
          <span>Profil Pengguna</span>
        </h1>
      </div>

      {/* Header Profil */}
      <ProfileHeader user={user} onUserUpdate={onUserUpdate} />

      {/* Konten Halaman Profil dengan Navigasi Sidebar */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-[220px] flex-shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pr-0 md:pr-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('account')}
            className={`group relative flex items-center gap-2.5 pl-5 pr-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0 cursor-pointer w-auto md:w-full text-left select-none origin-left hover:scale-[1.01] active:scale-[0.97] ${
              activeSubTab === 'account'
                ? theme === 'light'
                  ? 'text-primary bg-[#F5F2FF] shadow-[0_2px_8px_rgba(53,37,205,0.06)]'
                  : 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/10 shadow-[0_2px_12px_rgba(99,102,241,0.1)]'
                : theme === 'light'
                  ? 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {/* Active left indicator bar */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full transition-all duration-300 origin-left ${
                activeSubTab === 'account'
                  ? theme === 'light'
                    ? 'bg-primary scale-y-100 opacity-100'
                    : 'bg-indigo-400 scale-y-100 opacity-100'
                  : 'scale-y-0 opacity-0'
              }`}
            />

            <UserIcon 
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                activeSubTab === 'account'
                  ? 'stroke-[2.5px]'
                  : 'opacity-70 group-hover:opacity-100'
              }`} 
            />
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">Akun & Akademik</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('sync')}
            className={`group relative flex items-center gap-2.5 pl-5 pr-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0 cursor-pointer w-auto md:w-full text-left select-none origin-left hover:scale-[1.01] active:scale-[0.97] ${
              activeSubTab === 'sync'
                ? theme === 'light'
                  ? 'text-primary bg-[#F5F2FF] shadow-[0_2px_8px_rgba(53,37,205,0.06)]'
                  : 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/10 shadow-[0_2px_12px_rgba(99,102,241,0.1)]'
                : theme === 'light'
                  ? 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {/* Active left indicator bar */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full transition-all duration-300 origin-left ${
                activeSubTab === 'sync'
                  ? theme === 'light'
                    ? 'bg-primary scale-y-100 opacity-100'
                    : 'bg-indigo-400 scale-y-100 opacity-100'
                  : 'scale-y-0 opacity-0'
              }`}
            />

            <Calendar 
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                activeSubTab === 'sync'
                  ? 'stroke-[2.5px]'
                  : 'opacity-70 group-hover:opacity-100'
              }`} 
            />
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">Kalender & Notifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('system')}
            className={`group relative flex items-center gap-2.5 pl-5 pr-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0 cursor-pointer w-auto md:w-full text-left select-none origin-left hover:scale-[1.01] active:scale-[0.97] ${
              activeSubTab === 'system'
                ? theme === 'light'
                  ? 'text-primary bg-[#F5F2FF] shadow-[0_2px_8px_rgba(53,37,205,0.06)]'
                  : 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/10 shadow-[0_2px_12px_rgba(99,102,241,0.1)]'
                : theme === 'light'
                  ? 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {/* Active left indicator bar */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full transition-all duration-300 origin-left ${
                activeSubTab === 'system'
                  ? theme === 'light'
                    ? 'bg-primary scale-y-100 opacity-100'
                    : 'bg-indigo-400 scale-y-100 opacity-100'
                  : 'scale-y-0 opacity-0'
              }`}
            />

            <Palette 
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                activeSubTab === 'system'
                  ? 'stroke-[2.5px]'
                  : 'opacity-70 group-hover:opacity-100'
              }`} 
            />
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">Tampilan & Cadangan</span>
          </button>
        </div>

        {/* Sisi Kanan: Panel Tab Aktif */}
        <div className="flex-1 w-full space-y-6">
          
          {/* TAB 1: AKUN & AKADEMIK */}
          {activeSubTab === 'account' && (
            <div className="space-y-6">
              {/* Form Informasi Akun */}
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
                          placeholder="misal: 4"
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
                          placeholder="Jam/Hari (misal: 3)"
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
                          placeholder="misal: 3.75"
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
                          placeholder="misal: 3.85"
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
                        placeholder="misal: Purwokerto, Jawa Tengah"
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
                      Kelola informasi profil, nomor induk mahasiswa (NIM), program studi, target akademik, dan target jam belajar harian kamu di sini.
                    </p>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={handleStartEditing}
                        className="text-primary font-bold text-xs flex items-center gap-1 hover:underline group cursor-pointer bg-transparent border-none p-0"
                      >
                        <span>Perbarui profil</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={onSignOut}
                        className="text-red-600 hover:text-red-755 dark:text-red-400 dark:hover:text-red-300 font-bold text-xs flex items-center gap-1 hover:underline group cursor-pointer bg-transparent border-none p-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Sesi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Kartu Progres IPK */}
              <GpaProgressCard
                coursesCount={coursesCount}
                tasksCount={tasksCount}
                completedTasksCount={completedTasksCount}
                notesCount={notesCount}
                gpaCurrent={user.gpa_current}
                gpaTarget={user.gpa_target}
              />

              {/* Verifikasi Wajah Presensi */}
              <FaceEnrollment theme={theme} />


            </div>
          )}

          {/* TAB 2: KALENDER & NOTIFIKASI */}
          {activeSubTab === 'sync' && (
            <div className="space-y-6">
              {/* Notifikasi Sistem Saklar */}
              <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">Notifikasi Sistem</h3>
                </div>
                
                <div className="space-y-4 mb-4">
                  {/* Saklar Notifikasi Browser */}
                  <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                    <span>Pengingat Tugas & Jadwal</span>
                    <button
                      type="button"
                      onClick={handleToggleReminders}
                      className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                        reminders ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-850'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        reminders ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
     
                  {/* Saklar Email Rangkuman Harian */}
                  <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                    <div>
                      <span>Email Rangkuman Tugas Harian</span>
                      <span className="block text-[9px] text-[#94A3B8] font-bold mt-0.5">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleDailyDigest}
                      className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                        dailyDigest ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-850'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        dailyDigest ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Tombol Simulasi Email */}
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
                  Pemberitahuan dikirim langsung melalui saluran notifikasi peramban web dan email akademis kamu.
                </p>
              </div>

              {/* Panel Sinkronisasi Kalender Eksternal */}
              <CalendarSyncPanel
                syncConfig={syncConfig}
                isSyncingAll={isSyncingAll}
                onConnectGoogle={() => setShowOAuthModal('google')}
                onDisconnectGoogle={handleDisconnectGoogle}
                onConnectOutlook={() => setShowOAuthModal('outlook')}
                onDisconnectOutlook={handleDisconnectOutlook}
                onToggleSyncSetting={handleToggleSyncSetting}
                onForceMassSync={handleForceMassSync}
                onExportICS={handleExportICS}
                onCopySubscriptionLink={handleCopySubscriptionLink}
              />
            </div>
          )}

          {/* TAB 3: TAMPILAN & CADANGAN */}
          {activeSubTab === 'system' && (
            <BackupRecoveryPanel
              theme={theme}
              onThemeChange={onThemeChange}
              onExportData={handleExportData}
              onImportData={handleImportData}
              localApiKey={localApiKey}
              onSaveApiKey={handleSaveApiKey}
              onDeleteApiKey={handleDeleteApiKey}
              isEnvKeyValid={!!isEnvKeyValid}
              useSystemKey={useSystemKey}
              onToggleSystemKey={handleToggleSystemKey}
            />
          )}

        </div>
      </div>

      {/* Modal Simulasi Email Rangkuman Harian */}
      <DailySummaryEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        user={user}
        courses={courses}
        tasks={tasks}
      />

      {/* Modal Otorisasi OAuth Simulator */}
      {showOAuthModal && (
        <div 
          className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" 
          onClick={() => setShowOAuthModal(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in text-center" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal OAuth */}
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

            {/* Isi Modal OAuth */}
            <div className="p-6 space-y-6">
              {/* Logo Brand Layanan */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-primary">
                  {showOAuthModal === 'google' ? (
                    <Globe className="w-6 h-6 text-blue-500" />
                  ) : (
                    <Calendar className="w-6 h-6 text-blue-700 dark:text-blue-500" />
                  )}
                </div>
                <div className="text-slate-400 font-mono">⚡</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-on-surface">
                  Hubungkan Planly dengan Akun {showOAuthModal === 'google' ? 'Google' : 'Outlook'} kamu?
                </h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Planly meminta izin untuk mengelola agenda dan tugas pada {showOAuthModal === 'google' ? 'Google Calendar' : 'Microsoft Outlook'} milikmu.
                </p>
              </div>

              {/* Rincian Cakupan Izin */}
              <div className="bg-slate-50 dark:bg-slate-850/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-2 text-[10px] text-on-surface-variant font-medium">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px] flex-shrink-0 mt-0.5" />
                  <span>Membaca daftar kalender dan status agenda perkuliahanmu</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px] flex-shrink-0 mt-0.5" />
                  <span>Membuat, mengedit, dan menghapus kegiatan/tugas kuliah kamu</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px] flex-shrink-0 mt-0.5" />
                  <span>Menyinkronkan data secara real-time di latar belakang</span>
                </div>
              </div>

              {/* Tombol Kontrol Aksi */}
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
