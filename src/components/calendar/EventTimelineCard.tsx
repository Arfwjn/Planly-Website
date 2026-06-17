/**
 * =============================================================================
 * Planly — EventTimelineCard.tsx
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

import React from 'react';
import { Clock, MapPin, User, Star } from 'lucide-react';
import { CampusEvent } from '../../types';
import { hexToRgb } from '../../utils/color';

interface EventTimelineCardProps {
  event: CampusEvent;
  selectedISODate: string;
  currentTime: Date;
}

/**
 * Komponen EventTimelineCard
 * 
 * Kartu event non-kuliah kampus di dalam timeline harian jadwal kuliah.
 * Menampilkan nama event, kategori event, lokasi, penyelenggara, deskripsi kustom,
 * serta bintang penanda jika event dinilai penting.
 */
export default function EventTimelineCard({
  event,
  selectedISODate,
  currentTime
}: EventTimelineCardProps) {
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentMin = hours * 60 + minutes;
  
  const [startH, startM] = event.start_time.split(':').map(Number);
  const [endH, endM] = event.end_time.split(':').map(Number);
  
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  const today = new Date();
  const formatDateYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const isToday = selectedISODate === formatDateYYYYMMDD(today);
  const isInProgress = isToday && currentMin >= startMin && currentMin <= endMin;
  const isCompleted = isToday && currentMin > endMin;

  const CATEGORY_LABELS: Record<string, string> = {
    seminar: 'Seminar',
    workshop: 'Workshop',
    study_club: 'Study Club',
    ukm: 'UKM',
    rapat_himpunan: 'Rapat Himpunan',
    lomba: 'Lomba / Kompetisi',
    webinar: 'Webinar',
    lainnya: 'Lainnya',
  };

  return (
    <div className={`flex gap-4 lg:gap-6 relative group transition-opacity duration-300 ${isCompleted ? 'opacity-60' : ''}`}>
      {/* Indikator Waktu di Kiri */}
      <div className="w-[50px] lg:w-[60px] flex-shrink-0 text-right pt-4">
        <span className={`text-xs font-bold block ${isInProgress ? 'text-emerald-500' : 'text-on-surface'}`}>
          {event.start_time}
        </span>
        <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest block">
          WIB
        </span>
      </div>

      {/* Titik Indikator Timeline */}
      <div className="relative flex items-start justify-center z-10 pt-4.5">
        <div className={`w-[12px] h-[12px] rounded-full bg-white border-2 ${
          isInProgress 
            ? 'border-emerald-500 ring-4 ring-emerald-500/20 animate-pulse bg-emerald-500' 
            : isCompleted 
              ? 'border-[#94A3B8] bg-[#94A3B8]' 
              : 'border-emerald-500 bg-white'
        }`}></div>
      </div>

      {/* Kartu Detail Event */}
      <div
        style={{ '--glow-color': hexToRgb(event.color_hex) } as React.CSSProperties}
        className={`flex-1 border backdrop-blur-md rounded-2xl p-5 relative transition-all duration-300 shadow-[0_8px_30px_rgba(var(--glow-color),0.04)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] ${
          isInProgress 
            ? 'border-emerald-500/45 bg-emerald-500/[0.03] ring-1 ring-emerald-500/10' 
            : 'bg-white/65 dark:bg-slate-900/70 border-white/60 dark:border-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-900/85'
        }`}
      >
        <div className="flex justify-between items-start mb-3 pl-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-on-surface">
                {event.event_name}
              </h3>
              {event.is_important && (
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
              )}
            </div>
            {/* Tag Status Dinamis */}
            {isInProgress ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Berlangsung Sekarang
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Selesai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                Event Kampus
              </span>
            )}
          </div>
          {/* Badge Kategori Event */}
          <span
            className="text-[10px] font-extrabold px-3 py-1 rounded-lg text-white tracking-wider uppercase border border-white/10"
            style={{
              backgroundColor: event.color_hex,
              boxShadow: `0 4px 12px rgba(var(--glow-color), 0.25)`
            }}
          >
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
        </div>

        {/* Info detail jam, penyelenggara, lokasi */}
        <div className="pl-2 space-y-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {event.start_time} - {event.end_time} WIB
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{event.organizer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-[10px] text-on-surface-variant/80 italic mt-2.5 bg-slate-50 dark:bg-slate-850/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
              Keterangan: {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
