// =============================================================================
// Planly — Main Application Component (Entry Point UI)
//
// File ini berfungsi sebagai tata letak (layout) utama dan sistem router/navigasi.
// Logika state bisnis yang rumit (API, Timer, Tema, Auth) telah dipecah (refactored)
// ke dalam Custom Hooks terpisah di folder 'src/hooks/' demi kerapian kode (SoC).
// =============================================================================

import { useState, useEffect } from "react";
import { SidebarTab } from "./types";

// Impor komponen-komponen view utama aplikasi
import AuthView from "./components/auth/AuthView";
import LandingView from "./components/landing/LandingView";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TodayView from "./components/today/TodayView";
import CalendarView from "./components/calendar/CalendarView";
import EventsView from "./components/events/EventsView";
import TasksView from "./components/tasks/TasksView";
import CoursesView from "./components/courses/CoursesView";
import NotesView from "./components/notes/NotesView";
import ProfileView from "./components/profile/ProfileView";
import WorkspaceView from "./components/workspace/WorkspaceView";
import AttendanceView from "./components/attendance/AttendanceView";
import AICompanionView from "./components/ai-companion/AICompanionView";
import ConfirmModal from "./components/ui/ConfirmModal";
import useDeadlineMonitor from "./hooks/useDeadlineMonitor";

// Impor Custom Hooks (Separation of Concerns & Encapsulation)
import useAppTheme from "./hooks/useAppTheme";
import useAppAuth from "./hooks/useAppAuth";
import useFocusTimer from "./hooks/useFocusTimer";
import useAcademicData from "./hooks/useAcademicData";

// Impor ikon untuk navigasi bawah pada perangkat mobile
import { LayoutDashboard, CalendarDays, CheckSquare, FileText, User as UserIcon } from "lucide-react";

export default function App() {
  // --- INSTANSIASI CUSTOM HOOKS ---
  const { theme, setTheme } = useAppTheme();
  const { isAuthenticated, currentUser, handleLoginSuccess, handleSignOut, handleUserUpdate } = useAppAuth();
  const {
    focusTimeLeft,
    setFocusTimeLeft,
    isFocusTimerRunning,
    setIsFocusTimerRunning,
    pomodoroStage,
    setPomodoroStage,
    pomodoroTaskId,
    setPomodoroTaskId,
    completedPomodoroCount,
    setCompletedPomodoroCount,
    workspaceMode,
    setWorkspaceMode,
    lectureTime,
    setLectureTime,
    isLectureRunning,
    setIsLectureRunning,
    activeLectureCourseId,
    setActiveLectureCourseId,
    lectureNoteContent,
    setLectureNoteContent,
    handleResetFocusTimer,
  } = useFocusTimer();

  const {
    courses,
    tasks,
    notes,
    events,
    rescheduledSessions,
    attendanceRecords,
    loadingData,
    handleToggleTaskState,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleAddCourse,
    handleEditCourse,
    handleDeleteCourse,
    handleAddNote,
    handleEditNote,
    handleDeleteNote,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleAddReschedule,
    handleDeleteReschedule,
    handleCreateAttendance,
    handleDeleteAttendance,
  } = useAcademicData(isAuthenticated);

  // --- STATE NAVIGASI LOKAL & PENCARIAN ---
  const [activeTab, setActiveTab] = useState<SidebarTab>(() => {
    const saved = localStorage.getItem("planly_active_tab");
    return (saved as SidebarTab) || "today";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simpan halaman terakhir yang sedang dibuka ke localStorage saat berpindah tab
  useEffect(() => {
    localStorage.setItem("planly_active_tab", activeTab);
  }, [activeTab]);

  // --- KONTROL MODAL OVERLAY LOKAL ---
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isEnrollCourseOpen, setIsEnrollCourseOpen] = useState(false);

  // --- STATE PENGINGAT DEADLINE & AUTO INSPECT ---
  const [autoInspectTaskId, setAutoInspectTaskId] = useState<number | null>(null);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [authStartRegister, setAuthStartRegister] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Otomatis arahkan ke landing page jika status login terputus (logout)
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLandingPage(true);
    }
  }, [isAuthenticated]);

  // Mengaktifkan pemantauan deadline tugas kuliah di latar belakang
  useDeadlineMonitor({
    tasks,
    courses,
    setActiveTab,
    setAutoInspectTaskId,
  });

  // Bersihkan search query setiap kali pindah tab menu
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  // Handler khusus buat logout
  const handleSignOutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  // Berpindah ke tab catatan dan otomatis memfilter berdasarkan kode mata kuliah yang dipilih
  const handleOpenNotesWithCourse = (courseId: number | null) => {
    setActiveTab("notes");
    if (courseId !== null) {
      const courseCode = courses.find((c) => c.id === courseId)?.course_code || "";
      if (courseCode) {
        setSearchQuery(courseCode);
      }
    }
  };

  // --- SWITCH RENDERING VIEW TAB AKTIF ---
  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case "today":
        return (
          <TodayView
            user={currentUser}
            courses={courses}
            tasks={tasks}
            onToggleTaskState={handleToggleTaskState}
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
      case "calendar":
        return (
          <CalendarView
            courses={courses}
            tasks={tasks}
            onToggleTaskState={handleToggleTaskState}
            onOpenAddNewCourseModal={() => {
              setActiveTab("courses");
              setIsEnrollCourseOpen(true);
            }}
            loading={loadingData}
            rescheduledSessions={rescheduledSessions}
            onAddReschedule={handleAddReschedule}
            onDeleteReschedule={handleDeleteReschedule}
            onTabChange={setActiveTab}
            attendanceRecords={attendanceRecords}
            events={events}
          />
        );
      case "events":
        return <EventsView events={events} onAddEvent={handleAddEvent} onEditEvent={handleEditEvent} onDeleteEvent={handleDeleteEvent} searchQuery={searchQuery} loading={loadingData} />;
      case "tasks":
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
      case "courses":
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
      case "notes":
        return <NotesView notes={notes} courses={courses} onAddNote={handleAddNote} onEditNote={handleEditNote} onDeleteNote={handleDeleteNote} searchQuery={searchQuery} loading={loadingData} />;
      case "workspace":
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
            loading={loadingData}
          />
        );
      case "profile":
        return (
          <ProfileView
            user={currentUser}
            onUserUpdate={handleUserUpdate}
            onSignOut={handleSignOutClick}
            theme={theme}
            onThemeChange={setTheme}
            courses={courses}
            tasks={tasks}
            notesCount={notes.length}
            rescheduledSessions={rescheduledSessions}
            events={events}
            loading={loadingData}
          />
        );
      case "attendance":
        return (
          <AttendanceView
            courses={courses}
            rescheduledSessions={rescheduledSessions}
            attendanceRecords={attendanceRecords}
            onSubmitAttendance={handleCreateAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onTabChange={setActiveTab}
            loading={loadingData}
          />
        );
      case "ai-companion":
        return <AICompanionView onAddNote={handleAddNote} onTabChange={setActiveTab} loading={loadingData} />;
      default:
        return null;
    }
  };

  // --- RENDER LANDING PAGE / AUTH VIEW ---
  if (!isAuthenticated || !currentUser) {
    if (showLandingPage) {
      return (
        <LandingView
          theme={theme}
          onThemeChange={setTheme}
          onGoToAuth={(isRegister) => {
            setShowLandingPage(false);
            setAuthStartRegister(isRegister);
          }}
        />
      );
    }
    return <AuthView onLoginSuccess={handleLoginSuccess} onBackToLanding={() => setShowLandingPage(true)} initialRegister={authStartRegister} />;
  }

  // --- RENDER TATA LETAK UTAMA APLIKASI ---
  return (
    <div className="bg-surface text-on-surface font-sans antialiased min-h-screen flex selection:bg-slate-200">
      {/* Sidebar - Samping Kiri (Desktop) / Drawer Slide-out (Mobile) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOutClick}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        focusTimeLeft={focusTimeLeft}
        isFocusTimerRunning={isFocusTimerRunning}
        setIsFocusTimerRunning={setIsFocusTimerRunning}
        onResetFocusTimer={handleResetFocusTimer}
        lectureTime={lectureTime}
        isLectureRunning={isLectureRunning}
        theme={theme}
        pomodoroStage={pomodoroStage}
      />

      {/* Konten Utama */}
      <main className="flex-1 lg:ml-[260px] flex flex-col min-h-screen relative w-full overflow-x-hidden">
        {/* Header Global Sticky */}
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

        {/* Kontainer Render View Dinamis */}
        <div className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-12 animate-fade-in">{renderTabContent()}</div>

        {/* Bottom Nav khusus Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] shadow-md flex justify-around items-center h-16 px-4 z-40">
          <button
            onClick={() => setActiveTab("today")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === "today" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Hari Ini</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === "calendar" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Jadwal</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === "tasks" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Tugas</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === "notes" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Catatan</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeTab === "profile" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Profil</span>
          </button>
        </nav>
      </main>

      {/* Modal Konfirmasi Keluar (Logout) */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => handleSignOut(setActiveTab)}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari Planly? Seluruh sesi belajar dan kelas aktif Anda akan ditutup."
        confirmText="Keluar"
        cancelText="Batal"
        isDanger={true}
      />
    </div>
  );
}
