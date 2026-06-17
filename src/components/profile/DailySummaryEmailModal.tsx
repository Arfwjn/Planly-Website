/**
 * =============================================================================
 * Planly — DailySummaryEmailModal.tsx
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


import { X } from 'lucide-react';
import { User, Course, Task } from '../../types';

interface DailySummaryEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  courses: Course[];
  tasks: Task[];
}

/**
 * Komponen DailySummaryEmailModal
 * 
 * Sebuah modal interaktif yang mensimulasikan klien email macOS/Planly untuk menampilkan
 * pratinjau rangkuman harian yang dikirim ke email akademis mahasiswa.
 * Menampilkan jadwal perkuliahan hari ini, tugas-tugas aktif yang paling mendesak,
 * serta kata-kata motivasi harian.
 */
export default function DailySummaryEmailModal({
  isOpen,
  onClose,
  user,
  courses,
  tasks
}: DailySummaryEmailModalProps) {
  if (!isOpen) return null;

  // Format tanggal Indonesia untuk kop surat email
  const indonesianDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  // Periksa jadwal kuliah untuk hari ini
  const getTodayCourses = () => {
    const today = new Date();
    const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayEnglishDay = ENGLISH_DAYS[today.getDay()];
    return courses.filter(c => c.day_of_week === todayEnglishDay);
  };

  const todayCourses = getTodayCourses();

  // Ambil tugas yang belum selesai dan urutkan berdasarkan deadline terdekat
  const getActiveTasks = () => {
    const active = tasks.filter(t => !t.is_finished);
    return [...active].sort(
      (a, b) => new Date(a.deadline.replace(' ', 'T')).getTime() - new Date(b.deadline.replace(' ', 'T')).getTime()
    );
  };

  const activeTasks = getActiveTasks();
  const displayedTasks = activeTasks.slice(0, 3);
  const extraTasksCount = activeTasks.length - 3;

  return (
    <div 
      className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in text-left" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal (Desain Klien Email) */}
        <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-800 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-xs font-bold text-on-surface-variant ml-2 font-mono">Planly Email Client Simulator</span>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informasi Pengiriman Email */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 text-xs text-on-surface-variant space-y-1.5 font-sans">
          <div>
            <span className="font-bold text-on-surface pr-1">From:</span> Planly Digest &lt;digest@planly.com&gt;
          </div>
          <div>
            <span className="font-bold text-on-surface pr-1">To:</span> {user.name} &lt;{user.email}&gt;
          </div>
          <div>
            <span className="font-bold text-on-surface pr-1">Subject:</span> [Planly] Rangkuman Agenda Kuliah & Tugas Hari Ini
          </div>
        </div>

        {/* Konten Utama Email */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F1F5F9] dark:bg-slate-950 font-sans">
          <div className="max-w-[500px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            
            {/* Header Email */}
            <div className="bg-primary p-6 text-white text-center">
              <h2 className="text-lg font-extrabold tracking-tight">Rangkuman Harian Kamu</h2>
              <p className="text-xs opacity-90 mt-1">Planly Academic Planner • {indonesianDate}</p>
            </div>

            {/* Isi Email */}
            <div className="p-6 space-y-5 text-on-surface">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Halo, {user.name}!</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Berikut adalah rangkuman jadwal perkuliahan dan status tugas kuliah kamu hari ini. Tetap semangat belajarnya ya!
                </p>
              </div>

              {/* 1. Jadwal Kuliah Hari Ini */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                  📚 Jadwal Kuliah Hari Ini
                </h4>
                
                {todayCourses.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic py-1 pl-1">
                    Tidak ada jadwal kuliah hari ini. Waktunya belajar mandiri atau beristirahat!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {todayCourses.map((c) => (
                      <div 
                        key={c.id} 
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold block text-on-surface">{c.course_name}</span>
                          <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">
                            Dosen: {c.lecturer_name} • Ruang: {c.room}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                          {c.start_time} - {c.end_time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Tugas Kuliah Mendatang */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                  ⏳ Tugas Kuliah Aktif (Belum Selesai)
                </h4>
                
                {activeTasks.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1 pl-1">
                    Selamat! Semua tugas kuliah kamu telah selesai dikerjakan. Mantap!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {displayedTasks.map((t) => {
                      const associatedCourse = courses.find(c => c.id === t.course_id);
                      return (
                        <div 
                          key={t.id} 
                          className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-start gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold block truncate text-on-surface">{t.task_title}</span>
                            <span className="text-[10px] text-on-surface-variant font-semibold mt-0.5 block truncate">
                              Mata Kuliah: {associatedCourse ? associatedCourse.course_name : 'Umum / Pribadi'}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded">
                              Deadline: {t.deadline.split(' ')[0]}
                            </span>
                            {t.is_priority && (
                              <span className="text-[8px] font-bold text-white bg-amber-500 px-1 py-0.2 rounded uppercase">
                                Prioritas
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {extraTasksCount > 0 && (
                      <p className="text-[10px] text-on-surface-variant font-bold italic pt-1 pl-1">
                        + {extraTasksCount} tugas aktif lainnya dapat kamu lihat langsung di tab Tugas.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Kutipan Motivasi */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] font-semibold text-on-surface-variant italic">
                  "Pendidikan adalah paspor untuk masa depan, karena hari esok adalah milik mereka yang mempersiapkannya hari ini."
                </p>
                <p className="text-[10px] font-bold text-primary mt-2">Selamat Belajar & Have a Productive Day! 🚀</p>
              </div>

            </div>

            {/* Footer Email */}
            <div className="bg-slate-50 dark:bg-slate-850/40 p-4 border-t border-slate-100 dark:border-slate-800 text-center text-[9px] text-[#94A3B8] font-semibold">
              Email ini dikirim secara otomatis oleh Planly Academic Planner.<br />
              &copy; 2026 Planly. All rights reserved.
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-800 border-t border-[#E2E8F0] dark:border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-[#4F46E5] cursor-pointer shadow-xs transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>

      </div>
    </div>
  );
}
