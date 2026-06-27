/**
 * =============================================================================
 * Planly — FaceEnrollmentPreviewModal.tsx
 * 
 * Kegunaan:
 * Komponen konfigurasi Profil pengguna, pencapaian target akademik (IPK/GPA), sinkronisasi kalender OAuth, & backup data.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan ProfileView.tsx (orkestrator), profileService, dan calendarSync.
 * 
 * Aliran Data / State:
 * - Mengambil ringkasan data nilai IPK mahasiswa, kontrol sinkronisasi kalender eksternal, dan ekspor/impor data JSON.
 * =============================================================================
 */


import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface FaceEnrollmentPreviewModalProps {
  isOpen: boolean;
  photoUrl: string | null;
  registerDate: string | null;
  onClose: () => void;
}

export default function FaceEnrollmentPreviewModal({
  isOpen,
  photoUrl,
  registerDate,
  onClose
}: FaceEnrollmentPreviewModalProps) {
  if (!isOpen || !photoUrl) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-[#0f0f15]/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-[320px] overflow-hidden shadow-2xl p-5 text-center animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-on-surface uppercase">Wajah Terdaftar</h4>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-none bg-transparent"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-2 border-primary/20 bg-slate-50 dark:bg-slate-800 mb-4 shadow-inner">
          <img 
            src={photoUrl} 
            alt="Wajah Terdaftar" 
            className="w-full h-full object-cover" 
          />
        </div>
        <p className="text-[11px] text-on-surface-variant font-medium">
          Data terdaftar: <span className="font-semibold text-on-surface">{registerDate}</span>
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors border-none"
        >
          Tutup
        </button>
      </div>
    </div>,
    document.body
  );
}
