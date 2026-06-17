/**
 * =============================================================================
 * Planly — CalendarSyncPanel.tsx
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


import { Calendar, Globe, RefreshCw, Download, Link } from 'lucide-react';
import { CalendarSyncConfig } from '../../types';

interface CalendarSyncPanelProps {
  syncConfig: CalendarSyncConfig;
  isSyncingAll: boolean;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onConnectOutlook: () => void;
  onDisconnectOutlook: () => void;
  onToggleSyncSetting: (key: keyof CalendarSyncConfig) => void;
  onForceMassSync: () => void;
  onExportICS: () => void;
  onCopySubscriptionLink: () => void;
}

/**
 * Komponen CalendarSyncPanel
 * 
 * Bagian pengaturan yang memfasilitasi sinkronisasi kalender akademis Planly dengan platform luar
 * seperti Google Calendar dan Microsoft Outlook. Menyediakan kontrol untuk memilih tipe data
 * yang disinkronkan, tombol paksa sinkronisasi manual, ekspor berkas .ics, dan penyalinan tautan iCal.
 */
export default function CalendarSyncPanel({
  syncConfig,
  isSyncingAll,
  onConnectGoogle,
  onDisconnectGoogle,
  onConnectOutlook,
  onDisconnectOutlook,
  onToggleSyncSetting,
  onForceMassSync,
  onExportICS,
  onCopySubscriptionLink
}: CalendarSyncPanelProps) {
  const isAnyConnected = syncConfig.google_connected || syncConfig.outlook_connected;

  return (
    <div className="bg-white/65 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header Panel */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-[#F5F2FF] dark:bg-slate-800/50 flex items-center justify-center text-primary">
          <Calendar className="w-4.5 h-4.5" />
        </div>
        <h3 className="text-base font-bold text-on-surface">Sinkronisasi Kalender Eksternal</h3>
      </div>

      <p className="text-xs leading-relaxed text-on-surface-variant font-medium mb-5">
        Hubungkan Planly dengan Google Calendar atau Outlook untuk menyinkronkan jadwal kuliah, kuliah pengganti (reschedule), dan tenggat tugas secara otomatis.
      </p>

      {/* Baris Koneksi Google & Outlook */}
      <div className="space-y-3 mb-5">
        {/* Google Calendar */}
        <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/30 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center border border-slate-100 dark:border-slate-700 flex-shrink-0">
              <Globe className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <div>
              <span className="font-bold block text-on-surface font-sans">Google Calendar</span>
              <span className={`text-[10px] font-bold block ${syncConfig.google_connected ? 'text-emerald-500' : 'text-[#94A3B8]'}`}>
                {syncConfig.google_connected ? 'Terhubung' : 'Belum Terhubung'}
              </span>
            </div>
          </div>
          {syncConfig.google_connected ? (
            <button
              type="button"
              onClick={onDisconnectGoogle}
              className="px-3 py-1.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold rounded-lg text-[10px] cursor-pointer transition-colors"
            >
              Putuskan
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnectGoogle}
              className="px-3 py-1.5 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors"
            >
              Hubungkan
            </button>
          )}
        </div>

        {/* Microsoft Outlook */}
        <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/30 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center border border-slate-100 dark:border-slate-700 flex-shrink-0">
              <Calendar className="w-4.5 h-4.5 text-blue-700 dark:text-blue-500" />
            </div>
            <div>
              <span className="font-bold block text-on-surface font-sans">Microsoft Outlook</span>
              <span className={`text-[10px] font-bold block ${syncConfig.outlook_connected ? 'text-emerald-500' : 'text-[#94A3B8]'}`}>
                {syncConfig.outlook_connected ? 'Terhubung' : 'Belum Terhubung'}
              </span>
            </div>
          </div>
          {syncConfig.outlook_connected ? (
            <button
              type="button"
              onClick={onDisconnectOutlook}
              className="px-3 py-1.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold rounded-lg text-[10px] cursor-pointer transition-colors"
            >
              Putuskan
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnectOutlook}
              className="px-3 py-1.5 bg-primary hover:bg-[#4F46E5] text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors"
            >
              Hubungkan
            </button>
          )}
        </div>
      </div>

      {/* Konfigurasi Detail Sinkronisasi (Hanya muncul jika minimal satu kalender terhubung) */}
      {isAnyConnected && (
        <div className="bg-slate-50/50 dark:bg-slate-850/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-3.5 mb-5">
          <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-slate-150 dark:border-slate-800 pb-1">
            Pengaturan Sinkronisasi Otomatis
          </span>
          
          {/* Sinkronkan Kuliah */}
          <div className="flex justify-between items-center text-on-surface">
            <span className="font-medium">Sinkronkan Jadwal Kuliah</span>
            <button
              type="button"
              onClick={() => onToggleSyncSetting('sync_courses')}
              className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                syncConfig.sync_courses ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                syncConfig.sync_courses ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Sinkronkan Reschedules */}
          <div className="flex justify-between items-center text-on-surface">
            <span className="font-medium">Sinkronkan Kuliah Pengganti (Reschedule)</span>
            <button
              type="button"
              onClick={() => onToggleSyncSetting('sync_reschedules')}
              className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                syncConfig.sync_reschedules ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                syncConfig.sync_reschedules ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Sinkronkan Tugas */}
          <div className="flex justify-between items-center text-on-surface">
            <span className="font-medium">Sinkronkan Tenggat Tugas</span>
            <button
              type="button"
              onClick={() => onToggleSyncSetting('sync_tasks')}
              className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                syncConfig.sync_tasks ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                syncConfig.sync_tasks ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Sinkronkan Event Kampus */}
          <div className="flex justify-between items-center text-on-surface">
            <span className="font-medium">Sinkronkan Event Kampus</span>
            <button
              type="button"
              onClick={() => onToggleSyncSetting('sync_events')}
              className={`w-8 h-5 rounded-full relative cursor-pointer block transition-colors ${
                syncConfig.sync_events ? 'bg-primary' : 'bg-[#E2E8F0] dark:bg-slate-800'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                syncConfig.sync_events ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Tombol Force Sync */}
          <button
            type="button"
            disabled={isSyncingAll}
            onClick={onForceMassSync}
            className="w-full py-2 bg-primary hover:bg-[#4F46E5] disabled:bg-slate-200 disabled:dark:bg-slate-800 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      )}

      {/* Manual Export & Subscription Section */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          Integrasi Manual & iCalendar (.ics)
        </span>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onExportICS}
            className="flex-1 h-9 px-3 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-on-surface"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh File .ics</span>
          </button>
          <button
            type="button"
            onClick={onCopySubscriptionLink}
            className="flex-1 h-9 px-3 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 hover:border-primary hover:text-primary rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-on-surface"
          >
            <Link className="w-3.5 h-3.5" />
            <span>Salin Link Kalender</span>
          </button>
        </div>
      </div>
    </div>
  );
}
