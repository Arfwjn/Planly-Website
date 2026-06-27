/**
 * =============================================================================
 * Planly — AttendanceRecapGrid.tsx
 * 
 * Kegunaan:
 * Komponen modul presensi/kehadiran mahasiswa memanfaatkan penangkapan swafoto kamera web & geolokasi GPS.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan AttendanceView.tsx (orkestrator) dan menyalurkan data ke attendanceService.
 * 
 * Aliran Data / State:
 * - Membaca video stream kamera web browser, mengambil koordinat GPS peramban, lalu mengirim payload absensi ke API.
 * =============================================================================
 */


import { Award, ShieldAlert, BookMarked, ClipboardCheck, Plus } from 'lucide-react';
import { Course, AttendanceRecord, SidebarTab } from '../../types';
import EmptyState from '../ui/InteractiveEmptyState';

interface AttendanceRecapGridProps {
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
  onTabChange?: (tab: SidebarTab) => void;
}

/**
 * Komponen AttendanceRecapGrid
 * 
 * Grid visualisasi statistik rekapitulasi tingkat kehadiran mahasiswa per matakuliah.
 * Logika:
 * - Menghitung tingkat kehadiran berdasarkan target 14 sesi perkuliahan.
 * - Menampilkan radial ring progress (lingkaran persentase).
 * - Menampilkan warning merah (ShieldAlert) jika kehadiran berada di bawah batas minimum 75%.
 */
export default function AttendanceRecapGrid({
  courses,
  attendanceRecords,
  onTabChange
}: AttendanceRecapGridProps) {
  
  // Hitung data kehadiran mandiri untuk masing-masing kelas kuliah
  const recapStats = courses.map(course => {
    const targetSessions = 14; // Target tatap muka per semester
    const courseRecords = attendanceRecords.filter(r => r.course_id === course.id);
    const attendedCount = courseRecords.filter(r => r.status === 'Hadir').length;
    // const sickCount = courseRecords.filter(r => r.status === 'Sakit').length;
    // const permittedCount = courseRecords.filter(r => r.status === 'Izin').length;
    // const absentCount = courseRecords.filter(r => r.status === 'Alpha').length;
 
    const attendanceRate = targetSessions > 0 ? (attendedCount / targetSessions) * 100 : 0;
    
    return {
      ...course,
      attendedCount,
      // sickCount,
      // permittedCount,
      // absentCount,
      attendanceRate,
      isWarning: attendanceRate < 75
    };
  });

  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 pb-2">
          <Award className="w-4.5 h-4.5 text-primary" />
          Persentase Kehadiran per Mata Kuliah
        </h3>
        <p className="text-[11px] text-on-surface-variant font-medium">
          SIAKAD menetapkan syarat minimal <span className="font-bold">75% kehadiran</span> (minimal 11 kali hadir dari 14 pertemuan) agar mahasiswa berhak mengikuti Ujian Akhir Semester (UAS).
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          size="sm"
          icons={[
            <BookMarked className="w-5 h-5" />,
            <Award className="w-5 h-5" />,
            <ClipboardCheck className="w-5 h-5" />,
          ]}
          title="Tidak ada kelas terdaftar"
          description="Daftarkan mata kuliah Anda terlebih dahulu untuk memantau rekap persentase kehadiran kuliah."
          action={{
            label: 'Daftar Mata Kuliah',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => onTabChange && onTabChange('courses')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recapStats.map((stat) => (
          <div 
            key={stat.id} 
            className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
              stat.isWarning 
                ? 'bg-red-500/[0.02] border-red-500/20 dark:border-red-500/10' 
                : 'bg-slate-50/50 dark:bg-slate-900/30 border-[#E2E8F0] dark:border-slate-800/60'
            }`}
          >
            <div className="space-y-3 min-w-0 flex-1">
              <div>
                <h4 className="text-sm font-bold text-on-surface truncate">{stat.course_name}</h4>
                <span className="text-[10px] text-on-surface-variant font-bold block mt-0.5">{stat.course_code} • {stat.sks} SKS</span>
              </div>

              {/* Status Rincian Pertemuan */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Hadir: {stat.attendedCount}
                </span>
                {/* <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Sakit/Izin: {stat.sickCount + stat.permittedCount}
                </span> 
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Alpha: {stat.absentCount}
                </span> */}
              </div>

              {/* Peringatan Kelulusan Absensi */}
              {stat.isWarning && (
                <div className="flex items-start gap-1 bg-red-500/10 text-red-600 dark:text-red-400 p-2 rounded-lg border border-red-500/10 text-[9px] font-bold leading-normal">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Kehadiran di bawah 75%! Terancam tidak dapat mengikuti UAS dan mendapatkan nilai C.</span>
                </div>
              )}
            </div>

            {/* Radial Progress Ring */}
            <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={stat.isWarning ? "text-red-500" : "text-primary"}
                  strokeWidth="3.5"
                  strokeDasharray={`${stat.attendanceRate}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-[10px] font-extrabold text-on-surface">
                {Math.round(stat.attendanceRate)}%
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
