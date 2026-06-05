import React, { useState } from 'react';
import { User as UserIcon, MapPin, Bell, Palette, LogOut, ArrowRight, Save, X } from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

/**
 * Komponen ProfileView
 * 
 * Komponen ini digunakan untuk menampilkan profil pengguna (mahasiswa), mengelola formulir akun,
 * menyalakan/menonaktifkan notifikasi, memilih tema tampilan, serta melakukan konfirmasi log out (keluar).
 */
export default function ProfileView({
  user,
  onUserUpdate,
  onSignOut,
  theme,
  onThemeChange
}: ProfileViewProps) {
  // State untuk melacak apakah formulir pengeditan profil sedang aktif
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  // State untuk menyimpan nilai input formulir pengeditan akun (nama, NIM, program studi)
  const [editName, setEditName] = useState(user.name);
  const [editNim, setEditNim] = useState(user.nim || '');
  const [editMajor, setEditMajor] = useState(user.major || '');

  // State untuk melacak status saklar notifikasi pengingat & email rangkuman harian (notifications toggles)
  const [reminders, setReminders] = useState(() => {
    return localStorage.getItem('planly_notifications_enabled') !== 'false';
  });
  const [dailyDigest, setDailyDigest] = useState(false);

  const handleToggleReminders = () => {
    const nextVal = !reminders;
    setReminders(nextVal);
    localStorage.setItem('planly_notifications_enabled', String(nextVal));
  };



  // Menangani pengiriman formulir akun. Fungsi ini memperbarui data profil pengguna
  // melalui callback onUserUpdate dan menonaktifkan mode edit setelah selesai.
  const handleAccountUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUserUpdate({
      ...user,
      name: editName,
      nim: editNim,
      major: editMajor
    });
    setIsEditingAccount(false);
    alert('Informasi profil berhasil disimpan.');
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-8 pb-12">
      {/* Profile Header Block */}
      <section className="flex flex-col items-center text-center bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full mb-4 group">
          <div className="absolute inset-0 rounded-full border-4 border-white shadow-md z-15"></div>
          <img
            src={user.profile_photo_url || ''}
            alt="Avatar Pengguna"
            className="w-full h-full object-cover rounded-full z-10"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={() => alert('Unggah foto: terintegrasi dengan pendaftaran akademik default')}
            className="absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full bg-primary hover:bg-[#4F46E5] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer border border-white"
            aria-label="Edit Foto Profil"
          >
            <UserIcon className="w-4.5 h-4.5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-on-surface">{user.name}</h1>
        <p className="text-xs text-[#94A3B8] font-bold mt-1 tracking-wider uppercase">{user.email}</p>
        <p className="text-sm font-semibold text-on-surface-variant mt-2 max-w-md mx-auto">
          {user.major} • NIM {user.nim} • Semester {user.semester}
        </p>

        {/* Lencana (Badge) Mahasiswa Aktif dan Informasi Lokasi Kampus */}
        <div className="flex items-center gap-2 mt-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
            Mahasiswa Aktif
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-on-surface-variant font-semibold text-xs flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            Kampus Utama
          </span>
        </div>
      </section>

      {/* Settings Grid (Bento Style Layout) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Formulir Profil Akun (Account Details Form) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#F5F2FF] flex items-center justify-center text-primary">
                <UserIcon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Ringkasan Akun</h3>
            </div>

            {/* Jika mode edit aktif, kita tampilkan formulir pengisian data akun */}
            {isEditingAccount ? (
              <form onSubmit={handleAccountUpdateSubmit} className="space-y-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-8 px-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-on-surface focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                      NIM
                    </label>
                    <input
                      type="text"
                      value={editNim}
                      onChange={(e) => setEditNim(e.target.value)}
                      className="w-full h-8 px-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-on-surface focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase mb-1">
                      Program Studi
                    </label>
                    <input
                      type="text"
                      value={editMajor}
                      onChange={(e) => setEditMajor(e.target.value)}
                      className="w-full h-8 px-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-on-surface focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" /> Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAccount(false)}
                    className="px-3 py-1.5 border border-[#E2E8F0] hover:bg-slate-50 text-on-surface-variant font-semibold rounded text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Batal
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs leading-relaxed text-on-surface-variant mb-6">
                Kelola informasi profil, nomor induk mahasiswa, email universitas, dan data keamanan Anda.
              </p>
            )}
          </div>

          {!isEditingAccount && (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="self-start text-primary font-bold text-xs flex items-center gap-1 hover:underline group cursor-pointer bg-transparent border-none p-0"
            >
              <span>Perbarui profil</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Pengaturan Saklar Notifikasi (Notifications Toggle Settings) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#F5F2FF] flex items-center justify-center text-primary">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Notifikasi</h3>
            </div>
            
            {/* Saklar untuk pengingat tugas dan email rangkuman harian */}
            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                <span>Pengingat Tugas & Jadwal</span>
                <button
                  type="button"
                  onClick={handleToggleReminders}
                  className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                    reminders ? 'bg-primary' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    reminders ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-on-surface">
                <span>Email Rangkuman Tugas Harian</span>
                <button
                  type="button"
                  onClick={() => setDailyDigest(!dailyDigest)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer block transition-colors ${
                    dailyDigest ? 'bg-primary' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    dailyDigest ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-on-surface-variant font-medium">
            Pemberitahuan aktif dikirim melalui saluran terdaftar.
          </p>
        </div>

        {/* Pengaturan Pilihan Tema (Theme Switcher Triggers) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#F5F2FF] flex items-center justify-center text-primary">
              <Palette className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Pengaturan Tampilan</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {/* Pemicu Mode Terang */}
            <div
              onClick={() => onThemeChange('light')}
              className={`border-2 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
              }`}
            >
              <Palette className="w-6 h-6 text-primary" />
              <span className="text-xs font-bold text-primary">Mode Terang</span>
            </div>
            
            {/* Pemicu Mode Gelap */}
            <div
              onClick={() => onThemeChange('dark')}
              className={`border-2 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
              }`}
            >
              <Palette className="w-6 h-6 text-on-surface-variant" />
              <span className="text-xs font-bold text-on-surface-variant">Mode Gelap</span>
            </div>
          </div>
        </div>

        {/* Tombol Keluar Sesi & Konfirmasi Log Out */}
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 text-center flex flex-col justify-center items-center">
          <LogOut className="w-8 h-8 text-red-600 mb-2" />
          <h3 className="text-base font-bold text-red-600 mb-1">Keluar dengan Aman</h3>
          <p className="text-xs text-on-surface-variant max-w-[280px] mb-4">
            Keluar dari sesi akademik Planly aktif Anda pada perangkat peramban ini dengan aman.
          </p>
          <button
            onClick={onSignOut}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full shadow-sm transition-colors cursor-pointer"
          >
            Keluar Sekarang
          </button>
        </div>

      </section>

    </div>
  );
}
