/**
 * =============================================================================
 * Planly — TimePicker.tsx
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
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string;          // "HH:MM" format
  onChange: (val: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
  position?: 'up' | 'down';
}

export default function TimePicker({ value, onChange, required, className, id, position = 'down' }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hours = parseInt(value?.split(':')[0] || '0', 10);
  const minutes = parseInt(value?.split(':')[1] || '0', 10);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const updateTime = (h: number, m: number) => {
    onChange(`${pad(h)}:${pad(m)}`);
  };

  const incHour = () => updateTime((hours + 1) % 24, minutes);
  const decHour = () => updateTime((hours - 1 + 24) % 24, minutes);
  const incMin = () => {
    const newMin = (minutes + 5) % 60;
    const newHour = minutes + 5 >= 60 ? (hours + 1) % 24 : hours;
    updateTime(newHour, newMin);
  };
  const decMin = () => {
    const newMin = (minutes - 5 + 60) % 60;
    const newHour = minutes - 5 < 0 ? (hours - 1 + 24) % 24 : hours;
    updateTime(newHour, newMin);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 font-semibold flex items-center justify-between gap-2 hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer no-animate"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="tabular-nums tracking-wider">{pad(hours)}:{pad(minutes)}</span>
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {hours >= 12 ? 'PM' : 'AM'}
        </span>
      </button>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          type="hidden"
          value={value}
          required={required}
        />
      )}

      {/* Dropdown Clock Picker */}
      {isOpen && (
        <div className={`absolute z-50 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 animate-fade-in min-w-[180px] ${position === 'up' ? 'bottom-full mb-2' : 'mt-2'}`}>
          <div className="flex items-center justify-center gap-4">
            {/* Hours Column */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={incHour}
                className="p-1 rounded-lg hover:bg-primary/10 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer no-animate"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-xl">
                <span className="text-2xl font-bold text-primary tabular-nums">{pad(hours)}</span>
              </div>
              <button
                type="button"
                onClick={decHour}
                className="p-1 rounded-lg hover:bg-primary/10 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer no-animate"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Jam</span>
            </div>

            {/* Separator */}
            <div className="text-2xl font-black text-primary select-none pb-6">:</div>

            {/* Minutes Column */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={incMin}
                className="p-1 rounded-lg hover:bg-primary/10 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer no-animate"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-xl">
                <span className="text-2xl font-bold text-primary tabular-nums">{pad(minutes)}</span>
              </div>
              <button
                type="button"
                onClick={decMin}
                className="p-1 rounded-lg hover:bg-primary/10 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer no-animate"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Menit</span>
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-4 gap-1.5">
              {['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { onChange(t); setIsOpen(false); }}
                  className={`px-1 py-1 rounded-md text-[9px] font-semibold transition-all cursor-pointer no-animate ${
                    value === t
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer no-animate"
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  );
}
