/**
 * =============================================================================
 * Planly — EventsView.tsx
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

import { useState } from 'react';
import { Plus, CalendarHeart, PartyPopper, Sparkles } from 'lucide-react';
import EmptyState from '../ui/InteractiveEmptyState';
import { CampusEvent, CampusEventCreatePayload } from '../../types';
import Skeleton from '../ui/Skeleton';

// Import sub-komponen modular
import EventCard from './EventCard';
import EventFormDrawer from './EventFormDrawer';
import CustomSelect from '../ui/CustomSelect';

interface EventsViewProps {
  events: CampusEvent[];
  onAddEvent: (event: CampusEventCreatePayload) => void;
  onEditEvent: (eventId: number, event: Partial<CampusEvent>) => void;
  onDeleteEvent: (eventId: number) => void;
  searchQuery: string;
  loading?: boolean;
}

/**
 * Komponen EventsView (Orchestrator)
 * 
 * Halaman utama untuk manajemen kegiatan/event kampus non-kuliah.
 * Merakit tabs penyaring, grid daftar event, laci formulir input, dan skeletal loading state.
 */
export default function EventsView({
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  searchQuery,
  loading = false,
}: EventsViewProps) {
  
  // Tab status waktu filter aktif
  const [statusFilter, setStatusFilter] = useState<'semua' | 'akan_datang' | 'sedang_berlangsung' | 'selesai'>('semua');
  // Kategori filter aktif
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  // Sort order aktif
  const [sortBy, setSortBy] = useState<string>('date-asc');

  // Form Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [selectedEventData, setSelectedEventData] = useState<CampusEvent | null>(null);

  // Menentukan status event untuk disaring
  const getEventStatus = (event: CampusEvent): 'akan_datang' | 'sedang_berlangsung' | 'selesai' => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    if (event.event_date < todayStr) {
      return 'selesai';
    } else if (event.event_date > todayStr) {
      return 'akan_datang';
    } else {
      if (currentTimeStr < event.start_time) {
        return 'akan_datang';
      } else if (currentTimeStr > event.end_time) {
        return 'selesai';
      } else {
        return 'sedang_berlangsung';
      }
    }
  };

  const handleOpenAdd = () => {
    setEditEventId(null);
    setSelectedEventData(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: CampusEvent) => {
    setEditEventId(event.id);
    setSelectedEventData(event);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (payload: CampusEventCreatePayload) => {
    if (editEventId !== null) {
      onEditEvent(editEventId, payload);
    } else {
      onAddEvent(payload);
    }
    setIsFormOpen(false);
    setEditEventId(null);
    setSelectedEventData(null);
  };

  // Filter & Search Logic
  const filteredEvents = events.filter((e) => {
    // 1. Filter Kategori
    if (categoryFilter !== 'semua' && e.category !== categoryFilter) {
      return false;
    }

    // 2. Filter Status Waktu
    if (statusFilter !== 'semua') {
      const status = getEventStatus(e);
      if (statusFilter === 'akan_datang' && status !== 'akan_datang') return false;
      if (statusFilter === 'sedang_berlangsung' && status !== 'sedang_berlangsung') return false;
      if (statusFilter === 'selesai' && status !== 'selesai') return false;
    }

    // 3. Kata Kunci Pencarian
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

  // Urutkan event berdasarkan sortBy
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date-asc') {
      if (a.event_date !== b.event_date) {
        return a.event_date.localeCompare(b.event_date);
      }
      return a.start_time.localeCompare(b.start_time);
    } else if (sortBy === 'date-desc') {
      if (a.event_date !== b.event_date) {
        return b.event_date.localeCompare(a.event_date);
      }
      return b.start_time.localeCompare(a.start_time);
    } else { // name-asc
      return a.event_name.localeCompare(b.event_name);
    }
  });

  // Tampilkan loading skeleton
  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full space-y-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-44 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] dark:border-slate-800 pb-3 mb-6">
          <div className="flex gap-6">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-48 rounded-xl" />
            <Skeleton className="h-10 w-full sm:w-44 rounded-xl" />
          </div>
        </div>

        {/* Grid List Event Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 space-y-4 flex flex-col justify-between h-[180px]">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left font-sans">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
              <CalendarHeart className="w-8 h-8 text-primary" />
              <span>Event Kampus</span>
            </h1>
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
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-medium rounded-xl shadow-sm transition-all text-sm cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" />
          Event Baru
        </button>
      </div>

      {/* Controls Row (Tabs on left, Dropdowns on right) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] dark:border-slate-800 pb-3 mb-6">
        {/* Tab filter status */}
        <div className="flex gap-6 flex-wrap">
          {(['semua', 'akan_datang', 'sedang_berlangsung', 'selesai'] as const).map((status) => {
            const label = status === 'semua' ? 'Semua Event' : status === 'akan_datang' ? 'Akan Datang' : status === 'sedang_berlangsung' ? 'Sedang Berlangsung' : 'Selesai';
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`pb-3 border-b-2 -mb-[14px] font-semibold text-sm px-1 cursor-pointer transition-all ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="w-full sm:w-48">
            <CustomSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'semua', label: 'Semua Kategori' },
                { value: 'seminar', label: 'Seminar' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'study_club', label: 'Study Club' },
                { value: 'ukm', label: 'UKM' },
                { value: 'rapat_himpunan', label: 'Rapat Himpunan' },
                { value: 'lomba', label: 'Lomba / Kompetisi' },
                { value: 'webinar', label: 'Webinar' },
                { value: 'lainnya', label: 'Lainnya' }
              ]}
              placeholder="Kategori"
              position="down"
            />
          </div>
          <div className="w-full sm:w-44">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'date-asc', label: 'Tanggal Terdekat' },
                { value: 'date-desc', label: 'Tanggal Terjauh' },
                { value: 'name-asc', label: 'Nama Event (A-Z)' }
              ]}
              placeholder="Urutkan"
              position="down"
            />
          </div>
        </div>
      </div>

      {/* Grid List Event */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpenEdit={handleOpenEdit}
              onDelete={onDeleteEvent}
            />
          ))}
        </div>
      ) : (
        /* Fallback Kosong */
        <EmptyState
          icons={[
            <PartyPopper className="w-5 h-5" />,
            <CalendarHeart className="w-5 h-5" />,
            <Sparkles className="w-5 h-5" />,
          ]}
          title={searchQuery ? 'Tidak Ada Event Ditemukan' : 'Belum Ada Event Kampus'}
          description={searchQuery ? 'Tidak ada kegiatan kampus yang cocok dengan kata kunci pencarian Anda.' : 'Tambahkan event pertama Anda seperti seminar, workshop, kegiatan UKM, atau rapat organisasi mahasiswa.'}
          action={!searchQuery ? {
            label: 'Tambah Event Baru',
            icon: <Plus className="w-4 h-4" />,
            onClick: handleOpenAdd,
          } : undefined}
        />
      )}

      {/* Drawer Form Slide-over */}
      <EventFormDrawer
        isOpen={isFormOpen}
        editEventId={editEventId}
        initialEventData={selectedEventData}
        onClose={() => {
          setIsFormOpen(false);
          setEditEventId(null);
          setSelectedEventData(null);
        }}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
