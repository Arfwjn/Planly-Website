import { useState, useEffect } from 'react';
import { User, Course, Task, Note, SidebarTab, LoginResponse, CampusEvent, RescheduledSession } from './types';
import { api } from './services/api';

// Impor komponen-komponen view utama aplikasi
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import EventsView from './components/EventsView';
import TasksView from './components/TasksView';
import CoursesView from './components/CoursesView';
import NotesView from './components/NotesView';
import ProfileView from './components/ProfileView';
import WorkspaceView from './components/WorkspaceView';
import useDeadlineMonitor from './hooks/useDeadlineMonitor';
import { useToast } from './components/ui/Toast';


// Impor ikon untuk navigasi bawah pada perangkat mobile
import { LayoutDashboard, CalendarDays, CheckSquare, FileText, User as UserIcon, Menu } from 'lucide-react';

/**
 * Komponen utama App yang mengatur seluruh alur navigasi, autentikasi,
 * sinkronisasi data dari API, serta timer fokus global (Pomodoro).
 */
export default function App() {
  const toast = useToast();
  // --- STATE AUTENTIKASI ---
  // Menentukan status login pengguna dengan membaca nilai dari localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('planly_auth') === 'true';
  });

  // Menyimpan data profil pengguna aktif yang tersimpan di localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('planly_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- STATE DATABASE APLIKASI ---
  // Menyimpan daftar mata kuliah, tugas, dan catatan pengguna
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [rescheduledSessions, setRescheduledSessions] = useState<RescheduledSession[]>([]);
  const [loadingData, setLoadingData] = useState(false); // Indikator ketika mengambil data dari API

  // --- STATE NAVIGASI GLOBAL & PENCARIAN ---
  // Mengontrol tab aktif yang sedang dilihat oleh pengguna
  const [activeTab, setActiveTab] = useState<SidebarTab>('today');
  const [searchQuery, setSearchQuery] = useState(''); // Query pencarian global
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mengontrol tampilan sidebar pada layar kecil/mobile

  // --- KONTROL MODAL OVERLAY ---
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isEnrollCourseOpen, setIsEnrollCourseOpen] = useState(false);

  // --- STATE PENGINGAT DEADLINE & AUTO INSPECT ---
  const [autoInspectTaskId, setAutoInspectTaskId] = useState<number | null>(null);

  // Mengaktifkan monitoring deadline batas waktu tugas di latar belakang
  useDeadlineMonitor({
    tasks,
    courses,
    setActiveTab,
    setAutoInspectTaskId
  });

  // --- STATE TEMA GLOBAL (MODE TERANG / GELAP) ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('planly_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('planly_theme', theme);
  }, [theme]);

  // --- STATE TIMER FOKUS GLOBAL (POMODORO) ---
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500);
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState(false);
  const [pomodoroStage, setPomodoroStage] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [pomodoroTaskId, setPomodoroTaskId] = useState<number | null>(null);
  const [completedPomodoroCount, setCompletedPomodoroCount] = useState(0);

  // --- STATE TIMER RUANG BELAJAR LAINNYA ---
  const [workspaceMode, setWorkspaceMode] = useState<'pomodoro' | 'lecture'>('pomodoro');
  
  // 1. Sesi Kuliah Live (Lecture)
  const [lectureTime, setLectureTime] = useState(0);
  const [isLectureRunning, setIsLectureRunning] = useState(false);
  const [activeLectureCourseId, setActiveLectureCourseId] = useState<number | null>(null);
  const [lectureNoteContent, setLectureNoteContent] = useState('');

  // Audio Beep generator saat timer Pomodoro habis
  const playChimeSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Nada D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // Nada A5
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Autoplay audio blocked or not supported", e);
    }
  };

  // Effect untuk mengontrol jalannya timer fokus Pomodoro setiap detiknya
  useEffect(() => {
    let interval: any = null;
    if (isFocusTimerRunning) {
      if (focusTimeLeft > 0) {
        interval = setInterval(() => {
          setFocusTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        // Timer habis (Mencapai 0)
        setIsFocusTimerRunning(false);
        playChimeSound();

        if (pomodoroStage === 'work') {
          const nextCount = completedPomodoroCount + 1;
          setCompletedPomodoroCount(nextCount);
          if (nextCount > 0 && nextCount % 4 === 0) {
            setPomodoroStage('long-break');
            setFocusTimeLeft(900); // 15 menit
            toast.success('Luar biasa! 4 sesi fokus selesai. Nikmati istirahat panjang (15 menit) Anda!');
          } else {
            setPomodoroStage('short-break');
            setFocusTimeLeft(300); // 5 menit
            toast.info('Sesi fokus selesai! Ambil napas dan istirahat pendek (5 menit).');
          }
        } else {
          // Dari break kembali ke work
          setPomodoroStage('work');
          setFocusTimeLeft(1500); // 25 menit
          toast.info('Istirahat selesai! Mari kembali fokus.');
        }
      }
    }
    return () => clearInterval(interval);
  }, [isFocusTimerRunning, focusTimeLeft, pomodoroStage, completedPomodoroCount]);

  // Effect untuk mengontrol Sesi Kuliah Live
  useEffect(() => {
    let interval: any = null;
    if (isLectureRunning) {
      interval = setInterval(() => {
        setLectureTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLectureRunning]);

  const handleResetFocusTimer = () => {
    setFocusTimeLeft(pomodoroStage === 'work' ? 1500 : pomodoroStage === 'short-break' ? 300 : 900);
    setIsFocusTimerRunning(false);
  };


  // --- SINKRONISASI DATA DARI API ---
  // Mengambil semua data pengguna (mata kuliah, tugas, catatan, event) secara paralel saat berhasil login
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingData(true);
      Promise.all([
        api.courses.getAll(),
        api.tasks.getAll(),
        api.notes.getAll(),
        api.events.getAll(),
        api.reschedules.getAll()
      ]).then(([c, t, n, e, r]) => {
        setCourses(c);
        setTasks(t);
        setNotes(n);
        setEvents(e);
        setRescheduledSessions(r);
        setLoadingData(false);
      }).catch(err => {
        console.error("Error loading data from api", err);
        setLoadingData(false);
      });
    }
  }, [isAuthenticated]);

  // Membersihkan kata kunci pencarian setiap kali pengguna berpindah tab
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  // --- HANDLER AUTENTIKASI ---
  // Menyimpan data pengguna dan memperbarui status autentikasi ketika login berhasil
  const handleLoginSuccess = (loginResponse: LoginResponse) => {
    setCurrentUser(loginResponse.user);
    localStorage.setItem('planly_user', JSON.stringify(loginResponse.user));
    setIsAuthenticated(true);
  };

  // Mengeluarkan pengguna dari sistem setelah konfirmasi, menghapus data lokal, dan mereset tab aktif
  const handleSignOut = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari Planly?')) {
      api.auth.logout().then(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('planly_user');
        setActiveTab('today');
      });
    }
  };

  // Memperbarui data profil pengguna
  const handleUserUpdate = (payload: Partial<User>) => {
    api.profile.update(payload).then((savedUser) => {
      setCurrentUser(savedUser);
      localStorage.setItem('planly_user', JSON.stringify(savedUser));
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER TUGAS (TASKS) ---
  // Mengubah status penyelesaian tugas (selesai / belum selesai)
  const handleToggleTaskState = (taskId: number) => {
    api.tasks.finish(taskId).then((updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
    }).catch(err => toast.error(err.message));
  };

  // Menambahkan tugas baru ke dalam daftar
  const handleAddTask = (newTask: Omit<Task, 'id' | 'user_id'>, silent = false) => {
    return api.tasks.create(newTask).then((createdTask) => {
      setTasks((prev) => [createdTask, ...prev]);
      if (!silent) {
        toast.success('Tugas baru berhasil ditambahkan.');
      }
      return createdTask;
    }).catch(err => {
      toast.error(err.message);
      throw err;
    });
  };

  // Memperbarui detail informasi tugas
  const handleEditTask = (taskId: number, updatedTask: Partial<Task>) => {
    api.tasks.update(taskId, updatedTask).then((savedTask) => {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? savedTask : t)));
      toast.success('Tugas berhasil diperbarui.');
    }).catch(err => toast.error(err.message));
  };

  // Menghapus tugas berdasarkan ID
  const handleDeleteTask = (taskId: number) => {
    api.tasks.delete(taskId).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER MATA KULIAH (COURSES) ---
  // Mendaftarkan mata kuliah baru
  const handleAddCourse = (newCourse: Omit<Course, 'id' | 'user_id'>) => {
    api.courses.create(newCourse).then((createdCourse) => {
      setCourses((prev) => [...prev, createdCourse]);
      toast.success('Mata Kuliah berhasil didaftarkan.');
    }).catch(err => toast.error(err.message));
  };

  // Memperbarui detail mata kuliah dan memuat ulang tugas serta catatan terkait untuk menjaga sinkronisasi data
  const handleEditCourse = (courseId: number, updatedCourse: Partial<Course>) => {
    api.courses.update(courseId, updatedCourse).then((savedCourse) => {
      setCourses((prev) => prev.map((c) => (c.id === courseId ? savedCourse : c)));
      api.tasks.getAll().then(setTasks);
      api.notes.getAll().then(setNotes);
      toast.success('Mata Kuliah berhasil diperbarui.');
    }).catch(err => toast.error(err.message));
  };

  // Menghapus mata kuliah beserta data terkait
  const handleDeleteCourse = (courseId: number) => {
    api.courses.delete(courseId).then(() => {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      api.tasks.getAll().then(setTasks);
      api.notes.getAll().then(setNotes);
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER CATATAN (NOTES) ---
  // Menambahkan catatan kuliah baru
  const handleAddNote = (newNote: Omit<Note, 'id' | 'user_id'>) => {
    api.notes.create(newNote).then((createdNote) => {
      setNotes((prev) => [createdNote, ...prev]);
      toast.success('Catatan baru berhasil disimpan.');
    }).catch(err => toast.error(err.message));
  };

  // Memperbarui isi catatan kuliah
  const handleEditNote = (noteId: number, updatedNote: Partial<Note>) => {
    api.notes.update(noteId, updatedNote).then((savedNote) => {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? savedNote : n)));
      toast.success('Catatan berhasil diperbarui.');
    }).catch(err => toast.error(err.message));
  };

  // Menghapus catatan kuliah
  const handleDeleteNote = (noteId: number) => {
    api.notes.delete(noteId).then(() => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER EVENT KAMPUS ---
  // Menambahkan event kampus baru
  const handleAddEvent = (newEvent: Omit<CampusEvent, 'id' | 'user_id'>) => {
    api.events.create(newEvent).then((createdEvent) => {
      setEvents((prev) => [createdEvent, ...prev]);
      toast.success('Event baru berhasil ditambahkan.');
    }).catch(err => toast.error(err.message));
  };

  // Memperbarui event kampus
  const handleEditEvent = (eventId: number, updatedEvent: Partial<CampusEvent>) => {
    api.events.update(eventId, updatedEvent).then((savedEvent) => {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? savedEvent : e)));
      toast.success('Event berhasil diperbarui.');
    }).catch(err => toast.error(err.message));
  };

  // Menghapus event kampus
  const handleDeleteEvent = (eventId: number) => {
    api.events.delete(eventId).then(() => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event berhasil dihapus.');
    }).catch(err => toast.error(err.message));
  };

  // Menambahkan pemindahan jadwal (reschedule) kuliah
  const handleAddReschedule = (session: Omit<RescheduledSession, 'id'>) => {
    api.reschedules.create(session).then((created) => {
      setRescheduledSessions((prev) => [created, ...prev]);
      toast.success(session.is_canceled ? 'Sesi kuliah berhasil dibatalkan.' : 'Sesi kuliah berhasil dipindahkan.');
    }).catch(err => toast.error(err.message));
  };

  // Menghapus pemindahan jadwal kuliah (mengembalikan ke semula)
  const handleDeleteReschedule = (courseId: number, originalDate: string) => {
    api.reschedules.delete(courseId, originalDate).then(() => {
      setRescheduledSessions((prev) =>
        prev.filter((r) => !(r.course_id === courseId && r.original_date === originalDate))
      );
      toast.success('Jadwal kuliah dikembalikan ke sesi normal.');
    }).catch(err => toast.error(err.message));
  };

  // Berpindah ke tab catatan dan otomatis memfilter berdasarkan kode mata kuliah yang dipilih
  const handleOpenNotesWithCourse = (courseId: number | null) => {
    setActiveTab('notes');
    if (courseId !== null) {
      const courseCode = courses.find(c => c.id === courseId)?.course_code || '';
      if (courseCode) {
        setSearchQuery(courseCode);
      }
    }
  };

  // --- SWITCH UNTUK RENDERING KONTEN TAB ---
  // Memilih komponen view yang akan ditampilkan di area konten utama berdasarkan tab aktif
  const renderTabContent = () => {
    if (!currentUser) return null;
    
    switch (activeTab) {
      case 'today':
        return (
          <TodayView
            user={currentUser}
            courses={courses}
            tasks={tasks}
            onTabChange={setActiveTab}
            onOpenNotesWithCourse={handleOpenNotesWithCourse}
            focusTimeLeft={focusTimeLeft}
            isFocusTimerRunning={isFocusTimerRunning}
            setIsFocusTimerRunning={setIsFocusTimerRunning}
            onResetFocusTimer={handleResetFocusTimer}
            loading={loadingData}
            events={events}
            rescheduledSessions={rescheduledSessions}
            pomodoroStage={pomodoroStage}
            pomodoroTaskId={pomodoroTaskId}
            completedPomodoroCount={completedPomodoroCount}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            courses={courses}
            onOpenAddNewCourseModal={() => {
              setActiveTab('courses');
              setIsEnrollCourseOpen(true);
            }}
            loading={loadingData}
            rescheduledSessions={rescheduledSessions}
            onAddReschedule={handleAddReschedule}
            onDeleteReschedule={handleDeleteReschedule}
          />
        );
      case 'events':
        return (
          <EventsView
            events={events}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            searchQuery={searchQuery}
            loading={loadingData}
          />
        );
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            courses={courses}
            onToggleTaskState={handleToggleTaskState}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            isSlideOverOpen={isNewTaskOpen}
            onSetSlideOverOpen={setIsNewTaskOpen}
            searchQuery={searchQuery}
            loading={loadingData}
            autoInspectTaskId={autoInspectTaskId}
            onClearAutoInspect={() => setAutoInspectTaskId(null)}
          />
        );
      case 'courses':
        return (
          <CoursesView
            courses={courses}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onToggleTaskState={handleToggleTaskState}
            tasks={tasks}
            isEnrollModalOpen={isEnrollCourseOpen}
            onSetEnrollModalOpen={setIsEnrollCourseOpen}
            searchQuery={searchQuery}
            loading={loadingData}
          />
        );
      case 'notes':
        return (
          <NotesView
            notes={notes}
            courses={courses}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            searchQuery={searchQuery}
            loading={loadingData}
          />
        );
      case 'workspace':
        return (
          <WorkspaceView
            courses={courses}
            tasks={tasks}
            onAddNote={handleAddNote}
            onAddTask={handleAddTask}
            onTabChange={setActiveTab}
            workspaceMode={workspaceMode}
            setWorkspaceMode={setWorkspaceMode}
            focusTimeLeft={focusTimeLeft}
            setFocusTimeLeft={setFocusTimeLeft}
            isFocusTimerRunning={isFocusTimerRunning}
            setIsFocusTimerRunning={setIsFocusTimerRunning}
            onResetFocusTimer={handleResetFocusTimer}
            pomodoroStage={pomodoroStage}
            setPomodoroStage={setPomodoroStage}
            pomodoroTaskId={pomodoroTaskId}
            setPomodoroTaskId={setPomodoroTaskId}
            completedPomodoroCount={completedPomodoroCount}
            setCompletedPomodoroCount={setCompletedPomodoroCount}
            lectureTime={lectureTime}
            setLectureTime={setLectureTime}
            isLectureRunning={isLectureRunning}
            setIsLectureRunning={setIsLectureRunning}
            activeLectureCourseId={activeLectureCourseId}
            setActiveLectureCourseId={setActiveLectureCourseId}
            lectureNoteContent={lectureNoteContent}
            setLectureNoteContent={setLectureNoteContent}
          />
        );
      case 'profile':
        return (
          <ProfileView
            user={currentUser}
            onUserUpdate={handleUserUpdate}
            onSignOut={handleSignOut}
            theme={theme}
            onThemeChange={setTheme}
          />
        );
      default:
        return null;
    }
  };

  // --- RENDER HALAMAN LOGIN / REGISTER ---
  // Jika belum terautentikasi atau data profil belum dimuat, tampilkan halaman autentikasi AuthView
  if (!isAuthenticated || !currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  // --- RENDER STRUKTUR LAYOUT UTAMA ---
  return (
    <div className="bg-surface text-on-surface font-sans antialiased min-h-screen flex selection:bg-slate-200">
      
      {/* Sidebar Navigasi - Tampilan Samping Kiri (Desktop) / Drawer Slide-out (Mobile) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        focusTimeLeft={focusTimeLeft}
        isFocusTimerRunning={isFocusTimerRunning}
        setIsFocusTimerRunning={setIsFocusTimerRunning}
        onResetFocusTimer={handleResetFocusTimer}
        lectureTime={lectureTime}
        isLectureRunning={isLectureRunning}
      />

      {/* Area Konten Utama Core View */}
      <main className="flex-1 lg:ml-[260px] flex flex-col min-h-screen relative w-full overflow-x-hidden">
        
        {/* Header Global Sticky - Berisi info pengguna, tombol menu burger mobile, dan kolom pencarian */}
        <Header
          user={currentUser}
          onMenuToggle={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          tasks={tasks}
          courses={courses}
          onTabChange={setActiveTab}
          theme={theme}
          onThemeChange={setTheme}
          onUserUpdate={handleUserUpdate}
        />

        {/* Kontainer Utama Konten Dinamis */}
        <div key={activeTab} className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-12 animate-fade-in">
          {renderTabContent()}
        </div>

        {/* Bilah Navigasi Bawah (Bottom Navigation Bar) khusus untuk viewport Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] shadow-md flex justify-around items-center h-16 px-4 z-40">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'today' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Hari Ini</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'calendar' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Jadwal</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'tasks' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Tugas</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'notes' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Catatan</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Profil</span>
          </button>
        </nav>

      </main>
    </div>
  );
}
