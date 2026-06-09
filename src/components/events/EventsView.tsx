import React, { useState } from 'react';
import { Plus, CalendarHeart } from 'lucide-react';
import { CampusEvent, EventCategory, CampusEventCreatePayload } from '../../types';
import Skeleton from '../ui/Skeleton';

// Import sub-komponen modular
import EventCard from './EventCard';
import EventFilterTabs from './EventFilterTabs';
import EventFormDrawer from './EventFormDrawer';

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
  
  // Tab kategori filter aktif
  const [activeTab, setActiveTab] = useState<string>('semua');
  // Sub-filter status waktu aktif
  const [statusFilter, setStatusFilter] = useState<'semua' | 'akan_datang' | 'sedang_berlangsung' | 'selesai'>('semua');

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
    // 1. Filter Kategori Tab
    if (activeTab !== 'semua' && e.category !== activeTab) {
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

  // Urutkan event: event_date ASC, lalu start_time ASC
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.event_date !== b.event_date) {
      return a.event_date.localeCompare(b.event_date);
    }
    return a.start_time.localeCompare(b.start_time);
  });

  // Tampilkan loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2 animate-pulse" />
            <Skeleton className="h-4 w-72 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
              <Skeleton className="h-6 w-3/4 animate-pulse" />
              <Skeleton className="h-4 w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left font-sans">
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
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-medium rounded-xl shadow-sm transition-all text-sm cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" />
          Event Baru
        </button>
      </div>

      {/* Tabs Filter Bar & Status Bar */}
      <EventFilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        events={events}
      />

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
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-6">
          <div className="relative w-24 h-24 mb-4 flex items-center justify-center text-primary/30">
            <CalendarHeart className="w-20 h-20" />
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
              className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-none font-sans"
            >
              Tambah Event Baru
            </button>
          )}
        </div>
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
