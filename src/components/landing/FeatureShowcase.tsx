/**
 * =============================================================================
 * Planly — FeatureShowcase.tsx
 * 
 * Kegunaan:
 * Berkas kode dalam proyek Planly.
 * 
 * Relasi & Dependency:
 * - Berhubungan dengan modul utama aplikasi.
 * 
 * Aliran Data / State:
 * - Mengikuti alur data terpadu (REST API / local mock storage).
 * =============================================================================
 */


import { Calendar, Sparkles, UserCheck, Clock, FileText, CheckCircle2 } from 'lucide-react';
import BrowserMockup from './BrowserMockup';
import AIChatMockup from './AIChatMockup';

interface FeatureShowcaseProps {
  theme: 'light' | 'dark';
}

export default function FeatureShowcase({ theme }: FeatureShowcaseProps) {
  return (
    <section className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-900/60">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-28">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Segala yang Anda Butuhkan untuk Sukses Akademik
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-base sm:text-lg">
          Kami menyatukan berbagai peralatan produktivitas terpisah ke dalam satu ekosistem yang terintegrasi secara cerdas.
        </p>
      </div>

      {/* Feature List (Alternating Layout) */}
      <div className="space-y-28 sm:space-y-36">
        
        {/* Feature 1: Manajemen Kuliah & Kalender */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-6 text-left order-2 lg:order-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manajemen Kuliah & Jadwal Kalender Dinamis
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Catat mata kuliah kuliah rutin Anda lengkap dengan informasi ruang kelas, jumlah SKS, dan dosen pengampu. Ketika jadwal berubah, lakukan <em>reschedule</em> instan atau tandai sebagai kelas libur tanpa merusak skema mingguan Anda.
            </p>
            <ul className="space-y-3 font-medium text-slate-700 dark:text-slate-350 text-sm">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Ekspor jadwal perkuliahan langsung ke Google Calendar & Apple Calendar</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Pemberitahuan kelas hari ini langsung di dashboard utama</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <BrowserMockup 
              src={theme === 'dark' ? '/planly_calendar_dark.png' : '/planly_calendar_light.png'} 
              alt="Manajemen Kalender Planly"
              url="planly.app/calendar"
            />
          </div>
        </div>

        {/* Feature 2: Asisten AI (Gemini) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <AIChatMockup />
          </div>
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Asisten AI Belajar: Bedah Rekaman & RAG Chatbot
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Dapatkan pemahaman mendalam secara instan. Unggah file rekaman video atau audio kuliah Anda, biarkan AI pintar mentranskrip ucapan dosen secara otomatis, membagi bahasan per bab penting, merangkum poin-poin utama, serta menyediakan chat Q&A kontekstual.
            </p>
            <ul className="space-y-3 font-medium text-slate-700 dark:text-slate-350 text-sm">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Enkripsi kunci API Gemini Anda secara aman di level browser</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Jawaban AI cerdas dilengkapi format rumus LaTeX & Markdown</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Absensi Biometrik Wajah & GPS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-6 text-left order-2 lg:order-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Verifikasi Presensi Aman dengan Deteksi Wajah & GPS
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Hilangkan sistem presensi manual yang rawan kecurangan. Planly menggunakan kamera laptop/handphone Anda untuk mendeteksi biometrik wajah secara real-time, disandingkan dengan deteksi koordinat GPS untuk memvalidasi bahwa Anda benar-benar berada di ruang kelas.
            </p>
            <ul className="space-y-3 font-medium text-slate-700 dark:text-slate-350 text-sm">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Teknologi Face Mesh untuk verifikasi wajah instan dalam hitungan detik</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Peta koordinat GPS presisi dengan indikator jangkauan radius kelas</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <BrowserMockup 
              src={theme === 'dark' ? '/planly_attendance_dark.png' : '/planly_attendance_light.png'} 
              alt="Presensi Wajah Planly"
              url="planly.app/attendance"
            />
          </div>
        </div>

        {/* Feature 4: Workspace Fokus Pomodoro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <BrowserMockup 
              src={theme === 'dark' ? '/planly_workspace_dark.png' : '/planly_workspace_light.png'} 
              alt="Workspace Pomodoro Planly"
              url="planly.app/workspace"
            />
          </div>
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Timer Fokus Pomodoro & Pengelola Tugas Terpadu
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Mulai sesi belajar terfokus tanpa distrasi menggunakan teknik Pomodoro. Dilengkapi dengan timer 25 menit yang otomatis bertransisi ke waktu istirahat singkat, dan terhubung langsung ke daftar tugas kuliah Anda.
            </p>
            <ul className="space-y-3 font-medium text-slate-700 dark:text-slate-350 text-sm">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Efek chime suara penanda otomatis saat sesi belajar/istirahat selesai</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Pencatatan akumulasi jam belajar untuk melacak riwayat produktivitas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 5: Catatan Belajar & LaTeX Markdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-6 text-left order-2 lg:order-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Catatan Kuliah Markdown Kaya Format & Rumus LaTeX
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Tulis rangkuman dan catatan belajar Anda menggunakan editor Markdown yang fleksibel. Butuh menulis rumus matematika rumit atau notasi ilmiah? Modul LaTeX (KaTeX) kami akan merendernya secara indah.
            </p>
            <ul className="space-y-3 font-medium text-slate-700 dark:text-slate-350 text-sm">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Bilah perkakas (formatting toolbar) instan untuk header, checklist, bold, dll.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Unggah berkas lampiran materi kuliah langsung di dalam catatan (hingga 1.5MB)</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <BrowserMockup 
              src={theme === 'dark' ? '/planly_notes_dark.png' : '/planly_notes_light.png'} 
              alt="Catatan Markdown Planly"
              url="planly.app/notes"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
