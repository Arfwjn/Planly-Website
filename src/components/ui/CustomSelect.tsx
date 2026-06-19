/**
 * =============================================================================
 * Planly — CustomSelect.tsx
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

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  position?: "up" | "down";
}

export default function CustomSelect({ value, onChange, options, placeholder = "Pilih...", className, id, disabled, position = "up" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const showSearch = options.length > 5;

  const filteredOptions = showSearch && search ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : options;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isOpen && showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, showSearch]);

  return (
    <div className={`relative ${className || ""}`} ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch("");
          }
        }}
        className={`w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white rounded-lg text-sm text-on-surface font-semibold flex items-center justify-between gap-2 hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all no-animate ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className={selectedOption ? "text-on-surface" : "text-on-surface-variant"}>{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-on-surface-variant flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 bg-white dark:bg-card-bg border border-card-border rounded-xl shadow-xl overflow-hidden animate-fade-in ${position === "up" ? "bottom-full mb-1.5" : "mt-1.5"}`}
        >
          {/* Search field (only for long lists) */}
          {showSearch && (
            <div className="p-2 border-b border-card-border">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className="w-full h-8 px-3 bg-slate-50 dark:bg-input-bg border border-[#E2E8F0] dark:border-card-border rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-on-surface-variant text-center">Tidak ada pilihan ditemukan</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left text-sm transition-colors cursor-pointer no-animate ${
                      isSelected ? "bg-primary/10 text-primary font-semibold" : "text-on-surface hover:bg-slate-50 dark:hover:bg-input-bg"
                    }`}
                  >
                    {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
