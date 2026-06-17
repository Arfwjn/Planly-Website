/**
 * =============================================================================
 * Planly — LandingFaq.tsx
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


import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export default function LandingFaq() {
  const faqData: FaqItem[] = [
    {
      q: 'Apakah Planly memerlukan koneksi internet untuk digunakan?',
      a: 'Tidak selalu. Planly mendukung sinkronisasi lokal (Local Offline Mode) yang menyimpan data Anda secara aman di local storage browser. Namun, jika Anda ingin menggunakan asisten AI (transkripsi video/chat RAG), menyinkronkan data dengan server Laravel eksternal, atau melakukan sinkronisasi Google Calendar, Anda memerlukan koneksi internet.'
    },
    {
      q: 'Bagaimana cara kerja sinkronisasi kalender di Planly?',
      a: 'Planly mengekspor jadwal kuliah mingguan, jadwal reschedule khusus, serta tugas kuliah ke format iCalendar (.ics). Anda dapat mengunduh berkas .ics tersebut atau menyalin link feed kalender dinamis untuk dilanggan (subscribe) langsung dari Google Calendar atau Apple Calendar.'
    },
    {
      q: 'Apakah verifikasi wajah pada absensi dienkripsi secara aman?',
      a: 'Ya. Foto snapshot kamera Anda dikonversi menjadi data format Base64 yang dikirimkan secara terenkripsi ke backend server melalui protokol HTTPS. Data tersebut hanya dicatat sebagai bukti sah riwayat kehadiran di kelas kuliah yang aktif.'
    },
    {
      q: 'Apakah database Planly terintegrasi dengan Laravel Sanctum?',
      a: 'Tentu saja. Di sisi backend, kami telah merancang panduan database migrasi dan controller Laravel 11 lengkap yang kompatibel 100% menggunakan Laravel Sanctum token otentikasi. Anda dapat melihat panduan integrasi ini di dalam file BACKEND_INTEGRATION.md.'
    }
  ];

  return (
    <section className="relative z-10 py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-900/60">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Pertanyaan Umum (FAQ)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">
          Temukan jawaban dari hal-hal yang sering ditanyakan seputar platform Planly.
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, idx) => (
          <details 
            key={idx} 
            className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-slate-300 dark:hover:border-slate-700/60 transition-all shadow-sm"
          >
            <summary className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 select-none">
              <span>{item.q}</span>
              <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400 group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-3.5 border-t border-slate-150 dark:border-slate-800/80 pt-3.5 text-wrap-pretty cursor-default text-left">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
