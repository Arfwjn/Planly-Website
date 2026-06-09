// =============================================================================
// Planly — Profile Service (Modul Profil Mahasiswa)
//
// File ini khusus buat ngurusin pengambilan dan pembaruan data diri serta
// parameter akademik mahasiswa (seperti IPK target, semester, dll).
// =============================================================================

import { User, ProfileUpdatePayload } from '../../types';
import { initialUser } from '../../mockData';
import { USE_MOCK, delay, getStored, setStored } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const profileService = {
  /**
   * GET /api/profile
   * Buat ngambil data profil mahasiswa yang lagi aktif login.
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
   * Buat nge-update data profil (IPK, target jam belajar, alamat, dll).
   */
  update: async (payload: ProfileUpdatePayload): Promise<User> => {
    if (USE_MOCK) {
      await delay(400);
      const current = getStored<User>('planly_user', initialUser);
      const updated = { ...current, ...payload };
      setStored('planly_user', updated);
      return updated;
    }
    const { data } = await httpClient.post<User>('/profile/update', payload);
    return data;
  },
};
