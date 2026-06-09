import React from 'react';
import { GraduationCap } from 'lucide-react';

interface AuthHeaderProps {
  isRegister: boolean;
}

/**
 * Komponen AuthHeader
 * 
 * Menampilkan logo topi wisuda (GraduationCap) beserta judul dan subjudul
 * dinamis yang menyesuaikan apakah pengguna sedang melihat form masuk (login) atau pendaftaran (register).
 */
export default function AuthHeader({ isRegister }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-8 text-center select-none">
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 text-white shadow-sm">
        <GraduationCap className="w-6 h-6" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
        {isRegister ? 'Buat Akun' : 'Selamat Datang'}
      </h1>
      <p className="text-sm text-on-surface-variant">
        {isRegister 
          ? 'Bergabung dengan Platform Akademik Mahasiswa Planly' 
          : 'Masuk untuk melanjutkan ke Planly'}
      </p>
    </div>
  );
}
