// =============================================================================
// Planly — API Service Layer (Dual-mode: Mock / Live)
//
// When VITE_USE_MOCK=true  → localStorage-based mock (offline development)
// When VITE_USE_MOCK=false → Real HTTP calls via Axios to Laravel API
//
// All method signatures use the exact same types as the Laravel API contract.
// Switching from mock to live requires ZERO code changes in components.
// =============================================================================

import {
  User, Course, Task, Note,
  LoginResponse, RegisterResponse,
  CourseCreatePayload, CourseUpdatePayload,
  TaskCreatePayload, TaskUpdatePayload,
  NoteCreatePayload, NoteUpdatePayload,
  ProfileUpdatePayload,
} from '../types';
import { initialUser, initialCourses, initialTasks, initialNotes } from '../mockData';
import httpClient from './httpClient';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// --- Mock helpers ---
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const getStored = <T>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

const setStored = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

let mockIdCounter = 100; // Start high to avoid collisions with seed data

// =============================================================================
// AUTH
// =============================================================================

const authService = {
  /**
   * POST /api/auth/login
   * Returns { token, user }
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await delay(500);
      if (!email.trim() || !password.trim()) {
        throw new Error('Email dan password wajib diisi.');
      }
      if (email === 'error@example.com') {
        throw new Error('Invalid email or password');
      }
      const user = getStored<User>('planly_user', initialUser);
      const updatedUser = { ...user, email };
      setStored('planly_user', updatedUser);
      const token = `mock_token_${Date.now()}`;
      localStorage.setItem('planly_token', token);
      localStorage.setItem('planly_auth', 'true');
      return { token, user: updatedUser };
    }

    const { data } = await httpClient.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('planly_token', data.token);
    localStorage.setItem('planly_auth', 'true');
    return data;
  },

  /**
   * POST /api/auth/register
   * Returns { message, user }
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
      const newUser: User = {
        id: ++mockIdCounter,
        name: payload.name,
        email: payload.email,
        nim: payload.nim || null,
        major: null,
        semester: null,
        profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFoYkxvSC3Tl7Lha5JHOML3Cc2hYx5Hhoh_yA__QxGX6rbapw7zZtOvOWuvFsVnxR6nNGtzUzrFVJFfu_G8hudADmzAZDH1shSH7Mr3tS3ufjyGaU-d9hD3ArSwarBm1TR6cXqN2MiMoTBst4W8NxtPjM2uwHLLKhojSWGvUBep5mGtAO3VbZakDBXlptVD5J5wPcgTnWXzbc81YIbapCO5hSMDAgnhL_lL7dx-K2jpfWn0MgiODu-J2up9aV3_2Kd9JpojgjSs9g4',
      };
      setStored('planly_user', newUser);
      localStorage.setItem('planly_auth', 'true');
      const token = `mock_token_${Date.now()}`;
      localStorage.setItem('planly_token', token);
      return { message: 'Registration successful', user: newUser };
    }

    const { data } = await httpClient.post<RegisterResponse>('/auth/register', payload);
    return data;
  },

  /**
   * POST /api/logout
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
// PROFILE
// =============================================================================

const profileService = {
  /**
   * GET /api/profile
   */
  get: async (): Promise<User> => {
    if (USE_MOCK) {
      await delay(200);
      return getStored<User>('planly_user', initialUser);
    }
    const { data } = await httpClient.get<User>('/profile');
    return data;
  },

  /**
   * PUT /api/profile
   */
  update: async (payload: ProfileUpdatePayload): Promise<User> => {
    if (USE_MOCK) {
      await delay(400);
      const current = getStored<User>('planly_user', initialUser);
      const updated = { ...current, ...payload };
      setStored('planly_user', updated);
      return updated;
    }
    const { data } = await httpClient.put<User>('/profile', payload);
    return data;
  },
};

// =============================================================================
// COURSES
// =============================================================================

const coursesService = {
  /**
   * GET /api/courses
   */
  getAll: async (): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(300);
      return getStored<Course[]>('planly_courses', initialCourses);
    }
    const { data } = await httpClient.get<Course[]>('/courses');
    return data;
  },

  /**
   * POST /api/courses
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
      setStored('planly_courses', [...courses, newCourse]);
      return newCourse;
    }
    const { data } = await httpClient.post<Course>('/courses', payload);
    return data;
  },

  /**
   * GET /api/courses/{id}
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
   */
  update: async (id: number, payload: CourseUpdatePayload): Promise<Course> => {
    if (USE_MOCK) {
      await delay(400);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      const index = courses.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Mata Kuliah tidak ditemukan.');
      const updated = [...courses];
      updated[index] = { ...updated[index], ...payload };
      setStored('planly_courses', updated);
      return updated[index];
    }
    const { data } = await httpClient.put<Course>(`/courses/${id}`, payload);
    return data;
  },

  /**
   * DELETE /api/courses/{id}
   */
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(400);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      setStored('planly_courses', courses.filter(c => c.id !== id));

      // Cascade: set course_id to null for related tasks/notes
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
// TASKS
// =============================================================================

const tasksService = {
  /**
   * GET /api/tasks
   * Optional: GET /api/tasks?course_id=X
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
      setStored('planly_tasks', [newTask, ...tasks]);
      return newTask;
    }
    const { data } = await httpClient.post<Task>('/tasks', payload);
    return data;
  },

  /**
   * GET /api/tasks/{id}
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
   */
  update: async (id: number, payload: TaskUpdatePayload): Promise<Task> => {
    if (USE_MOCK) {
      await delay(400);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tugas tidak ditemukan.');
      const updated = [...tasks];
      updated[index] = { ...updated[index], ...payload };
      setStored('planly_tasks', updated);
      return updated[index];
    }
    const { data } = await httpClient.put<Task>(`/tasks/${id}`, payload);
    return data;
  },

  /**
   * PATCH /api/tasks/{id}/finish
   */
  finish: async (id: number): Promise<Task> => {
    if (USE_MOCK) {
      await delay(200);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tugas tidak ditemukan.');
      const updated = [...tasks];
      updated[index] = { ...updated[index], is_finished: !updated[index].is_finished };
      setStored('planly_tasks', updated);
      return updated[index];
    }
    const { data } = await httpClient.patch<Task>(`/tasks/${id}/finish`);
    return data;
  },

  /**
   * DELETE /api/tasks/{id}
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
// NOTES
// =============================================================================

const notesService = {
  /**
   * GET /api/notes
   */
  getAll: async (): Promise<Note[]> => {
    if (USE_MOCK) {
      await delay(300);
      return getStored<Note[]>('planly_notes', initialNotes);
    }
    const { data } = await httpClient.get<Note[]>('/notes');
    return data;
  },

  /**
   * POST /api/notes
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
      setStored('planly_notes', [newNote, ...notes]);
      return newNote;
    }
    const { data } = await httpClient.post<Note>('/notes', payload);
    return data;
  },

  /**
   * GET /api/notes/{id}
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
   */
  update: async (id: number, payload: NoteUpdatePayload): Promise<Note> => {
    if (USE_MOCK) {
      await delay(400);
      const notes = getStored<Note[]>('planly_notes', initialNotes);
      const index = notes.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Catatan tidak ditemukan.');
      const updated = [...notes];
      updated[index] = { ...updated[index], ...payload };
      setStored('planly_notes', updated);
      return updated[index];
    }
    const { data } = await httpClient.put<Note>(`/notes/${id}`, payload);
    return data;
  },

  /**
   * DELETE /api/notes/{id}
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
// EXPORT — unified API object
// =============================================================================

export const api = {
  auth: authService,
  profile: profileService,
  courses: coursesService,
  tasks: tasksService,
  notes: notesService,
};
