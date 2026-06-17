/**
 * =============================================================================
 * Planly — ProfileHeader.tsx
 * 
 * Kegunaan:
 * Komponen konfigurasi Profil pengguna, pencapaian target akademik (IPK/GPA), sinkronisasi kalender OAuth, & backup data.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan ProfileView.tsx (orkestrator), profileService, dan calendarSync.
 * 
 * Aliran Data / State:
 * - Mengambil ringkasan data nilai IPK mahasiswa, kontrol sinkronisasi kalender eksternal, dan ekspor/impor data JSON.
 * =============================================================================
 */

import React, { useRef } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { useToast } from '../ui/Toast';

interface ProfileHeaderProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

/**
 * Komponen ProfileHeader
 * 
 * Bagian atas halaman profil yang menampilkan foto profil (avatar), nama, NIM, jurusan,
 * status mahasiswa aktif, dan semester saat ini.
 * Mendukung pengunggahan foto profil baru (Base64 converter) dengan batas ukuran 2MB.
 */
export default function ProfileHeader({
  user,
  onUserUpdate
}: ProfileHeaderProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Menangani pengubahan foto profil ke format Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Batasi ukuran gambar maksimal 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal adalah 2MB!');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUserUpdate({
          ...user,
          profile_photo_url: base64String
        });
        toast.success('Foto profil berhasil diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center gap-4">
        {/* Avatar Area */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0 group">
          <div className="absolute inset-0 rounded-full border-2 border-white dark:border-slate-800 shadow-sm z-15"></div>
          {user.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt="Avatar Pengguna"
              className="w-full h-full object-cover rounded-full z-10 animate-fade-in"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[#F5F2FF] dark:bg-slate-800 rounded-full flex items-center justify-center text-primary z-10 border border-card-border">
              <UserIcon className="w-8 h-8" />
            </div>
          )}
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-primary hover:bg-[#4F46E5] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer border border-white dark:border-slate-850"
            aria-label="Edit Foto Profil"
            title="Unggah Foto Profil Baru"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {/* Nama & NIM */}
        <div className="text-left space-y-1">
          <h1 className="text-lg md:text-xl font-bold text-on-surface leading-tight">{user.name}</h1>
          <p className="text-[10px] text-[#94A3B8] font-bold tracking-wider uppercase leading-none">{user.email}</p>
          <p className="text-xs font-semibold text-on-surface-variant">
            {user.major || 'Belum diatur'} • NIM {user.nim || 'Belum diatur'}
          </p>
        </div>
      </div>

      {/* Lencana Semester & Status */}
      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
          Mahasiswa Aktif
        </span>
        {user.semester && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#EC4899]/10 text-[#EC4899] font-bold text-[10px] uppercase tracking-wider">
            Semester {user.semester}
          </span>
        )}
      </div>
    </section>
  );
}
