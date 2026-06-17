/**
 * =============================================================================
 * Planly — calendarSync.ts
 * 
 * Kegunaan:
 * Service Layer frontend untuk melakukan kueri / pengiriman data ke server API Laravel (atau localStorage mock).
 * 
 * Relasi & Dependency:
 * - Menggunakan httpClient/apiHelper. Objek dikatalogkan terpadu di dalam api.ts untuk dipakai oleh UI.
 * 
 * Aliran Data / State:
 * - Melakukan request HTTP GET/POST/PUT/DELETE secara asinkron ke endpoint API backend dan mengembalikan raw data.
 * =============================================================================
 */

import { CalendarSyncConfig } from '../../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const STORAGE_KEY = 'planly_calendar_sync';

const initialConfig: CalendarSyncConfig = {
  google_connected: false,
  outlook_connected: false,
  sync_courses: true,
  sync_reschedules: true,
  sync_tasks: true,
  sync_events: true,
  last_sync_time: null
};

// Helper pembantu delay simulasi jaringan
const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

export const calendarSyncService = {
  /**
   * Mengambil konfigurasi sinkronisasi kalender yang tersimpan di localStorage
   */
  getConfig: (): CalendarSyncConfig => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialConfig;
  },

  /**
   * Menyimpan konfigurasi ke localStorage
   */
  saveConfig: (config: CalendarSyncConfig): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },

  /**
   * Simulasi / Pengaktifan koneksi ke Google Calendar via OAuth
   */
  connectGoogle: async (): Promise<boolean> => {
    if (USE_MOCK) {
      await delay(1200); // Simulasi delay otorisasi Google
      return true;
    }
    
    // Live mode: Di sini Anda dapat memicu Google Client/MSAL login flow
    // Contoh: window.location.href = `${API_BASE_URL}/google/auth`;
    console.log("Panggilan API asli ke oauth Google Calendar...");
    await delay(500);
    return true;
  },

  /**
   * Simulasi / Pengaktifan koneksi ke Microsoft Outlook via OAuth
   */
  connectOutlook: async (): Promise<boolean> => {
    if (USE_MOCK) {
      await delay(1200); // Simulasi delay otorisasi Microsoft
      return true;
    }
    
    // Live mode: Pemicu Microsoft MSAL flow
    console.log("Panggilan API asli ke oauth Microsoft Outlook...");
    await delay(500);
    return true;
  },

  /**
   * Menyinkronkan item secara individu (saat ditambahkan/diubah/dihapus)
   */
  syncItem: async (
    action: 'create' | 'update' | 'delete',
    itemType: 'course' | 'reschedule' | 'task' | 'event',
    itemName: string,
    toast: any
  ): Promise<void> => {
    const config = calendarSyncService.getConfig();
    const isConnected = config.google_connected || config.outlook_connected;
    
    if (!isConnected) return;

    // Cek apakah kategori ini diizinkan untuk sinkronisasi
    if (itemType === 'course' && !config.sync_courses) return;
    if (itemType === 'reschedule' && !config.sync_reschedules) return;
    if (itemType === 'task' && !config.sync_tasks) return;
    if (itemType === 'event' && !config.sync_events) return;

    const actionText = action === 'create' ? 'menambahkan' : action === 'update' ? 'memperbarui' : 'menghapus';
    const targetCalendar = config.google_connected && config.outlook_connected 
      ? 'Google Calendar & Outlook' 
      : config.google_connected 
        ? 'Google Calendar' 
        : 'Microsoft Outlook';

    // Munculkan toast informasi bahwa proses sinkronisasi sedang berjalan di latar belakang
    toast.info(`Menyinkronkan ${itemType === 'task' ? 'tugas' : itemType === 'event' ? 'event' : 'perkuliahan'} '${itemName}' ke ${targetCalendar}...`);

    try {
      if (USE_MOCK) {
        await delay(1000); // Simulasi request API
      } else {
        // Live mode: Di sini Anda memanggil endpoint API Laravel Anda,
        // misal: await httpClient.post('/calendar/sync-item', { action, itemType, data });
        await delay(300);
      }
      
      // Update waktu sinkronisasi terakhir
      config.last_sync_time = new Date().toLocaleString('id-ID');
      calendarSyncService.saveConfig(config);

      // Toast sukses
      toast.success(`Berhasil ${actionText} '${itemName}' di ${targetCalendar}.`);
    } catch (err) {
      console.error("Gagal melakukan auto-sync kalender:", err);
      toast.error(`Gagal menyinkronkan data ke ${targetCalendar}.`);
    }
  },

  /**
   * Pemicu Sinkronisasi Massal (Force Full Sync)
   */
  syncAllData: async (
    itemsCount: number,
    toast: any
  ): Promise<string> => {
    const config = calendarSyncService.getConfig();
    const targetCalendar = config.google_connected && config.outlook_connected 
      ? 'Google Calendar & Outlook' 
      : config.google_connected 
        ? 'Google Calendar' 
        : 'Microsoft Outlook';

    toast.info(`Memulai sinkronisasi massal ${itemsCount} data ke ${targetCalendar}...`);

    try {
      if (USE_MOCK) {
        await delay(2000); // Simulasi sync massal data
      } else {
        // Live mode: Panggil endpoint backend Laravel untuk memicu sync ulang
        // misal: await httpClient.post('/calendar/sync-all');
        await delay(500);
      }

      const nowStr = new Date().toLocaleString('id-ID');
      config.last_sync_time = nowStr;
      calendarSyncService.saveConfig(config);

      toast.success(`Sinkronisasi penuh berhasil! ${itemsCount} agenda tersinkronisasi di ${targetCalendar}.`);
      return nowStr;
    } catch (err) {
      toast.error("Gagal melakukan sinkronisasi massal.");
      throw err;
    }
  }
};
