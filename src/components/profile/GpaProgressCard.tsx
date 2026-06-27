/**
 * =============================================================================
 * Planly — GpaProgressCard.tsx
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


import { TrendingUp } from 'lucide-react';

interface GpaProgressCardProps {
  coursesCount: number;
  tasksCount: number;
  completedTasksCount: number;
  notesCount: number;
  gpaCurrent: number | null;
  gpaTarget: number | null;
}

/**
 * Komponen GpaProgressCard
 * 
 * Komponen ini berfungsi untuk menampilkan ringkasan performa akademik mahasiswa.
 * Menampilkan jumlah mata kuliah, persentase penyelesaian tugas, jumlah catatan materi,
 * serta visualisasi progress bar untuk mencapai target IPK (GPA) semester ini.
 */
export default function GpaProgressCard({
  coursesCount,
  tasksCount,
  completedTasksCount,
  notesCount,
  gpaCurrent,
  gpaTarget
}: GpaProgressCardProps) {
  // Hitung persentase tugas yang sudah selesai
  const taskCompletionPercentage = tasksCount > 0 
    ? Math.round((completedTasksCount / tasksCount) * 100) 
    : 0;

  // Hitung persentase pencapaian IPK terhadap target
  const gpaProgressPercentage = gpaCurrent && gpaTarget && gpaTarget > 0
    ? Math.min((gpaCurrent / gpaTarget) * 100, 100)
    : 0;

  // Cek selisih IPK dengan target
  const gpaDiff = gpaCurrent && gpaTarget 
    ? Number((gpaTarget - gpaCurrent).toFixed(2)) 
    : 0;

  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header Kartu */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
          <TrendingUp className="w-4.5 h-4.5" />
        </div>
        <h3 className="text-base font-bold text-on-surface">Statistik Akademik</h3>
      </div>
      
      {/* Grid Statistik Utama */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Mata Kuliah */}
        <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/20 rounded-xl text-center transition-all hover:scale-[1.02]">
          <span className="block text-xl font-extrabold text-primary">{coursesCount}</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mata Kuliah</span>
        </div>
        {/* Tugas Selesai */}
        <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 rounded-xl text-center transition-all hover:scale-[1.02]">
          <span className="block text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {taskCompletionPercentage}%
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tugas Selesai</span>
        </div>
        {/* Catatan Materi */}
        <div className="p-3 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-900/20 rounded-xl text-center transition-all hover:scale-[1.02]">
          <span className="block text-xl font-extrabold text-amber-600 dark:text-amber-400">{notesCount}</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Materi</span>
        </div>
      </div>

      {/* Visualisasi Progres IPK */}
      {gpaCurrent && gpaTarget ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-on-surface">
            <span>Progres Target IPK</span>
            <span>{Number(gpaCurrent).toFixed(2)} / {Number(gpaTarget).toFixed(2)}</span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="w-full bg-[#E2E8F0] dark:bg-slate-850 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
              style={{ width: `${gpaProgressPercentage}%` }}
            />
          </div>
          
          {/* Keterangan & Motivasi IPK */}
          <div className="text-[10px] text-on-surface-variant font-semibold italic flex items-center gap-1.5 mt-1">
            {gpaCurrent >= gpaTarget ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
                <span>Luar biasa! Kamu telah melampaui target IPK-mu semester ini! Pertahankan prestasimu! 🎉</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
                <span>Butuh {gpaDiff.toFixed(2)} poin lagi untuk mencapai target IPK Semester ini. Semangat belajarnya! 💪</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-on-surface-variant font-semibold italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          Atur IPK saat ini dan target IPK pada menu perbarui profil untuk melihat ringkasan visual progres IPK-mu di sini.
        </p>
      )}
    </div>
  );
}
