// =============================================================================
// Planly — useAcademicData Custom Hook (Manajemen Database Akademik)
//
// Hook ini bertugas buat narik data akademik secara paralel pas user berhasil login,
// mengelola state lokal, dan nge-handle operasi CRUD (tambah, edit, hapus) untuk
// semua entitas: Courses, Tasks, Notes, Events, Reschedules, dan Attendance.
// =============================================================================

import { useState, useEffect } from 'react';
import { Course, Task, Note, CampusEvent, RescheduledSession, AttendanceRecord, AttendanceSubmitPayload } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { calendarSyncService } from '../services/calendar/calendarSync';

export default function useAcademicData(isAuthenticated: boolean) {
  const toast = useToast();

  // --- STATE DATABASE LOKAL ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [rescheduledSessions, setRescheduledSessions] = useState<RescheduledSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingData, setLoadingData] = useState(() => {
    return localStorage.getItem('planly_auth') === 'true';
  });

  // Ambil semua data akademik dari API secara paralel (paralel fetching) pas user terautentikasi
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingData(true);
      Promise.all([
        api.courses.getAll(),
        api.tasks.getAll(),
        api.notes.getAll(),
        api.events.getAll(),
        api.reschedules.getAll(),
        api.attendance.getAll()
      ]).then(([c, t, n, e, r, a]) => {
        setCourses(c);
        setTasks(t);
        setNotes(n);
        setEvents(e);
        setRescheduledSessions(r);
        setAttendanceRecords(a);
        setLoadingData(false);
      }).catch(err => {
        console.error("Gagal memuat data dari REST API", err);
        setLoadingData(false);
      });
    }
  }, [isAuthenticated]);

  // --- HANDLER TUGAS (TASKS) ---
  const handleToggleTaskState = (taskId: number) => {
    api.tasks.finish(taskId).then((updatedTask) => {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      calendarSyncService.syncItem('update', 'task', updatedTask.task_title, toast);
    }).catch(err => toast.error(err.message));
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'user_id'>, silent = false) => {
    return api.tasks.create(newTask).then((createdTask) => {
      setTasks((prev) => [createdTask, ...prev]);
      if (!silent) {
        toast.success('Tugas baru berhasil ditambahkan.');
      }
      calendarSyncService.syncItem('create', 'task', createdTask.task_title, toast);
      return createdTask;
    }).catch(err => {
      toast.error(err.message);
      throw err;
    });
  };

  const handleEditTask = (taskId: number, updatedTask: Partial<Task>) => {
    api.tasks.update(taskId, updatedTask).then((savedTask) => {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? savedTask : t)));
      toast.success('Tugas berhasil diperbarui.');
      calendarSyncService.syncItem('update', 'task', savedTask.task_title, toast);
    }).catch(err => toast.error(err.message));
  };

  const handleDeleteTask = (taskId: number) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    const taskTitle = taskToDelete ? taskToDelete.task_title : 'Tugas';
    api.tasks.delete(taskId).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      calendarSyncService.syncItem('delete', 'task', taskTitle, toast);
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER MATA KULIAH (COURSES) ---
  const handleAddCourse = (newCourse: Omit<Course, 'id' | 'user_id'>) => {
    api.courses.create(newCourse).then((createdCourse) => {
      setCourses((prev) => [...prev, createdCourse]);
      toast.success('Mata Kuliah berhasil didaftarkan.');
      calendarSyncService.syncItem('create', 'course', createdCourse.course_name, toast);
    }).catch(err => toast.error(err.message));
  };

  const handleEditCourse = (courseId: number, updatedCourse: Partial<Course>) => {
    api.courses.update(courseId, updatedCourse).then((savedCourse) => {
      setCourses((prev) => prev.map((c) => (c.id === courseId ? savedCourse : c)));
      api.tasks.getAll().then(setTasks);
      api.notes.getAll().then(setNotes);
      toast.success('Mata Kuliah berhasil diperbarui.');
      calendarSyncService.syncItem('update', 'course', savedCourse.course_name, toast);
    }).catch(err => toast.error(err.message));
  };

  const handleDeleteCourse = (courseId: number) => {
    const courseToDelete = courses.find((c) => c.id === courseId);
    const courseName = courseToDelete ? courseToDelete.course_name : 'Mata Kuliah';
    api.courses.delete(courseId).then(() => {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      api.tasks.getAll().then(setTasks);
      api.notes.getAll().then(setNotes);
      calendarSyncService.syncItem('delete', 'course', courseName, toast);
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER CATATAN (NOTES) ---
  const handleAddNote = (newNote: Omit<Note, 'id' | 'user_id'>) => {
    api.notes.create(newNote).then((createdNote) => {
      setNotes((prev) => [createdNote, ...prev]);
      toast.success('Catatan baru berhasil disimpan.');
    }).catch(err => toast.error(err.message));
  };

  const handleEditNote = (noteId: number, updatedNote: Partial<Note>) => {
    api.notes.update(noteId, updatedNote).then((savedNote) => {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? savedNote : n)));
      toast.success('Catatan berhasil diperbarui.');
    }).catch(err => toast.error(err.message));
  };

  const handleDeleteNote = (noteId: number) => {
    api.notes.delete(noteId).then(() => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER EVENT KAMPUS ---
  const handleAddEvent = (newEvent: Omit<CampusEvent, 'id' | 'user_id'>) => {
    api.events.create(newEvent).then((createdEvent) => {
      setEvents((prev) => [createdEvent, ...prev]);
      toast.success('Event baru berhasil ditambahkan.');
      calendarSyncService.syncItem('create', 'event', createdEvent.event_name, toast);
    }).catch(err => toast.error(err.message));
  };

  const handleEditEvent = (eventId: number, updatedEvent: Partial<CampusEvent>) => {
    api.events.update(eventId, updatedEvent).then((savedEvent) => {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? savedEvent : e)));
      toast.success('Event berhasil diperbarui.');
      calendarSyncService.syncItem('update', 'event', savedEvent.event_name, toast);
    }).catch(err => toast.error(err.message));
  };

  const handleDeleteEvent = (eventId: number) => {
    const eventToDelete = events.find((e) => e.id === eventId);
    const eventName = eventToDelete ? eventToDelete.event_name : 'Event';
    api.events.delete(eventId).then(() => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event berhasil dihapus.');
      calendarSyncService.syncItem('delete', 'event', eventName, toast);
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER RESCHEDULE KULIAH ---
  const handleAddReschedule = (session: Omit<RescheduledSession, 'id'>) => {
    const course = courses.find((c) => c.id === session.course_id);
    const courseName = course ? course.course_name : 'Mata Kuliah';
    api.reschedules.create(session).then((created) => {
      setRescheduledSessions((prev) => [created, ...prev]);
      toast.success(session.is_canceled ? 'Sesi kuliah berhasil dibatalkan.' : 'Sesi kuliah berhasil dipindahkan.');
      calendarSyncService.syncItem('create', 'reschedule', courseName, toast);
    }).catch(err => toast.error(err.message));
  };

  const handleDeleteReschedule = (courseId: number, originalDate: string) => {
    const course = courses.find((c) => c.id === courseId);
    const courseName = course ? course.course_name : 'Mata Kuliah';
    api.reschedules.delete(courseId, originalDate).then(() => {
      setRescheduledSessions((prev) =>
        prev.filter((r) => !(r.course_id === courseId && r.original_date === originalDate))
      );
      toast.success('Jadwal kuliah dikembalikan ke sesi normal.');
      calendarSyncService.syncItem('delete', 'reschedule', courseName, toast);
    }).catch(err => toast.error(err.message));
  };

  // --- HANDLER ABSENSI MAHASISWA ---
  const handleCreateAttendance = async (payload: AttendanceSubmitPayload) => {
    try {
      const newRecord = await api.attendance.submit(payload);
      setAttendanceRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan absensi.');
      throw new Error(err.message || 'Gagal menyimpan absensi.');
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    try {
      await api.attendance.delete(id);
      setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success('Riwayat presensi berhasil dihapus.');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus riwayat presensi.');
    }
  };

  return {
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
    handleDeleteAttendance
  };
}
