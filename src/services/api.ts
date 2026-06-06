// =============================================================================
// Planly — API Service Layer (Dual-mode: Mock / Live)
//
// Di sini kita mendefinisikan Service Layer API yang memiliki arsitektur dual-mode.
// Jika variabel lingkungan VITE_USE_MOCK bernilai 'true' (atau tidak diatur ke 'false'),
// sistem akan menggunakan Mock API berbasis localStorage untuk mendukung pengembangan offline.
// Jika bernilai 'false', sistem akan melakukan panggilan HTTP asli menggunakan Axios ke API Laravel.
//
// Semua fungsi di sini menggunakan tipe data yang sama persis dengan kontrak Laravel API.
// Dengan begitu, kita bisa beralih dari mode Mock ke Live tanpa mengubah kode pada komponen React sama sekali.
// =============================================================================

import {
  User, Course, Task, Note,
  LoginResponse, RegisterResponse,
  CourseCreatePayload, CourseUpdatePayload,
  TaskCreatePayload, TaskUpdatePayload,
  NoteCreatePayload, NoteUpdatePayload,
  ProfileUpdatePayload,
  CampusEvent, CampusEventCreatePayload,
  RescheduledSession,
} from '../types';
import { initialUser, initialCourses, initialTasks, initialNotes } from '../mockData';
import httpClient from './httpClient';

// Di sini kita mendeteksi mode yang digunakan berdasarkan environment variable VITE_USE_MOCK.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// --- Mock helpers ---
// Fungsi pembantu (helper) untuk mensimulasikan delay jaringan agar terasa seperti request asli.
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Fungsi pembantu untuk mengambil data dari localStorage dengan fallback jika data belum ada.
// Ini adalah bagian dari mekanisme sinkronisasi cadangan (backup sync) berbasis localStorage kita.
// Kita juga menambahkan pengecekan otomatis untuk mendeteksi data tiruan lama (seperti kode TIF/CS)
// dan langsung membersihkannya agar data tiruan baru (SWU) dapat langsung dimuat tanpa perlu hapus data browser secara manual.
const getStored = <T>(key: string, fallback: T): T => {
  if (key === 'planly_courses') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as any[];
        const hasOldCodes = parsed.some(c => c.course_code && (c.course_code.startsWith('TIF') || c.course_code.startsWith('CS')));
        if (hasOldCodes) {
          localStorage.removeItem('planly_courses');
          localStorage.removeItem('planly_tasks');
          localStorage.removeItem('planly_notes');
          localStorage.removeItem('planly_user');
          localStorage.removeItem('planly_token');
          localStorage.removeItem('planly_auth');
          // Muat ulang halaman agar state aplikasi kembali ke data inisial
          setTimeout(() => window.location.reload(), 100);
          return fallback;
        }
      } catch (e) {
        console.error("Gagal melakukan verifikasi data localStorage:", e);
      }
    }
  }
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

// Fungsi pembantu untuk menyimpan data ke localStorage agar tersinkronisasi sebagai cadangan lokal.
const setStored = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Counter ID untuk data mock baru agar tidak bertabrakan dengan ID dari data seed awal.
let mockIdCounter = 100; // Start high to avoid collisions with seed data

// =============================================================================
// AUTH SERVICE SECTION
// Layanan yang mengurus autentikasi pengguna seperti login, register, dan logout.
// =============================================================================

const authService = {
  /**
   * POST /api/auth/login
   * Digunakan untuk masuk (login) ke dalam sistem. Mengembalikan token dan data user.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await delay(500);
      if (!email.trim() || !password.trim()) {
        throw new Error('Email dan kata sandi wajib diisi.');
      }
      // Di sini kita memvalidasi kredensial login secara lokal khusus untuk Arief Sidik.
      // Email harus 'arfwjn@gmail.com' dan password harus 'ariefsidik'.
      if (email !== 'arfwjn@gmail.com' || password !== 'ariefsidik') {
        throw new Error('Email atau kata sandi salah.');
      }
      // Mengambil data user yang tersimpan di localStorage atau menggunakan initialUser jika kosong.
      const user = getStored<User>('planly_user', initialUser);
      setStored('planly_user', user);
      const token = `mock_token_${Date.now()}`;
      // Menyimpan token dan status autentikasi ke localStorage untuk keperluan backup sync.
      localStorage.setItem('planly_token', token);
      localStorage.setItem('planly_auth', 'true');
      return { token, user };
    }

    // Melakukan panggilan API asli ke server Laravel jika tidak dalam mode mock.
    const { data } = await httpClient.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('planly_token', data.token);
    localStorage.setItem('planly_auth', 'true');
    return data;
  },

  /**
   * POST /api/auth/register
   * Mendaftarkan akun user baru ke dalam sistem.
   */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    nim?: string;
  }): Promise<RegisterResponse> => {
    if (USE_MOCK) {
      await delay(600);
      if (!payload.name.trim() || !payload.email.trim()) {
        throw new Error('Harap lengkapi seluruh kolom pendaftaran.');
      }
      // Membuat data user baru dengan ID mock dan foto profil default.
      const newUser: User = {
        id: ++mockIdCounter,
        name: payload.name,
        email: payload.email,
        nim: payload.nim || null,
        major: null,
        semester: null,
        profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFoYkxvSC3Tl7Lha5JHOML3Cc2hYx5Hhoh_yA__QxGX6rbapw7zZtOvOWuvFsVnxR6nNGtzUzrFVJFfu_G8hudADmzAZDH1shSH7Mr3tS3ufjyGaU-d9hD3ArSwarBm1TR6cXqN2MiMoTBst4W8NxtPjM2uwHLLKhojSWGvUBep5mGtAO3VbZakDBXlptVD5J5wPcgTnWXzbc81YIbapCO5hSMDAgnhL_lL7dx-K2jpfWn0MgiODu-J2up9aV3_2Kd9JpojgjSs9g4',
      };
      // Menyimpan data user baru ke localStorage untuk sinkronisasi.
      setStored('planly_user', newUser);
      localStorage.setItem('planly_auth', 'true');
      const token = `mock_token_${Date.now()}`;
      localStorage.setItem('planly_token', token);
      return { message: 'Pendaftaran berhasil', user: newUser };
    }

    const { data } = await httpClient.post<RegisterResponse>('/auth/register', payload);
    return data;
  },

  /**
   * POST /api/logout
   * Mengeluarkan pengguna dari sistem dan membersihkan token dari localStorage.
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(200);
      localStorage.removeItem('planly_token');
      localStorage.removeItem('planly_auth');
      return;
    }

    try {
      await httpClient.post('/logout');
    } finally {
      localStorage.removeItem('planly_token');
      localStorage.removeItem('planly_auth');
    }
  },
};

// =============================================================================
// PROFILE SERVICE SECTION
// Layanan untuk mengambil dan memperbarui data profil pengguna saat ini.
// =============================================================================

const profileService = {
  /**
   * GET /api/profile
   * Mengambil data profil user yang sedang login.
   */
  get: async (): Promise<User> => {
    if (USE_MOCK) {
      await delay(200);
      // Di sini kita mengambil data profil user dari localStorage.
      return getStored<User>('planly_user', initialUser);
    }
    const { data } = await httpClient.get<User>('/profile');
    return data;
  },

  /**
   * PUT /api/profile
   * Memperbarui data profil user saat ini.
   */
  update: async (payload: ProfileUpdatePayload): Promise<User> => {
    if (USE_MOCK) {
      await delay(400);
      const current = getStored<User>('planly_user', initialUser);
      const updated = { ...current, ...payload };
      // Menyimpan pembaruan profil ke localStorage agar tersinkronisasi secara lokal.
      setStored('planly_user', updated);
      return updated;
    }
    const { data } = await httpClient.post<User>('/profile/update', payload);
    return data;
  },
};

// =============================================================================
// COURSES SERVICE SECTION
// Layanan untuk mengelola data Mata Kuliah (Courses).
// =============================================================================

const coursesService = {
  /**
   * GET /api/courses
   * Mengambil semua daftar Mata Kuliah.
   */
  getAll: async (): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(300);
      // Mengambil daftar mata kuliah dari local storage backup.
      return getStored<Course[]>('planly_courses', initialCourses);
    }
    const { data } = await httpClient.get<Course[]>('/courses');
    return data;
  },

  /**
   * POST /api/courses
   * Membuat Mata Kuliah baru.
   */
  create: async (payload: CourseCreatePayload): Promise<Course> => {
    if (USE_MOCK) {
      await delay(400);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      const newCourse: Course = {
        ...payload,
        id: ++mockIdCounter,
        user_id: 1,
        color_hex: payload.color_hex || '#3498db',
      };
      // Menyimpan data mata kuliah baru ke localStorage backup sync.
      setStored('planly_courses', [...courses, newCourse]);
      return newCourse;
    }
    const { data } = await httpClient.post<Course>('/courses', payload);
    return data;
  },

  /**
   * GET /api/courses/{id}
   * Mengambil detail satu Mata Kuliah berdasarkan ID.
   */
  show: async (id: number): Promise<Course> => {
    if (USE_MOCK) {
      await delay(200);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      const course = courses.find(c => c.id === id);
      if (!course) throw new Error('Mata Kuliah tidak ditemukan.');
      return course;
    }
    const { data } = await httpClient.get<Course>(`/courses/${id}`);
    return data;
  },

  /**
   * PUT /api/courses/{id}
   * Memperbarui informasi Mata Kuliah yang sudah ada.
   */
  update: async (id: number, payload: CourseUpdatePayload): Promise<Course> => {
    if (USE_MOCK) {
      await delay(400);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      const index = courses.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Mata Kuliah tidak ditemukan.');
      const updated = [...courses];
      updated[index] = { ...updated[index], ...payload };
      // Menyimpan hasil pembaruan mata kuliah ke localStorage backup sync.
      setStored('planly_courses', updated);
      return updated[index];
    }
    const { data } = await httpClient.put<Course>(`/courses/${id}`, payload);
    return data;
  },

  /**
   * DELETE /api/courses/{id}
   * Menghapus Mata Kuliah tertentu.
   */
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(400);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      setStored('planly_courses', courses.filter(c => c.id !== id));

      // Cascade delete / update: Jika mata kuliah dihapus,
      // kita atur field course_id menjadi null pada tugas (tasks) dan catatan (notes) yang bersangkutan.
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      setStored('planly_tasks', tasks.map(t => t.course_id === id ? { ...t, course_id: null } : t));

      const notes = getStored<Note[]>('planly_notes', initialNotes);
      setStored('planly_notes', notes.map(n => n.course_id === id ? { ...n, course_id: null } : n));
      return;
    }
    await httpClient.delete(`/courses/${id}`);
  },
};

// =============================================================================
// TASKS SERVICE SECTION
// Layanan untuk mengelola data Tugas (Tasks).
// =============================================================================

const tasksService = {
  /**
   * GET /api/tasks
   * Mengambil semua daftar Tugas (opsional difilter berdasarkan course_id).
   */
  getAll: async (courseId?: number): Promise<Task[]> => {
    if (USE_MOCK) {
      await delay(300);
      let tasks = getStored<Task[]>('planly_tasks', initialTasks);
      if (courseId !== undefined) {
        tasks = tasks.filter(t => t.course_id === courseId);
      }
      return tasks;
    }
    const params = courseId !== undefined ? { course_id: courseId } : {};
    const { data } = await httpClient.get<Task[]>('/tasks', { params });
    return data;
  },

  /**
   * POST /api/tasks
   * Membuat Tugas baru.
   */
  create: async (payload: TaskCreatePayload): Promise<Task> => {
    if (USE_MOCK) {
      await delay(400);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      const newTask: Task = {
        ...payload,
        id: ++mockIdCounter,
        user_id: 1,
        is_finished: payload.is_finished ?? false,
        is_priority: payload.is_priority ?? false,
      };
      // Menyimpan tugas baru ke dalam daftar lokal di localStorage.
      setStored('planly_tasks', [newTask, ...tasks]);
      return newTask;
    }
    const { data } = await httpClient.post<Task>('/tasks', payload);
    return data;
  },

  /**
   * GET /api/tasks/{id}
   * Mengambil detail satu Tugas berdasarkan ID.
   */
  show: async (id: number): Promise<Task> => {
    if (USE_MOCK) {
      await delay(200);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Tugas tidak ditemukan.');
      return task;
    }
    const { data } = await httpClient.get<Task>(`/tasks/${id}`);
    return data;
  },

  /**
   * PUT /api/tasks/{id}
   * Memperbarui data Tugas secara keseluruhan.
   */
  update: async (id: number, payload: TaskUpdatePayload): Promise<Task> => {
    if (USE_MOCK) {
      await delay(400);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tugas tidak ditemukan.');
      const updated = [...tasks];
      updated[index] = { ...updated[index], ...payload };
      // Menyimpan hasil pembaruan tugas ke localStorage.
      setStored('planly_tasks', updated);
      return updated[index];
    }
    const { data } = await httpClient.put<Task>(`/tasks/${id}`, payload);
    return data;
  },

  /**
   * PATCH /api/tasks/{id}/finish
   * Mengubah status penyelesaian (is_finished) dari suatu Tugas.
   */
  finish: async (id: number): Promise<Task> => {
    if (USE_MOCK) {
      await delay(200);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tugas tidak ditemukan.');
      const updated = [...tasks];
      updated[index] = { ...updated[index], is_finished: !updated[index].is_finished };
      // Menyimpan perubahan status is_finished ke localStorage.
      setStored('planly_tasks', updated);
      return updated[index];
    }
    const { data } = await httpClient.patch<Task>(`/tasks/${id}/finish`);
    return data;
  },

  /**
   * DELETE /api/tasks/{id}
   * Menghapus Tugas tertentu.
   */
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      setStored('planly_tasks', tasks.filter(t => t.id !== id));
      return;
    }
    await httpClient.delete(`/tasks/${id}`);
  },
};

// =============================================================================
// NOTES SERVICE SECTION
// Layanan untuk mengelola Catatan (Notes).
// =============================================================================

const notesService = {
  /**
   * GET /api/notes
   * Mengambil semua daftar Catatan.
   */
  getAll: async (): Promise<Note[]> => {
    if (USE_MOCK) {
      await delay(300);
      // Mengambil catatan yang ter-backup di localStorage.
      return getStored<Note[]>('planly_notes', initialNotes);
    }
    const { data } = await httpClient.get<Note[]>('/notes');
    return data;
  },

  /**
   * POST /api/notes
   * Membuat Catatan baru.
   */
  create: async (payload: NoteCreatePayload): Promise<Note> => {
    if (USE_MOCK) {
      await delay(400);
      const notes = getStored<Note[]>('planly_notes', initialNotes);
      const newNote: Note = {
        ...payload,
        id: ++mockIdCounter,
        user_id: 1,
      };
      // Menyimpan catatan baru ke localStorage backup sync.
      setStored('planly_notes', [newNote, ...notes]);
      return newNote;
    }
    const { data } = await httpClient.post<Note>('/notes', payload);
    return data;
  },

  /**
   * GET /api/notes/{id}
   * Mengambil detail satu Catatan berdasarkan ID.
   */
  show: async (id: number): Promise<Note> => {
    if (USE_MOCK) {
      await delay(200);
      const notes = getStored<Note[]>('planly_notes', initialNotes);
      const note = notes.find(n => n.id === id);
      if (!note) throw new Error('Catatan tidak ditemukan.');
      return note;
    }
    const { data } = await httpClient.get<Note>(`/notes/${id}`);
    return data;
  },

  /**
   * PUT /api/notes/{id}
   * Memperbarui isi Catatan yang sudah ada.
   */
  update: async (id: number, payload: NoteUpdatePayload): Promise<Note> => {
    if (USE_MOCK) {
      await delay(400);
      const notes = getStored<Note[]>('planly_notes', initialNotes);
      const index = notes.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Catatan tidak ditemukan.');
      const updated = [...notes];
      updated[index] = { ...updated[index], ...payload };
      // Menyimpan hasil update catatan ke localStorage.
      setStored('planly_notes', updated);
      return updated[index];
    }
    const { data } = await httpClient.put<Note>(`/notes/${id}`, payload);
    return data;
  },

  /**
   * DELETE /api/notes/{id}
   * Menghapus Catatan tertentu.
   */
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      const notes = getStored<Note[]>('planly_notes', initialNotes);
      setStored('planly_notes', notes.filter(n => n.id !== id));
      return;
    }
    await httpClient.delete(`/notes/${id}`);
  },
};

// =============================================================================
// CAMPUS EVENTS SERVICE SECTION
// =============================================================================
const initialEvents: CampusEvent[] = [
  {
    id: 1,
    user_id: 1,
    event_name: 'Seminar Nasional AI & Web Development',
    category: 'seminar',
    description: 'Seminar nasional mengenai masa depan Web Development di era kecerdasan buatan.',
    event_date: new Date().toLocaleDateString('en-CA'), // Hari ini
    start_time: '09:00',
    end_time: '12:00',
    location: 'Auditorium SWU Lantai 3',
    organizer: 'Himpunan Mahasiswa Informatika',
    color_hex: '#6366F1',
    is_important: true
  },
  {
    id: 2,
    user_id: 1,
    event_name: 'Workshop Flutter Advanced',
    category: 'workshop',
    description: 'Belajar State Management Bloc dan Clean Architecture di Flutter.',
    event_date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toLocaleDateString('en-CA');
    })(), // 2 hari lagi
    start_time: '13:00',
    end_time: '16:00',
    location: 'Lab Komputer 3',
    organizer: 'Google Developer Student Clubs SWU',
    color_hex: '#F59E0B',
    is_important: false
  }
];

const eventsService = {
  getAll: async (): Promise<CampusEvent[]> => {
    if (USE_MOCK) {
      await delay(300);
      return getStored<CampusEvent[]>('planly_events', initialEvents);
    }
    const { data } = await httpClient.get<CampusEvent[]>('/events');
    return data;
  },
  create: async (payload: CampusEventCreatePayload): Promise<CampusEvent> => {
    if (USE_MOCK) {
      await delay(400);
      const events = getStored<CampusEvent[]>('planly_events', initialEvents);
      const newEvent: CampusEvent = {
        ...payload,
        id: ++mockIdCounter,
        user_id: 1,
      };
      setStored('planly_events', [newEvent, ...events]);
      return newEvent;
    }
    const { data } = await httpClient.post<CampusEvent>('/events', payload);
    return data;
  },
  update: async (id: number, payload: Partial<CampusEventCreatePayload>): Promise<CampusEvent> => {
    if (USE_MOCK) {
      await delay(400);
      const events = getStored<CampusEvent[]>('planly_events', initialEvents);
      const index = events.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Event tidak ditemukan.');
      const updated = [...events];
      updated[index] = { ...updated[index], ...payload };
      setStored('planly_events', updated);
      return updated[index];
    }
    const { data } = await httpClient.put<CampusEvent>(`/events/${id}`, payload);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      const events = getStored<CampusEvent[]>('planly_events', initialEvents);
      setStored('planly_events', events.filter(e => e.id !== id));
      return;
    }
    await httpClient.delete(`/events/${id}`);
  }
};

// =============================================================================
// RESCHEDULED SESSIONS SERVICE SECTION
// =============================================================================
const initialReschedules: RescheduledSession[] = [
  {
    id: 1,
    course_id: 1,
    original_date: (() => {
      const d = new Date();
      return d.toLocaleDateString('en-CA');
    })(),
    new_date: null,
    new_start_time: null,
    new_end_time: null,
    is_canceled: true,
    note: 'Pertemuan perdana dibatalkan karena dosen rapat rektorat'
  }
];

const reschedulesService = {
  getAll: async (): Promise<RescheduledSession[]> => {
    if (USE_MOCK) {
      await delay(300);
      return getStored<RescheduledSession[]>('planly_reschedules', initialReschedules);
    }
    const { data } = await httpClient.get<RescheduledSession[]>('/reschedules');
    return data;
  },
  create: async (payload: Omit<RescheduledSession, 'id'>): Promise<RescheduledSession> => {
    if (USE_MOCK) {
      await delay(400);
      const reschedules = getStored<RescheduledSession[]>('planly_reschedules', initialReschedules);
      const newReschedule: RescheduledSession = {
        ...payload,
        id: ++mockIdCounter,
      };
      setStored('planly_reschedules', [newReschedule, ...reschedules]);
      return newReschedule;
    }
    const { data } = await httpClient.post<RescheduledSession>('/reschedules', payload);
    return data;
  },
  delete: async (courseId: number, originalDate: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      const reschedules = getStored<RescheduledSession[]>('planly_reschedules', initialReschedules);
      const filtered = reschedules.filter(r => !(r.course_id === courseId && r.original_date === originalDate));
      setStored('planly_reschedules', filtered);
      return;
    }
    await httpClient.delete(`/reschedules/${courseId}/${originalDate}`);
  }
};

// =============================================================================
// EXPORT — unified API object
// Kita menyatukan semua service section di atas ke dalam satu objek 'api'
// agar lebih rapi dan mudah diimpor di bagian aplikasi lainnya.
// =============================================================================

export const api = {
  auth: authService,
  profile: profileService,
  courses: coursesService,
  tasks: tasksService,
  notes: notesService,
  events: eventsService,
  reschedules: reschedulesService,
};
