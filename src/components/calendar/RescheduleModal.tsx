/**
 * =============================================================================
 * Planly — RescheduleModal.tsx
 * 
 * Kegunaan:
 * Komponen visualisasi jadwal perkuliahan, agenda rutin, reschedule, & kalender interaktif bulanan/mingguan.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan CalendarView.tsx (orkestrator) dan terintegrasi dengan Google / Outlook Calendar.
 * 
 * Aliran Data / State:
 * - Membaca kueri jadwal kuliah harian/bulanan mahasiswa, memicu form reschedule kelas, dan check-in kehadiran.
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Course } from '../../types';
import DatePicker from '../ui/DatePicker';
import TimePicker from '../ui/TimePicker';

interface RescheduleModalProps {
  isOpen: boolean;
  course: Course | null;
  selectedISODate: string;
  onClose: () => void;
  onSubmit: (payload: {
    course_id: number;
    original_date: string;
    new_date: string;
    new_start_time: string;
    new_end_time: string;
    is_canceled: boolean;
    note: string | null;
  }) => void;
}

/**
 * Komponen RescheduleModal
 * 
 * Dialog formulir kustom untuk memindahkan jadwal kuliah (reschedule) ke tanggal
 * dan jam baru. Terdiri atas DatePicker, TimePicker, dan input alasan pemindahan.
 */
export default function RescheduleModal({
  isOpen,
  course,
  selectedISODate,
  onClose,
  onSubmit
}: RescheduleModalProps) {
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');

  // Set default values saat modal dibuka
  useEffect(() => {
    if (course) {
      setRescheduleDate(selectedISODate);
      setRescheduleStartTime(course.start_time);
      setRescheduleEndTime(course.end_time);
      setRescheduleNote('');
    }
  }, [course, selectedISODate]);

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      alert('Harap lengkapi seluruh formulir pemindahan sesi.');
      return;
    }

    onSubmit({
      course_id: course.id,
      original_date: selectedISODate,
      new_date: rescheduleDate,
      new_start_time: rescheduleStartTime,
      new_end_time: rescheduleEndTime,
      is_canceled: false,
      note: rescheduleNote.trim() || null
    });
  };

  const getIndonesianDayName = (day: string) => {
    const map: Record<string, string> = {
      'Sunday': 'Minggu',
      'Monday': 'Senin',
      'Tuesday': 'Selasa',
      'Wednesday': 'Rabu',
      'Thursday': 'Kamis',
      'Friday': 'Jumat',
      'Saturday': 'Sabtu'
    };
    return map[day] || day;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-visible p-6 space-y-4 text-slate-900 dark:text-slate-100">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>Pindahkan Sesi Kuliah</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-100 p-1 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ringkasan Kuliah */}
        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left">
          <p className="font-bold text-slate-900 dark:text-white">{course.course_name}</p>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            {course.course_code} &bull; Sesi normal hari {getIndonesianDayName(course.day_of_week)}
          </p>
        </div>

        {/* Formulir Input */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal Baru</label>
            <DatePicker
              value={rescheduleDate}
              onChange={setRescheduleDate}
              required
              position="up"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jam Mulai Baru</label>
              <TimePicker
                value={rescheduleStartTime}
                onChange={setRescheduleStartTime}
                position="up"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jam Selesai Baru</label>
              <TimePicker
                value={rescheduleEndTime}
                onChange={setRescheduleEndTime}
                position="up"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alasan Pemindahan (Opsional)</label>
            <textarea
              value={rescheduleNote}
              onChange={(e) => setRescheduleNote(e.target.value)}
              placeholder="Contoh: Dosen ada tugas luar kota, kelas diganti malam hari"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Tombol Kontrol */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
            >
              Simpan Jadwal Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
