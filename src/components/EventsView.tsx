import React, { useState, useEffect } from 'react';
import { CampusEvent, EventCategory, CampusEventCreatePayload } from '../types';
import CustomSelect from './ui/CustomSelect';
import TimePicker from './ui/TimePicker';
import Skeleton from './ui/Skeleton';
import { 
  CalendarCheck, MapPin, Users, Clock, Star, Pencil, Trash2, Plus, X, 
  Search, CalendarHeart 
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { hexToRgb } from '../utils/color';

interface EventsViewProps {
  events: CampusEvent[];
  onAddEvent: (event: CampusEventCreatePayload) => void;
  onEditEvent: (eventId: number, event: Partial<CampusEvent>) => void;
  onDeleteEvent: (eventId: number) => void;
  searchQuery: string;
  loading?: boolean;
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

const COLOR_PRESETS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#6B7280',
];

export default function EventsView({
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  searchQuery,
  loading = false,
}: EventsViewProps) {
  const toast = useToast();
  
  // Tab Kategori Filter
  const [activeTab, setActiveTab] = useState<string>('semua');
  // Sub-filter status: 'semua' | 'akan_datang' | 'sedang_berlangsung' | 'selesai'
  const [statusFilter, setStatusFilter] = useState<'semua' | 'akan_datang' | 'sedang_berlangsung' | 'selesai'>('semua');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('seminar');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formLocation, setFormLocation] = useState('');
  const [formOrganizer, setFormOrganizer] = useState('');
  const [formColor, setFormColor] = useState('#6366F1');
  const [formIsImportant, setFormIsImportant] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Reset form
  const resetForm = () => {
    setEditEventId(null);
    setFormName('');
    setFormCategory('seminar');
    setFormDescription('');
    setFormDate('');
    setFormStartTime('08:00');
    setFormEndTime('10:00');
    setFormLocation('');
    setFormOrganizer('');
    setFormColor('#6366F1');
    setFormIsImportant(false);
  };

  // Open Form modal for adding
  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Open Form modal for editing
  const handleOpenEdit = (event: CampusEvent) => {
    setEditEventId(event.id);
    setFormName(event.event_name);
    setFormCategory(event.category);
    setFormDescription(event.description || '');
    setFormDate(event.event_date);
    setFormStartTime(event.start_time);
    setFormEndTime(event.end_time);
    setFormLocation(event.location);
    setFormOrganizer(event.organizer);
    setFormColor(event.color_hex);
    setFormIsImportant(event.is_important);
    setIsFormOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDate || !formStartTime || !formEndTime || !formLocation.trim() || !formOrganizer.trim()) {
      toast.error('Harap isi semua kolom yang wajib diisi!');
      return;
    }

    const payload: CampusEventCreatePayload = {
      event_name: formName,
      category: formCategory,
      description: formDescription || null,
      event_date: formDate,
      start_time: formStartTime,
      end_time: formEndTime,
      location: formLocation,
      organizer: formOrganizer,
      color_hex: formColor,
      is_important: formIsImportant,
    };

    if (editEventId !== null) {
      onEditEvent(editEventId, payload);
    } else {
      onAddEvent(payload);
    }
    setIsFormOpen(false);
    resetForm();
  };

  // Delete event confirmation
  const confirmDelete = (id: number) => {
    onDeleteEvent(id);
    setDeleteConfirmId(null);
  };

  // Helper untuk menentukan status event berdasarkan waktu
  const getEventStatus = (event: CampusEvent): 'akan_datang' | 'sedang_berlangsung' | 'selesai' => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    if (event.event_date < todayStr) {
      return 'selesai';
    } else if (event.event_date > todayStr) {
      return 'akan_datang';
    } else {
      // Hari yang sama, bandingkan jam
      if (currentTimeStr < event.start_time) {
        return 'akan_datang';
      } else if (currentTimeStr > event.end_time) {
        return 'selesai';
      } else {
        return 'sedang_berlangsung';
      }
    }
  };

  // Filter & Search Logic
  const filteredEvents = events.filter((e) => {
    // 1. Filter Category Tab
    if (activeTab !== 'semua' && e.category !== activeTab) {
      return false;
    }

    // 2. Filter Status Sub-filter
    if (statusFilter !== 'semua') {
      const status = getEventStatus(e);
      if (statusFilter === 'akan_datang' && status !== 'akan_datang') return false;
      if (statusFilter === 'sedang_berlangsung' && status !== 'sedang_berlangsung') return false;
      if (statusFilter === 'selesai' && status !== 'selesai') return false;
    }

    // 3. Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = e.event_name.toLowerCase().includes(query);
      const matchOrganizer = e.organizer.toLowerCase().includes(query);
      const matchLocation = e.location.toLowerCase().includes(query);
      const matchDesc = e.description?.toLowerCase().includes(query) || false;
      return matchName || matchOrganizer || matchLocation || matchDesc;
    }

    return true;
  });

  // Urutkan event: event_date ASC, start_time ASC. Show upcoming events first
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.event_date !== b.event_date) {
      return a.event_date.localeCompare(b.event_date);
    }
    return a.start_time.localeCompare(b.start_time);
  });

  // Menghitung jumlah per kategori
  const getCategoryCount = (category: string) => {
    if (category === 'semua') return events.length;
    return events.filter(e => e.category === category).length;
  };

  // Render Loading Skeleton Grid
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-2 flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface">Event Kampus</h1>
            <span className="bg-primary/10 text-primary dark:bg-primary/20 text-xs px-2.5 py-1 rounded-full font-semibold">
              {events.length} Kegiatan
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola kegiatan kampus non-kuliah Anda
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-medium rounded-xl shadow-sm transition-all text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Event Baru
        </button>
      </div>

      {/* 2. Filter/Tab Bar & Sub-filter */}
      <div className="space-y-3 bg-white border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-on-surface font-semibold text-sm border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
          Kategori Kegiatan
        </div>
        {/* Kategori Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
          <button
            onClick={() => setActiveTab('semua')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'semua'
                ? 'bg-primary text-white font-bold'
                : 'bg-white border border-slate-200/80 text-on-surface hover:text-primary hover:bg-slate-50'
            }`}
          >
            <span>Semua</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'semua' ? 'bg-white/25 text-white' : 'bg-[#F1F5F9] text-on-surface'}`}>
              {getCategoryCount('semua')}
            </span>
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const count = getCategoryCount(key);
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-primary text-white font-bold'
                    : 'bg-white border border-slate-200/80 text-on-surface hover:text-primary hover:bg-slate-50'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/25 text-white' : 'bg-[#F1F5F9] text-on-surface'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-filter Status */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs text-on-surface-variant/70 flex items-center mr-2">Status Waktu:</span>
          {(['semua', 'akan_datang', 'sedang_berlangsung', 'selesai'] as const).map((status) => {
            const label = status === 'semua' ? 'Semua Waktu' : status === 'akan_datang' ? 'Akan Datang' : status === 'sedang_berlangsung' ? 'Sedang Berlangsung' : 'Selesai';
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-white font-bold'
                    : 'bg-white border border-slate-200/80 text-on-surface hover:text-primary hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Event List (Cards) */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedEvents.map((event) => {
            const status = getEventStatus(event);
            const isDeleting = deleteConfirmId === event.id;

            return (
              <div
                key={event.id}
                style={{ '--glow-color': hexToRgb(event.color_hex) } as React.CSSProperties}
                className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.08)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_20px_40px_rgba(var(--glow-color),0.12)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span
                      style={{ 
                        backgroundColor: `${CATEGORY_COLORS[event.category]}15`, 
                        color: CATEGORY_COLORS[event.category] 
                      }}
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                    >
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {event.is_important && (
                        <span className="p-1 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full" title="Penting">
                          <Star className="w-4 h-4 fill-amber-500" />
                        </span>
                      )}
                      {/* Status indicator */}
                      {status === 'sedang_berlangsung' && (
                        <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Sedang Berlangsung
                        </span>
                      )}
                      {status === 'akan_datang' && (
                        <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Akan Datang
                        </span>
                      )}
                      {status === 'selesai' && (
                        <span className="bg-slate-100 border border-slate-200/50 dark:border-transparent dark:bg-slate-800 text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-on-surface text-base line-clamp-1">
                    {event.event_name}
                  </h3>
                  
                  {event.description && (
                    <p className="text-on-surface-variant text-xs mt-1.5 mb-3.5 line-clamp-2 font-medium">
                      {event.description}
                    </p>
                  )}

                  {/* Meta Details */}
                  <div className="space-y-2 text-xs text-on-surface-variant mt-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} • {event.start_time} - {event.end_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-on-surface">{event.organizer}</span>
                    </div>
                  </div>
                </div>                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                  {isDeleting ? (
                    <div className="flex items-center justify-between w-full bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200/50 dark:border-red-900/50">
                      <span className="text-xs font-semibold text-red-700 dark:text-red-400">Yakin hapus event ini?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmDelete(event.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] text-on-surface-variant/60 font-medium">ID: #{event.id}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(event)}
                          className="p-1.5 bg-white border border-slate-200/80 text-slate-600 hover:text-primary hover:bg-[#F5F2FF] dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                          title="Ubah Event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(event.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:text-red-400 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-100 dark:border-transparent rounded-lg transition-all cursor-pointer"
                          title="Hapus Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-6">
          {/* Custom SVG Illustration for Empty Events */}
          <div className="relative w-24 h-24 mb-4 flex items-center justify-center text-primary/30">
            <CalendarHeart className="w-20 h-20" />
            {/* Floating element */}
            <div className="absolute top-2 right-2 animate-bounce">
              <svg className="w-6 h-6 text-yellow-500/60" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-bold text-on-surface">
            {searchQuery ? 'Tidak Ada Event Ditemukan' : 'Belum Ada Event Kampus'}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 mb-6 max-w-sm font-medium">
            {searchQuery ? 'Tidak ada kegiatan kampus yang cocok dengan kata kunci pencarian Anda.' : 'Tambahkan event pertama Anda seperti seminar, workshop, kegiatan UKM, atau rapat organisasi mahasiswa.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer font-sans"
            >
              Tambah Event Baru
            </button>
          )}
        </div>
      )}

      {/* 5. Form Modal (Slide-over panel from the right) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsFormOpen(false)}
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-[#F8FAFC]">
                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    {editEventId !== null ? 'Ubah Event Kampus' : 'Tambah Event Kampus'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                    {editEventId !== null ? 'Edit detail informasi event Anda' : 'Buat event kegiatan kampus non-kuliah baru'}
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 bg-white hover:bg-slate-100 text-on-surface-variant border border-slate-200/80 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Event Name */}
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all"
                  />
                </div>

                {/* Category CustomSelect dropdown (required) - position="down" to avoid clipping */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                    Kategori Event <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={formCategory}
                    onChange={(val) => setFormCategory(val as EventCategory)}
                    options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
                    placeholder="Pilih Kategori"
                    position="down"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                    Deskripsi / Detail Kegiatan
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Tambahkan catatan detail, link pendaftaran, pembicara, dll..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all resize-none"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-1.5">
                    Tanggal Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all"
                  />
                </div>

                {/* Start Time & End Time */}
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

                {/* Location */}
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all"
                  />
                </div>

                {/* Organizer */}
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface text-sm outline-none transition-all"
                  />
                </div>

                {/* Color Preset Buttons */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wide mb-2">
                    Warna Label
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                          formColor === color 
                            ? 'border-slate-800 dark:border-slate-100 scale-110 shadow' 
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Important Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">Tandai Penting</span>
                    <span className="text-[10px] text-on-surface-variant/80">Event akan diberi pin bintang emas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsImportant}
                    onChange={(e) => setFormIsImportant(e.target.checked)}
                    className="w-4.5 h-4.5 text-primary border-slate-350 rounded focus:ring-primary cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    {editEventId !== null ? 'Simpan Perubahan' : 'Tambah Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 bg-white border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700 text-on-surface-variant hover:text-on-surface hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
