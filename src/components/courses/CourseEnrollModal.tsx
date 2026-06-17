/**
 * =============================================================================
 * Planly — CourseEnrollModal.tsx
 * 
 * Kegunaan:
 * Komponen antarmuka modul Mata Kuliah terdaftar (daftar grid kelas, ruangan, dosen, absensi, & detail materi).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan CoursesView.tsx (orkestrator) dan berkomunikasi dengan server via coursesService.
 * 
 * Aliran Data / State:
 * - Mengambil data detail perkuliahan user aktif, menghitung kelas terdekat hari berjalan, dan mendaftarkan kelas baru.
 * =============================================================================
 */

import React, { useState } from 'react';
import { X, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Course } from '../../types';
import CustomSelect from '../ui/CustomSelect';
import TimePicker from '../ui/TimePicker';
import { dayOfWeekOptions, colorsOption } from './courseHelpers';

interface CourseEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: Course) => void;
}

/**
 * Komponen CourseEnrollModal
 * 
 * Dialog popup untuk mendaftarkan mata kuliah baru ke dalam jadwal semester.
 * Memuat validasi form lengkap (Kode, Nama matakuliah, SKS, Dosen, Ruang kelas, dan Jam Kuliah).
 */
export default function CourseEnrollModal({
  isOpen,
  onClose,
  onAddCourse
}: CourseEnrollModalProps) {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [sks, setSks] = useState(3);
  const [room, setRoom] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [colorHex, setColorHex] = useState('#3525cd');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!courseCode || !courseName || !room || !lecturerName) {
      setErrorMsg('Harap isi semua kolom pendaftaran.');
      return;
    }

    onAddCourse({
      id: 0,
      course_code: courseCode.trim().toUpperCase(),
      course_name: courseName,
      sks,
      room,
      lecturer_name: lecturerName,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      color_hex: colorHex,
      user_id: 1
    });

    // Reset Form
    setCourseCode('');
    setCourseName('');
    setSks(3);
    setRoom('');
    setLecturerName('');
    setDayOfWeek('Monday');
    setStartTime('09:00');
    setEndTime('10:30');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-[560px] overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-slate-850 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface text-lg">Tambah Mata Kuliah Baru</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Masukkan rincian untuk jadwal akademik Anda berikutnya
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Kode & Nama */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Kode Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="STI001"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Nama Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Website Programming"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* SKS & Ruangan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                SKS (Kredit) <span className="text-red-500">*</span>
              </label>
              <div className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg h-10 overflow-hidden grid grid-cols-[1fr_28px] grid-rows-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <input
                  type="number"
                  min={1}
                  max={6}
                  required
                  value={sks}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setSks(Math.max(1, Math.min(6, val)));
                    }
                  }}
                  className="bg-transparent text-on-surface font-medium px-3 py-1 row-span-2 border-none outline-none focus:outline-none text-sm"
                  style={{ appearance: 'textfield', WebkitAppearance: 'none', MozAppearance: 'textfield' } as any}
                />
                <button
                  type="button"
                  onClick={() => setSks(Math.min(6, sks + 1))}
                  className="flex items-center justify-center text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-l border-[#E2E8F0] dark:border-slate-700 bg-transparent border-none p-0"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setSks(Math.max(1, sks - 1))}
                  className="flex items-center justify-center text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-l border-t border-[#E2E8F0] dark:border-slate-700 bg-transparent border-none p-0"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Lokasi / Ruangan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Kampus Berkoh, Ruang 2.1"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* Dosen Pengampu */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Nama Dosen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Sunaryono, M.Kom."
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
              className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
            />
          </div>

          {/* Hari & Jam */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Hari Kuliah <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={dayOfWeek}
                onChange={setDayOfWeek}
                options={dayOfWeekOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Jam Mulai <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={startTime}
                onChange={startTime => setStartTime(startTime)}
                required
                position="up"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Jam Selesai <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={endTime}
                onChange={endTime => setEndTime(endTime)}
                required
                position="up"
              />
            </div>
          </div>

          {/* Pilihan Warna Dot */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Warna Tema <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {colorsOption.map((c) => {
                const isSelected = colorHex === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColorHex(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                      isSelected ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex justify-end gap-3 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-[#F1F5F9] dark:bg-slate-800 text-on-surface cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-[#4F46E5] text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
            >
              Tambah Mata Kuliah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
