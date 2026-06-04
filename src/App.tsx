import { useState, useEffect } from 'react';
import { User, Course, Task, Note, SidebarTab, LoginResponse } from './types';
import { api } from './services/api';

// Component Imports
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import TasksView from './components/TasksView';
import CoursesView from './components/CoursesView';
import NotesView from './components/NotesView';
import ProfileView from './components/ProfileView';

// Mobile Bottom Nav Icons
import { LayoutDashboard, CalendarDays, CheckSquare, FileText, User as UserIcon, Menu } from 'lucide-react';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('planly_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('planly_user');
    return saved ? JSON.parse(saved) : null;
  });

  // App Database states
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Global Navigation & Search
  const [activeTab, setActiveTab] = useState<SidebarTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Overlay Controls
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isEnrollCourseOpen, setIsEnrollCourseOpen] = useState(false);


  // Load database from API
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingData(true);
      Promise.all([
        api.courses.getAll(),
        api.tasks.getAll(),
        api.notes.getAll()
      ]).then(([c, t, n]) => {
        setCourses(c);
        setTasks(t);
        setNotes(n);
        setLoadingData(false);
      }).catch(err => {
        console.error("Error loading data from api", err);
        setLoadingData(false);
      });
    }
  }, [isAuthenticated]);

  // Clean Search parameter upon route/tab changes
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  // Handlers
  const handleLoginSuccess = (loginResponse: LoginResponse) => {
    setCurrentUser(loginResponse.user);
    localStorage.setItem('planly_user', JSON.stringify(loginResponse.user));
    setIsAuthenticated(true);
  };

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

  const handleUserUpdate = (payload: Partial<User>) => {
    api.profile.update(payload).then((savedUser) => {
      setCurrentUser(savedUser);
      localStorage.setItem('planly_user', JSON.stringify(savedUser));
    }).catch(err => alert(err.message));
  };

  const handleToggleTaskState = (taskId: number) => {
    api.tasks.finish(taskId).then((updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
    }).catch(err => alert(err.message));
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'user_id'>) => {
    api.tasks.create(newTask).then((createdTask) => {
      setTasks((prev) => [createdTask, ...prev]);
      alert('Tugas baru berhasil ditambahkan.');
    }).catch(err => alert(err.message));
  };

  const handleEditTask = (taskId: number, updatedTask: Partial<Task>) => {
    api.tasks.update(taskId, updatedTask).then((savedTask) => {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? savedTask : t)));
      alert('Tugas berhasil diperbarui.');
    }).catch(err => alert(err.message));
  };

  const handleDeleteTask = (taskId: number) => {
    api.tasks.delete(taskId).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }).catch(err => alert(err.message));
  };

  const handleAddCourse = (newCourse: Omit<Course, 'id' | 'user_id'>) => {
    api.courses.create(newCourse).then((createdCourse) => {
      setCourses((prev) => [...prev, createdCourse]);
      alert('Mata Kuliah berhasil didaftarkan.');
    }).catch(err => alert(err.message));
  };

  const handleEditCourse = (courseId: number, updatedCourse: Partial<Course>) => {
    api.courses.update(courseId, updatedCourse).then((savedCourse) => {
      setCourses((prev) => prev.map((c) => (c.id === courseId ? savedCourse : c)));
      api.tasks.getAll().then(setTasks);
      api.notes.getAll().then(setNotes);
      alert('Mata Kuliah berhasil diperbarui.');
    }).catch(err => alert(err.message));
  };

  const handleDeleteCourse = (courseId: number) => {
    api.courses.delete(courseId).then(() => {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      api.tasks.getAll().then(setTasks);
      api.notes.getAll().then(setNotes);
    }).catch(err => alert(err.message));
  };

  const handleAddNote = (newNote: Omit<Note, 'id' | 'user_id'>) => {
    api.notes.create(newNote).then((createdNote) => {
      setNotes((prev) => [createdNote, ...prev]);
      alert('Catatan baru berhasil disimpan.');
    }).catch(err => alert(err.message));
  };

  const handleEditNote = (noteId: number, updatedNote: Partial<Note>) => {
    api.notes.update(noteId, updatedNote).then((savedNote) => {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? savedNote : n)));
      alert('Catatan berhasil diperbarui.');
    }).catch(err => alert(err.message));
  };

  const handleDeleteNote = (noteId: number) => {
    api.notes.delete(noteId).then(() => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }).catch(err => alert(err.message));
  };

  // Switch to specific notes with a course filter
  const handleOpenNotesWithCourse = (courseId: number | null) => {
    setActiveTab('notes');
    if (courseId !== null) {
      const courseCode = courses.find(c => c.id === courseId)?.course_code || '';
      if (courseCode) {
        setSearchQuery(courseCode);
      }
    }
  };

  // Content Loader Switch
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
          />
        );
      case 'calendar':
        return (
          <CalendarView
            courses={courses}
            onOpenAddNewCourseModal={() => setIsEnrollCourseOpen(true)}
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
          />
        );
      case 'profile':
        return (
          <ProfileView
            user={currentUser}
            onUserUpdate={handleUserUpdate}
            onSignOut={handleSignOut}
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated || !currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-surface text-on-surface font-sans antialiased min-h-screen flex selection:bg-slate-200">
      
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTaskClick={() => setIsNewTaskOpen(true)}
        onSignOut={handleSignOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Core View Area */}
      <main className="flex-1 lg:ml-[260px] flex flex-col min-h-screen relative w-full overflow-x-hidden">
        
        {/* Global sticky Header */}
        <Header
          user={currentUser}
          onMenuToggle={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
        />

        {/* Dynamic content rendering with mobile-responsive layouts constraints */}
        <div className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8 pb-24 lg:pb-12">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-on-surface-variant">Memuat data akademi...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        {/* Bottom Navigation Bar for Mobile viewports */}
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] shadow-md flex justify-around items-center h-16 px-4 z-40">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'today' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Today</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'calendar' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'tasks' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'notes' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Profile</span>
          </button>
        </nav>

      </main>
    </div>
  );
}
