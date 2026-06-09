// =============================================================================
// Planly — Tasks Service (Modul Tugas Kuliah)
//
// File ini khusus buat ngurusin data tugas kuliah, deadline pengumpulan,
// prioritas tugas (bintang), dan checklist status penyelesaian tugas.
// =============================================================================

import { Task, TaskCreatePayload, TaskUpdatePayload } from '../../types';
import { initialTasks } from '../../mockData';
import { USE_MOCK, delay, getStored, setStored, getNextMockId } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const tasksService = {
  /**
   * GET /api/tasks
   * Ambil semua daftar tugas. Bisa disaring berdasarkan courseId tertentu juga.
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
   * Bikin tugas kuliah baru.
   */
  create: async (payload: TaskCreatePayload): Promise<Task> => {
    if (USE_MOCK) {
      await delay(400);
      const tasks = getStored<Task[]>('planly_tasks', initialTasks);
      const newTask: Task = {
        ...payload,
        id: getNextMockId(),
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
   * Ngelihat info detail tugas kuliah tertentu berdasarkan ID.
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
   * Ngedit isi tugas (judul, deskripsi, deadline, prioritas, dll).
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
   * Ceklis tugas: ganti status tugas (selesai / belum selesai).
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
   * Hapus data tugas tertentu.
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
