/**
 * =============================================================================
 * Planly — NotificationBanner.tsx
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

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

/**
 * Komponen NotificationBanner
 * 
 * Banner ini menganjurkan pengguna untuk mengaktifkan notifikasi desktop browser
 * guna menerima peringatan batas waktu (deadline) pengerjaan tugas kuliah.
 * Hanya akan dimunculkan bila browser mendukung notifikasi dan status permission saat ini adalah 'default'.
 */
export default function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Hanya tampilkan jika browser mendukung notifikasi dan status izinnya masih 'default'
    if ('Notification' in window && Notification.permission === 'default') {
      const isDismissed = sessionStorage.getItem('planly_notif_banner_dismissed') === 'true';
      if (!isDismissed) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleRequestPermission = () => {
    Notification.requestPermission().then((permission) => {
      setShowBanner(false);
      if (permission === 'granted') {
        new Notification('Planly', {
          body: 'Notifikasi batas waktu tugas berhasil diaktifkan!',
          icon: '/assets/logo.png'
        });
      }
    });
  };

  const handleDismiss = () => {
    sessionStorage.setItem('planly_notif_banner_dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-indigo-600/[0.02] border border-primary/15 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
      {/* Efek dekorasi cahaya latar belakang */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
      
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 animate-pulse mt-0.5">
          <Bell className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-xl">
          <h4 className="text-sm font-bold text-on-surface">Aktifkan Pengingat Batas Waktu</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Jangan sampai terlewat! Izinkan browser mengirimkan notifikasi pengingat sebelum batas waktu tugas kuliah Anda berakhir.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center font-sans z-10">
        <button
          onClick={handleDismiss}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-on-surface-variant hover:text-on-surface text-xs font-semibold rounded-lg transition-colors cursor-pointer bg-white"
        >
          Nanti Saja
        </button>
        <button
          onClick={handleRequestPermission}
          className="px-4 py-2 bg-primary hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Aktifkan
        </button>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-on-surface-variant/60 hover:text-on-surface cursor-pointer p-0.5 hover:bg-slate-100 rounded-full sm:hidden"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
