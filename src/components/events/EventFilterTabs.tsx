import React from 'react';
import { CampusEvent, EventCategory } from '../../types';

interface EventFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  statusFilter: 'semua' | 'akan_datang' | 'sedang_berlangsung' | 'selesai';
  onStatusFilterChange: (status: 'semua' | 'akan_datang' | 'sedang_berlangsung' | 'selesai') => void;
  events: CampusEvent[];
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
 * Komponen EventFilterTabs
 * 
 * Baris navigasi tab penyaring kategori kegiatan (seminar, workshop, UKM, dll)
 * dan status penyelesaian waktu (akan datang, sedang berlangsung, selesai).
 */
export default function EventFilterTabs({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  events
}: EventFilterTabsProps) {
  
  // Hitung jumlah kegiatan per kategori
  const getCategoryCount = (category: string) => {
    if (category === 'semua') return events.length;
    return events.filter(e => e.category === category).length;
  };

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm text-left">
      <div className="flex items-center gap-2 text-on-surface font-semibold text-sm border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
        Kategori Kegiatan
      </div>
      
      {/* Scrollbar Horizontal untuk Kategori */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        {/* Tab Semua */}
        <button
          onClick={() => onTabChange('semua')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border-none ${
            activeTab === 'semua'
              ? 'bg-primary text-white font-bold'
              : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-on-surface hover:text-primary hover:bg-slate-50'
          }`}
        >
          <span>Semua</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'semua' ? 'bg-white/25 text-white' : 'bg-[#F1F5F9] dark:bg-slate-800 text-on-surface'}`}>
            {getCategoryCount('semua')}
          </span>
        </button>

        {/* Tab per Kategori */}
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const count = getCategoryCount(key);
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border-none ${
                activeTab === key
                  ? 'bg-primary text-white font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-on-surface hover:text-primary hover:bg-slate-50'
              }`}
            >
              <span>{label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/25 text-white' : 'bg-[#F1F5F9] dark:bg-slate-800 text-on-surface'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-filter Status Waktu */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        <span className="text-xs text-on-surface-variant/70 flex items-center mr-2">Status Waktu:</span>
        {(['semua', 'akan_datang', 'sedang_berlangsung', 'selesai'] as const).map((status) => {
          const label = status === 'semua' ? 'Semua Waktu' : status === 'akan_datang' ? 'Akan Datang' : status === 'sedang_berlangsung' ? 'Sedang Berlangsung' : 'Selesai';
          return (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border-none ${
                statusFilter === status
                  ? 'bg-primary text-white font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-on-surface hover:text-primary hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
