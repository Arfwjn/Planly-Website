// =============================================================================
// Planly — Notes Service (Modul Catatan Kuliah)
//
// File ini khusus buat ngurusin penulisan catatan materi kuliah (Markdown,
// list bullet, list angka, checkpoint, formatting toolbar kustom).
// =============================================================================

import { Note, NoteCreatePayload, NoteUpdatePayload } from '../../types';
import { initialNotes } from '../../mockData';
import { USE_MOCK, delay, getStored, setStored, getNextMockId } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const notesService = {
  /**
   * GET /api/notes
   * Ambil semua daftar catatan belajar mahasiswa.
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
   * Bikin catatan belajar baru.
   */
  create: async (payload: NoteCreatePayload): Promise<Note> => {
    if (USE_MOCK) {
      await delay(400);
      const notes = getStored<Note[]>('planly_notes', initialNotes);
      const newNote: Note = {
        ...payload,
        id: getNextMockId(),
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
   * Ngelihat detail isi satu catatan tertentu berdasarkan ID.
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
   * Ngedit isi catatan materi kuliah.
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
   * Hapus catatan tertentu.
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
