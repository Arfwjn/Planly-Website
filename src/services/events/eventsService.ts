// =============================================================================
// Planly — Events Service (Modul Kegiatan Kampus)
//
// File ini khusus buat ngurusin data event kampus non-kuliah (seminar, workshop,
// rapat himpunan/UKM, lomba kompetisi, dll) terintegrasi dengan filter visual.
// =============================================================================

import { CampusEvent, CampusEventCreatePayload } from '../../types';
import { initialEvents } from '../../mockData';
import { USE_MOCK, delay, getStored, setStored, getNextMockId } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const eventsService = {
  /**
   * GET /api/events
   * Ambil semua daftar event kampus yang akan datang / berlangsung.
   */
  getAll: async (): Promise<CampusEvent[]> => {
    if (USE_MOCK) {
      await delay(300);
      return getStored<CampusEvent[]>('planly_events', initialEvents);
    }
    const { data } = await httpClient.get<CampusEvent[]>('/events');
    return data;
  },

  /**
   * POST /api/events
   * Nambahin data event kampus baru.
   */
  create: async (payload: CampusEventCreatePayload): Promise<CampusEvent> => {
    if (USE_MOCK) {
      await delay(400);
      const events = getStored<CampusEvent[]>('planly_events', initialEvents);
      const newEvent: CampusEvent = {
        ...payload,
        id: getNextMockId(),
        user_id: 1,
      };
      setStored('planly_events', [newEvent, ...events]);
      return newEvent;
    }
    const { data } = await httpClient.post<CampusEvent>('/events', payload);
    return data;
  },

  /**
   * PUT /api/events/{id}
   * Ngedit data event kampus (misal lokasi seminar-nya pindah gedung).
   */
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

  /**
   * DELETE /api/events/{id}
   * Hapus event kampus tertentu.
   */
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

export default eventsService;
