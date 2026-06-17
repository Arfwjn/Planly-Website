/**
 * =============================================================================
 * Planly — ConfirmModal.tsx
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


import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isDanger = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-[#E2E8F0] dark:border-slate-800 animate-zoom-in text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4.5 h-4.5 ${isDanger ? 'text-red-500' : 'text-primary'}`} />
            <span className="text-xs font-extrabold text-on-surface">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="px-5 py-4.5 text-xs font-semibold text-on-surface-variant leading-relaxed">
          {message}
        </div>

        {/* Action Controls */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-850/50 border-t border-[#E2E8F0] dark:border-slate-800 flex justify-end gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
              isDanger 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-primary hover:bg-[#4F46E5]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
