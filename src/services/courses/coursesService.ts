// =============================================================================
// Planly — Courses Service (Modul Mata Kuliah)
//
// File ini khusus buat ngurusin data mata kuliah mahasiswa (sks, nama dosen,
// ruangan, hari, jam, preset warna) untuk mendukung fitur jadwal kuliah.
// =============================================================================

import { Course, CourseCreatePayload, CourseUpdatePayload, Task, Note } from '../../types';
import { initialCourses, initialTasks, initialNotes } from '../../mockData';
import { USE_MOCK, delay, getStored, setStored, getNextMockId } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const coursesService = {
  /**
   * GET /api/courses
   * Buat ngambil semua daftar mata kuliah mahasiswa.
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
   * Bikin data mata kuliah baru (misal nambah kelas baru di semester ini).
   */
  create: async (payload: CourseCreatePayload): Promise<Course> => {
    if (USE_MOCK) {
      await delay(400);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      const newCourse: Course = {
        ...payload,
        id: getNextMockId(),
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
   * Buat ngambil detail lengkap satu mata kuliah aja berdasarkan ID.
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
   * Buat ngedit info mata kuliah yang udah ada (misal dosennya ganti / pindah ruangan).
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
   * Hapus mata kuliah tertentu.
   */
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(400);
      const courses = getStored<Course[]>('planly_courses', initialCourses);
      setStored('planly_courses', courses.filter(c => c.id !== id));

      // Efek domino (Cascade delete): Kalau matkul dihapus, maka field
      // course_id di tugas dan catatan terkait otomatis diset jadi null (gak ada matkul).
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      setStored('planly_tasks', tasks.map(t => t.course_id === id ? { ...t, course_id: null } : t));

      const notes = getStored<Note[]>('planly_notes', initialNotes);
      setStored('planly_notes', notes.map(n => n.course_id === id ? { ...n, course_id: null } : n));
      return;
    }
    await httpClient.delete(`/courses/${id}`);
  },
};
