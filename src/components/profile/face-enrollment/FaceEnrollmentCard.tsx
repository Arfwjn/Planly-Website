/**
 * =============================================================================
 * Planly — FaceEnrollmentCard.tsx
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


import { Camera, Trash2, Eye, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

interface FaceEnrollmentCardProps {
  registered: boolean;
  registerDate: string | null;
  onShowPreview: () => void;
  onOpenRegister: () => void;
  onDeleteFace: () => void;
}

export default function FaceEnrollmentCard({
  registered,
  registerDate,
  onShowPreview,
  onOpenRegister,
  onDeleteFace
}: FaceEnrollmentCardProps) {
  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800 flex items-center justify-center text-primary">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">Verifikasi Wajah Presensi</h3>
            <p className="text-[10px] text-on-surface-variant font-medium">Pengenalan Biometrik Wajah Lokal</p>
          </div>
        </div>

        {registered ? (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full border border-green-200/50 dark:border-green-900/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Aktif
          </span>
        ) : (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200/50 dark:border-amber-900/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Belum Aktif
          </span>
        )}
      </div>

      {registered ? (
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div 
            onClick={onShowPreview}
            className="w-16 h-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 flex-shrink-0 flex items-center justify-center text-primary cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-102 active:scale-97 group shadow-inner"
            title="Klik untuk melihat foto wajah terdaftar"
          >
            <Camera className="w-5 h-5 text-primary/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-bold text-on-surface">Data Wajah Anda Sudah Terdaftar</p>
            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
              Daftar Wajah: <span className="font-semibold text-on-surface">{registerDate}</span>
            </p>
            <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed max-w-md">
              Sistem akan memverifikasi kecocokan wajah Anda secara real-time saat Anda melakukan presensi check-in kelas.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onShowPreview}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-primary dark:text-indigo-300 font-semibold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors border-none"
              >
                <Eye className="w-3.5 h-3.5" /> Lihat Foto
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface font-semibold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors border-none"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Daftar Ulang
              </button>
              <button
                type="button"
                onClick={onDeleteFace}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer border border-red-100 dark:border-red-900/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Data
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-on-surface-variant font-medium">
            Anda belum mengaktifkan verifikasi wajah. Daftarkan wajah Anda agar proses check-in absensi kelas menjadi lebih aman dan otomatis mencegah kecurangan absensi.
          </p>
          <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/5 border border-indigo-100/50 dark:border-indigo-900/10 rounded-xl flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-on-surface-variant font-semibold leading-relaxed">
              Pengenalan wajah dilakukan sepenuhnya di dalam peramban web Anda (sisi klien). Tidak ada data wajah, gambar, atau deskriptor yang dikirimkan ke server kami untuk menjaga privasi Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRegister}
            className="px-4 py-2.5 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors border-none"
          >
            <Camera className="w-4 h-4" /> Daftarkan Wajah Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
