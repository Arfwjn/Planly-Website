// =============================================================================
// Planly — useAppAuth Custom Hook (Manajemen Autentikasi & Profil)
//
// Hook ini bertugas buat ngurusin status login user (isAuthenticated), detail data
// profil user aktif (currentUser), alur login sukses, logout, dan update data profil.
// =============================================================================

import { useState } from 'react';
import { User, LoginResponse } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export default function useAppAuth() {
  const toast = useToast();

  // Cek status apakah user udah login pas pertama kali buka halaman dengan baca localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('planly_auth') === 'true';
  });

  // Ambil data user login dari local storage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('planly_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dipanggil pas user berhasil login / register. Nyimpen token & data user ke local storage.
  const handleLoginSuccess = (loginResponse: LoginResponse) => {
    setCurrentUser(loginResponse.user);
    localStorage.setItem('planly_user', JSON.stringify(loginResponse.user));
    setIsAuthenticated(true);
  };

  // Dipanggil pas user mau keluar akun. Hapus token lokal, reset tab, dan bersihkan semua data sensitif/wajah/kunci API.
  const handleSignOut = (setActiveTab: (tab: any) => void) => {
    api.auth.logout().then(() => {
      setIsAuthenticated(false);
      setCurrentUser(null);

      // Daftar kunci penyimpanan lokal spesifik user yang harus dibersihkan demi keamanan dan privasi
      const keysToClear = [
        'planly_user',
        'planly_token',
        'planly_auth',
        'planly_gemini_api_key',
        'planly_use_system_key',
        'planly_registered_face',
        'planly_registered_face_photo',
        'planly_registered_face_time',
        'planly_ai_sessions',
        'planly_notifications_enabled',
        'planly_daily_digest_enabled',
        'planly_notified_deadlines',
        'planly_notified_schedules',
        'planly_calendar_sync_config',
        // Jika mode Mock aktif, bersihkan juga basis data dummy lokal agar tidak bocor ke akun lain
        'planly_courses',
        'planly_tasks',
        'planly_notes',
        'planly_events',
        'planly_reschedules',
        'planly_attendance'
      ];

      keysToClear.forEach(key => localStorage.removeItem(key));

      // Hapus semua cache transkrip/sesi analisis kuliah AI (planly_session_data_*)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('planly_session_data_')) {
          localStorage.removeItem(key);
        }
      }

      localStorage.setItem('planly_active_tab', 'today'); // Reset active tab on logout
      setActiveTab('today');
      toast.success('Berhasil keluar dari akun.');
    });
  };

  // Dipanggil pas user ngedit data profil akademik (seperti nim, major, IPK saat ini/target)
  const handleUserUpdate = (payload: Partial<User>) => {
    api.profile.update(payload).then((savedUser) => {
      setCurrentUser(savedUser);
      localStorage.setItem('planly_user', JSON.stringify(savedUser));
    }).catch((err) => toast.error(err.message));
  };

  return {
    isAuthenticated,
    currentUser,
    handleLoginSuccess,
    handleSignOut,
    handleUserUpdate,
  };
}
