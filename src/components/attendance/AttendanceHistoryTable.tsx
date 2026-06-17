/**
 * =============================================================================
 * Planly — AttendanceHistoryTable.tsx
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

import { useState, useEffect } from 'react';
import { History, Globe, Eye, Check, Trash2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3 } from 'lucide-react';
import EmptyState from '../ui/InteractiveEmptyState';
import { AttendanceRecord } from '../../types';

interface AttendanceHistoryTableProps {
  attendanceRecords: AttendanceRecord[];
  onDeleteClick: (id: number) => void;
  onPreviewPhoto: (photo: string) => void;
}

/**
 * Komponen AttendanceHistoryTable
 * 
 * Tabel riwayat presensi masuk harian mahasiswa.
 * Mendukung:
 * - Tampilan pagination cerdas (maksimal 5 rekaman per halaman).
 * - Menampilkan thumbnail foto verifikasi wajah dengan tombol intip/preview.
 * - Navigasi koordinat lintang/bujur GPS langsung ke Google Maps.
 * - Tombol hapus rekaman presensi (Trash2) untuk membatalkan absen keliru.
 */
export default function AttendanceHistoryTable({
  attendanceRecords,
  onDeleteClick,
  onPreviewPhoto
}: AttendanceHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = attendanceRecords.slice(indexOfFirstItem, indexOfLastItem);

  // Reset halaman aktif jika jumlah record menyusut (misal setelah dihapus)
  useEffect(() => {
    const pages = Math.ceil(attendanceRecords.length / itemsPerPage);
    if (currentPage > pages && pages > 0) {
      setCurrentPage(pages);
    }
  }, [attendanceRecords.length, currentPage]);

  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        <History className="w-4 h-4 text-primary animate-pulse" />
        Riwayat Presensi Masuk
      </h3>

      {attendanceRecords.length === 0 ? (
        <EmptyState
          size="default"
          icons={[
            <ClipboardCheck className="w-5 h-5" />,
            <History className="w-5 h-5" />,
            <Clock3 className="w-5 h-5" />,
          ]}
          title="Belum ada riwayat presensi"
          description="Riwayat presensi Anda akan muncul di sini setelah Anda melakukan check-in."
          className="border-0 shadow-none bg-transparent"
          action={{
            label: 'Lakukan Presensi',
            icon: <ClipboardCheck className="w-4 h-4" />,
            onClick: () => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-slate-800 text-on-surface-variant font-bold">
                <th className="py-2.5 px-3">Mata Kuliah</th>
                <th className="py-2.5 px-3">Tanggal & Waktu</th>
                <th className="py-2.5 px-3">Lokasi GPS</th>
                <th className="py-2.5 px-3 text-center">Foto Wajah</th>
                <th className="py-2.5 px-3 text-right">Status & Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr key={record.id} className="border-b border-[#F1F5F9] dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="py-3 px-3">
                    <strong className="text-on-surface block font-bold">{record.course_name}</strong>
                    <span className="text-[10px] text-on-surface-variant font-semibold mt-0.5 block">{record.course_code}</span>
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant font-medium">
                    <span className="block">{record.date}</span>
                    <span className="block text-[10px] text-[#94A3B8] font-bold mt-0.5">{record.time}</span>
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant">
                    {record.latitude && record.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline font-semibold flex items-center gap-1"
                        title="Lihat di Google Maps"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}</span>
                      </a>
                    ) : (
                      <span className="text-[#94A3B8] font-semibold italic">Tidak ada lokasi</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {record.image_base64 ? (
                      <div className="inline-block relative group hover:scale-105 transition-transform">
                        <img 
                          src={record.image_base64} 
                          alt="Verifikasi Wajah" 
                          className="w-9 h-9 blur-[2px] object-cover rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs" 
                        />
                        <button
                          onClick={() => onPreviewPhoto(record.image_base64)}
                          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                          aria-label="Lihat Foto Detail"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-semibold italic">No Photo</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] border border-emerald-500/10">
                        <Check className="w-3 h-3" /> {record.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(record.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="Hapus Presensi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 text-xs font-semibold text-on-surface-variant select-none">
              <div className="flex items-center gap-1.5">
                <span>Halaman</span>
                <strong className="text-on-surface">{currentPage}</strong>
                <span>dari</span>
                <strong className="text-on-surface">{totalPages}</strong>
                <span className="text-[10px] text-[#94A3B8] font-bold">({attendanceRecords.length} Riwayat)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                </button>
                
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
