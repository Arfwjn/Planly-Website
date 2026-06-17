/**
 * =============================================================================
 * Planly — EventFormDrawer.tsx
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

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CampusEvent, EventCategory, CampusEventCreatePayload } from '../../types';
import CustomSelect from '../ui/CustomSelect';
import DatePicker from '../ui/DatePicker';
import TimePicker from '../ui/TimePicker';
import { useToast } from '../ui/Toast';

interface EventFormDrawerProps {
  isOpen: boolean;
  editEventId: number | null;
  initialEventData: CampusEvent | null;
  onClose: () => void;
  onSubmit: (payload: CampusEventCreatePayload) => void;
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  seminar: 'Seminar',
  workshop: 'Workshop',
  study_club: 'Study Club',
  ukm: 'UKM',
  rapat_himpunan: 'Rapat Himpunan',
  lomba: 'Lomba / Kompetisi',
  webinar: 'Webinar',
  lainnya: 'Lainnya',
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  seminar: '#6366F1',
  workshop: '#F59E0B',
  study_club: '#10B981',
  ukm: '#8B5CF6',
  rapat_himpunan: '#EF4444',
  lomba: '#EC4899',
  webinar: '#06B6D4',
  lainnya: '#6B7280',
};

/**
 * Komponen EventFormDrawer
 * 
 * Laci geser kanan (slide-over drawer) yang berisi formulir untuk
 * menambah kegiatan kampus baru atau menyunting detail kegiatan yang sudah ada.
 */
export default function EventFormDrawer({
  isOpen,
  editEventId,
  initialEventData,
  onClose,
  onSubmit
}: EventFormDrawerProps) {
  const toast = useToast();

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('seminar');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formLocation, setFormLocation] = useState('');
  const [formOrganizer, setFormOrganizer] = useState('');
  const [formIsImportant, setFormIsImportant] = useState(false);

  // Set nilai form berdasarkan data yang ingin diedit atau dikosongkan
  useEffect(() => {
    if (initialEventData && editEventId !== null) {
      setFormName(initialEventData.event_name);
      setFormCategory(initialEventData.category);
      setFormDescription(initialEventData.description || '');
      setFormDate(initialEventData.event_date);
      setFormStartTime(initialEventData.start_time);
      setFormEndTime(initialEventData.end_time);
      setFormLocation(initialEventData.location);
      setFormOrganizer(initialEventData.organizer);
      setFormIsImportant(initialEventData.is_important);
    } else {
      setFormName('');
      setFormCategory('seminar');
      setFormDescription('');
      setFormDate('');
      setFormStartTime('08:00');
      setFormEndTime('10:00');
      setFormLocation('');
      setFormOrganizer('');
      setFormIsImportant(false);
    }
  }, [initialEventData, editEventId, isOpen]);

  if (!isOpen) return null;

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDate || !formStartTime || !formEndTime || !formLocation.trim() || !formOrganizer.trim()) {
      toast.error('Harap isi semua kolom yang wajib diisi!');
      return;
    }

    onSubmit({
      event_name: formName,
      category: formCategory,
      description: formDescription.trim() || null,
      event_date: formDate,
      start_time: formStartTime,
      end_time: formEndTime,
      location: formLocation,
      organizer: formOrganizer,
      color_hex: CATEGORY_COLORS[formCategory],
      is_important: formIsImportant,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Latar Belakang Gelap (Backdrop) */}
      <div 
        className="absolute inset-0 bg-slate-955/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-all duration-300">
          
          {/* Header Formulir */}
          <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-[#F8FAFC] dark:bg-slate-850">
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-on-surface">
                {editEventId !== null ? 'Ubah Event Kampus' : 'Tambah Event Kampus'}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {editEventId !== null ? 'Edit detail informasi event Anda' : 'Buat event kegiatan kampus non-kuliah baru'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface-variant border border-slate-200/80 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Konten Input */}
          <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left">
            {/* Nama Kegiatan */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                Nama Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Seminar Nasional AI"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all"
              />
            </div>

            {/* Kategori Dropdown */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                Kategori Event <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formCategory}
                onChange={(val) => setFormCategory(val as EventCategory)}
                options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                  icon: (
                    <span 
                      className="w-3 h-3 rounded-full inline-block flex-shrink-0 border border-black/10 dark:border-white/10" 
                      style={{ backgroundColor: CATEGORY_COLORS[value as EventCategory] }}
                    />
                  )
                }))}
                placeholder="Pilih Kategori"
                position="down"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                Deskripsi / Detail Kegiatan
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Tambahkan catatan detail, link pendaftaran, pembicara, dll..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all resize-none"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                Tanggal Kegiatan <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formDate}
                onChange={setFormDate}
                required
                position="down"
              />
            </div>

            {/* Jam Mulai & Jam Selesai */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <TimePicker
                  value={formStartTime}
                  onChange={setFormStartTime}
                  position="up"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                  Waktu Selesai <span className="text-red-500">*</span>
                </label>
                <TimePicker
                  value={formEndTime}
                  onChange={setFormEndTime}
                  position="up"
                />
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                Lokasi / Ruangan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Contoh: Aula Rektorat Lt. 3 / Zoom"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all"
              />
            </div>

            {/* Penyelenggara */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                Penyelenggara / Organisasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formOrganizer}
                onChange={(e) => setFormOrganizer(e.target.value)}
                placeholder="Contoh: HMPSTI / Coding Club"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-855 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all"
              />
            </div>

            {/* Penting Checkbox Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-855 border border-slate-200/80 dark:border-slate-700 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">Tandai Penting</span>
                <span className="text-[10px] text-on-surface-variant/80">Event akan diberi pin bintang emas</span>
              </div>
              <input
                type="checkbox"
                checked={formIsImportant}
                onChange={(e) => setFormIsImportant(e.target.checked)}
                className="w-4.5 h-4.5 text-primary border-slate-350 dark:border-slate-700 rounded focus:ring-primary cursor-pointer accent-primary"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer border-none"
              >
                {editEventId !== null ? 'Simpan Perubahan' : 'Tambah Event'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-on-surface-variant hover:text-on-surface hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
