/**
 * =============================================================================
 * Planly — EventCard.tsx
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

import React, { useState } from 'react';
import { Star, Clock, MapPin, Users, Pencil, Trash2 } from 'lucide-react';
import { CampusEvent, EventCategory } from '../../types';
import { hexToRgb } from '../../utils/color';

interface EventCardProps {
  event: CampusEvent;
  onOpenEdit: (event: CampusEvent) => void;
  onDelete: (id: number) => void;
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
 * Komponen EventCard
 * 
 * Kartu visual representatif untuk satu kegiatan kampus non-kuliah.
 * Mengenkapsulasi status konfirmasi penghapusan lokal dan kalkulasi status waktu acara.
 */
export default function EventCard({
  event,
  onOpenEdit,
  onDelete
}: EventCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Menentukan status waktu event secara dinamis
  const getEventStatus = (e: CampusEvent): 'akan_datang' | 'sedang_berlangsung' | 'selesai' => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    if (e.event_date < todayStr) {
      return 'selesai';
    } else if (e.event_date > todayStr) {
      return 'akan_datang';
    } else {
      if (currentTimeStr < e.start_time) {
        return 'akan_datang';
      } else if (currentTimeStr > e.end_time) {
        return 'selesai';
      } else {
        return 'sedang_berlangsung';
      }
    }
  };

  const status = getEventStatus(event);
  const colorHex = CATEGORY_COLORS[event.category];

  return (
    <div
      style={{ '--glow-color': hexToRgb(colorHex) } as React.CSSProperties}
      className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(var(--glow-color),0.06)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.08)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_20px_40px_rgba(var(--glow-color),0.12)] transition-all duration-300 flex flex-col justify-between text-left"
    >
      <div>
        {/* Header Kartu */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <span
            style={{ 
              backgroundColor: `${colorHex}15`, 
              color: colorHex 
            }}
            className="px-2.5 py-1 rounded-full text-xs font-bold"
          >
            {CATEGORY_LABELS[event.category]}
          </span>
          
          <div className="flex items-center gap-1.5">
            {event.is_important && (
              <span className="p-1 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full animate-pulse" title="Penting">
                <Star className="w-4 h-4 fill-amber-500" />
              </span>
            )}
            
            {/* Status Waktu Lencana */}
            {status === 'sedang_berlangsung' && (
              <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sedang Berlangsung
              </span>
            )}
            {status === 'akan_datang' && (
              <span className="bg-blue-50 dark:bg-blue-955/35 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Akan Datang
              </span>
            )}
            {status === 'selesai' && (
              <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-transparent text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-bold">
                Selesai
              </span>
            )}
          </div>
        </div>

        {/* Detail Event */}
        <h3 className="font-bold text-on-surface text-base line-clamp-1">
          {event.event_name}
        </h3>
        
        {event.description && (
          <p className="text-on-surface-variant text-xs mt-1.5 mb-3.5 line-clamp-2 font-medium leading-relaxed">
            {event.description}
          </p>
        )}

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
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
        {isConfirmingDelete ? (
          <div className="flex items-center justify-between w-full bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200/50 dark:border-red-900/50">
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">Yakin hapus event ini?</span>
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(event.id)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg cursor-pointer border-none"
              >
                Hapus
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg cursor-pointer border-none"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-[10px] text-on-surface-variant/60 font-medium" style={{ display: 'none' }}>ID: #{event.id}</span>
            <div className="flex gap-2 justify-center items-center ml-auto">
              <button
                onClick={() => onOpenEdit(event)}
                className="p-1.5 bg-white border border-slate-200/80 text-slate-600 hover:text-primary hover:bg-[#F5F2FF] dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer bg-transparent"
                title="Ubah Event"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsConfirmingDelete(true)}
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
}
