/**
 * =============================================================================
 * Planly — DatePicker.tsx
 * 
 * Kegunaan:
 * Komponen antarmuka (UI) umum reusable (CustomSelect, DatePicker, Skeleton loader, alert toast, EmptyState, dll.).
 * 
 * Relasi & Dependency:
 * - Digunakan berulang kali (shared components) oleh berbagai modul halaman View di aplikasi.
 * 
 * Aliran Data / State:
 * - Menerima props input, trigger event handler, dan mengontrol transisi visual antarmuka agar konsisten.
 * =============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" format
  onChange: (val: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
  position?: 'up' | 'down';
  placeholder?: string;
  disabled?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  required,
  className,
  id,
  position = 'down',
  placeholder = 'Pilih Tanggal',
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current date or fallback to today
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    // month is 0-indexed in JS Date
    return new Date(y, m - 1, d);
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewedDate, setViewedDate] = useState(() => selectedDate || new Date());

  // Update viewed date when selected date changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewedDate(selectedDate);
    }
  }, [value]);

  const year = viewedDate.getFullYear();
  const month = viewedDate.getMonth(); // 0-indexed

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const WEEK_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Format Date to YYYY-MM-DD
  const formatYYYYMMDD = (d: Date): string => {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}-${m}-${day}`;
  };

  // Format Date to friendly Indonesian string
  const formatFriendlyIndo = (d: Date): string => {
    const day = d.getDate();
    const mName = MONTH_NAMES[d.getMonth()];
    const y = d.getFullYear();
    return `${day} ${mName} ${y}`;
  };

  // Generate 42 days grid for calendar (6 weeks)
  const getGridDays = (): Date[] => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Set start day to the Sunday of the first week
    startDay.setDate(startDay.getDate() - dayOfWeek);

    const grid = [];
    for (let i = 0; i < 42; i++) {
      const current = new Date(startDay);
      current.setDate(startDay.getDate() + i);
      grid.push(current);
    }
    return grid;
  };

  // Navigate months
  const prevMonth = () => {
    setViewedDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewedDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayDate: Date) => {
    onChange(formatYYYYMMDD(dayDate));
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const gridDays = getGridDays();

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 font-semibold flex items-center justify-between gap-2 hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all no-animate ${
          disabled 
            ? 'opacity-60 cursor-not-allowed pointer-events-none bg-slate-100 dark:bg-slate-850' 
            : 'cursor-pointer'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{selectedDate ? formatFriendlyIndo(selectedDate) : placeholder}</span>
        </span>
      </button>

      {/* Hidden input for form verification */}
      {required && (
        <input
          type="hidden"
          value={value || ''}
          required={required}
        />
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className={`absolute z-50 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 animate-fade-in w-[290px] ${
            position === 'up' ? 'bottom-full mb-2' : 'mt-2'
          }`}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer no-animate"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer no-animate"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEK_DAYS.map((d) => (
              <span key={d} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((dayDate, idx) => {
              const dayStr = formatYYYYMMDD(dayDate);
              const isSelected = value === dayStr;
              const isCurrentMonth = dayDate.getMonth() === month;
              const isToday = formatYYYYMMDD(new Date()) === dayStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(dayDate)}
                  className={`h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer no-animate ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm font-bold'
                      : isToday
                        ? 'border border-primary text-primary font-bold hover:bg-primary/10'
                        : isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-slate-350 dark:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {dayDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
