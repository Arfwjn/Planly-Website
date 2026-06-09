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

  // Dipanggil pas user mau keluar akun. Hapus token lokal dan reset tab aktif ke today.
  const handleSignOut = (setActiveTab: (tab: any) => void) => {
    if (confirm('Apakah Anda yakin ingin keluar dari Planly?')) {
      api.auth.logout().then(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('planly_user');
        setActiveTab('today');
      });
    }
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
