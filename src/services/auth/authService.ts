import { User, LoginResponse, RegisterResponse } from '../../types';
import { initialUser } from '../../mockData';
import { USE_MOCK, delay, getStored, setStored, getNextMockId } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const authService = {
  /**
   * POST /api/auth/login
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await delay(500);
      if (!email.trim() || !password.trim()) {
        throw new Error('Email dan kata sandi wajib diisi.');
      }
      if (email !== 'arfwjn@gmail.com' || password !== 'ariefsidik') {
        throw new Error('Email atau kata sandi salah.');
      }
      const user = getStored<User>('planly_user', initialUser);
      setStored('planly_user', user);
      const token = `mock_token_${Date.now()}`;

      localStorage.setItem('planly_token', token);
      localStorage.setItem('planly_auth', 'true');
      return { token, user };
    }

    // Jalur Backend Laravel API
    const { data } = await httpClient.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('planly_token', data.token);
    localStorage.setItem('planly_auth', 'true');
    return data;
  },

  /**
   * POST /api/auth/register
   */
  register: async (payload: { name: string; email: string; password: string; password_confirmation: string; nim?: string }): Promise<RegisterResponse> => {
    if (USE_MOCK) {
      await delay(600);
      if (!payload.name.trim() || !payload.email.trim()) {
        throw new Error('Harap lengkapi seluruh kolom pendaftaran.');
      }
      const newUser: User = {
        id: getNextMockId(),
        name: payload.name,
        email: payload.email,
        nim: payload.nim || null,
        major: null,
        semester: null,
        profile_photo_url:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAFoYkxvSC3Tl7Lha5JHOML3Cc2hYx5Hhoh_yA__QxGX6rbapw7zZtOvOWuvFsVnxR6nNGtzUzrFVJFfu_G8hudADmzAZDH1shSH7Mr3tS3ufjyGaU-d9hD3ArSwarBm1TR6cXqN2MiMoTBst4W8NxtPjM2uwHLLKhojSWGvUBep5mGtAO3VbZakDBXlptVD5J5wPcgTnWXzbc81YIbapCO5hSMDAgnhL_lL7dx-K2jpfWn0MgiODu-J2up9aV3_2Kd9JpojgjSs9g4',
      };
      setStored('planly_user', newUser);
      localStorage.setItem('planly_auth', 'true');
      const token = `mock_token_${Date.now()}`;
      localStorage.setItem('planly_token', token);
      return { message: 'Pendaftaran berhasil', user: newUser };
    }

    // Jalur Backend Laravel API + Simpan Token Setelah Berhasil Register
    const { data } = await httpClient.post<RegisterResponse>('/auth/register', payload);
    if (data.token) {
      localStorage.setItem('planly_token', data.token);
      localStorage.setItem('planly_auth', 'true');
    }
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
      // Token di browser tetap dihapus walaupun koneksi ke server bermasalah
      localStorage.removeItem('planly_token');
      localStorage.removeItem('planly_auth');
    }
  },
};
