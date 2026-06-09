import React from 'react';
import { Clock, MapPin, Users } from 'lucide-react';
import { CampusEvent, SidebarTab } from '../../types';
import { hexToRgb } from '../../utils/color';

interface TodayEventsPanelProps {
  events: CampusEvent[];
  onTabChange: (tab: SidebarTab) => void;
}

/**
 * Komponen TodayEventsPanel
 * 
 * Menampilkan daftar event/kegiatan non-kuliah yang diselenggarakan khusus hari ini.
 */
export default function TodayEventsPanel({
  events,
  onTabChange
}: TodayEventsPanelProps) {
  
  // Ambil tanggal hari ini dalam format YYYY-MM-DD (format en-CA)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayEvents = events.filter(e => e.event_date === todayStr);

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header Panel */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-lg font-bold text-on-surface">Event Hari Ini</h3>
        </div>
        <button
          onClick={() => onTabChange('events')}
          className="text-xs font-bold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
        >
          Lihat Semua Event
        </button>
      </div>

      {/* Grid List Event */}
      {todayEvents.length === 0 ? (
        <div className="text-center py-6 text-on-surface-variant text-xs font-medium">
          Tidak ada event non-kuliah yang terjadwal untuk hari ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {todayEvents.map(event => (
            <div
              key={event.id}
              style={{ '--glow-color': hexToRgb(event.color_hex) } as React.CSSProperties}
              className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(var(--glow-color),0.05)] dark:shadow-[0_8px_30px_rgba(var(--glow-color),0.07)] hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/85 hover:shadow-[0_15px_30px_rgba(var(--glow-color),0.1)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {event.category.replace('_', ' ')}
                  </span>
                  {event.is_important && (
                    <span className="text-xs text-yellow-500">⭐</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-on-surface mb-1">{event.event_name}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 font-medium">
                  {event.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
              
              {/* Meta Logistik */}
              <div className="space-y-1.5 text-[10px] text-on-surface-variant font-medium pt-2 border-t border-slate-50 dark:border-slate-800">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {event.start_time} - {event.end_time} WIB
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {event.location}
                </p>
                <p className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {event.organizer}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
