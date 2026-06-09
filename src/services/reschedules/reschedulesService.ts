// =============================================================================
// Planly — Reschedules Service (Modul Reschedule Kuliah)
//
// File ini khusus buat ngurusin pemindahan jadwal kuliah (reschedule) atau 
// penandaan kelas batal di tanggal tertentu untuk timeline kalender mingguan/harian.
// =============================================================================

import { RescheduledSession } from '../../types';
import { initialReschedules } from '../../mockData';
import { USE_MOCK, delay, getStored, setStored, getNextMockId } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const reschedulesService = {
  /**
   * GET /api/reschedules
   * Ambil semua riwayat pemindahan atau pembatalan jadwal kuliah.
   */
  getAll: async (): Promise<RescheduledSession[]> => {
    if (USE_MOCK) {
      await delay(300);
      return getStored<RescheduledSession[]>('planly_reschedules', initialReschedules);
    }
    const { data } = await httpClient.get<RescheduledSession[]>('/reschedules');
    return data;
  },

  /**
   * POST /api/reschedules
   * Bikin jadwal ganti (reschedule) atau nandai kelas batal di tanggal tertentu.
   */
  create: async (payload: Omit<RescheduledSession, 'id'>): Promise<RescheduledSession> => {
    if (USE_MOCK) {
      await delay(400);
      const reschedules = getStored<RescheduledSession[]>('planly_reschedules', initialReschedules);
      const newReschedule: RescheduledSession = {
        ...payload,
        id: getNextMockId(),
      };
      setStored('planly_reschedules', [newReschedule, ...reschedules]);
      return newReschedule;
    }
    const { data } = await httpClient.post<RescheduledSession>('/reschedules', payload);
    return data;
  },

  /**
   * DELETE /api/reschedules/{courseId}/{originalDate}
   * Hapus jadwal reschedule/pembatalan biar jadwal balik normal seperti semula.
   */
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
