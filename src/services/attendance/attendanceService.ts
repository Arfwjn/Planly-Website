// =============================================================================
// Planly — Attendance Service (Modul Kehadiran/Absensi)
//
// File ini khusus buat ngurusin absensi masuk kuliah menggunakan scan wajah depan
// (snapshot webcam base64) dan geolokalasi lokasi GPS mahasiswa.
// =============================================================================

import { AttendanceRecord, AttendanceSubmitPayload } from '../../types';
import { USE_MOCK, delay, getStored, setStored, getNextMockId } from '../core/apiHelper';
import httpClient from '../core/httpClient';

export const attendanceService = {
  /**
   * GET /api/attendance
   * Ngambil seluruh riwayat absensi kelas yang pernah kita lakuin.
   */
  getAll: async (): Promise<AttendanceRecord[]> => {
    if (USE_MOCK) {
      await delay(300);
      return getStored<AttendanceRecord[]>('planly_attendance_records', []);
    }
    const { data } = await httpClient.get<AttendanceRecord[]>('/attendance');
    return data;
  },

  /**
   * POST /api/attendance
   * Ngirim data absensi baru (ngirim jepretan foto Base64 + lokasi koordinat GPS).
   */
  submit: async (payload: AttendanceSubmitPayload): Promise<AttendanceRecord> => {
    if (USE_MOCK) {
      await delay(500);
      const records = getStored<AttendanceRecord[]>('planly_attendance_records', []);
      const newRecord: AttendanceRecord = {
        id: getNextMockId(),
        user_id: 1,
        course_id: payload.course_id,
        course_code: payload.course_code,
        course_name: payload.course_name,
        date: payload.date,
        time: payload.time,
        status: payload.status,
        latitude: payload.latitude,
        longitude: payload.longitude,
        image_base64: payload.image_base64,
        verified_face: true, // Untuk mode mock, verifikasi wajah auto-lolos
      };
      setStored('planly_attendance_records', [newRecord, ...records]);
      return newRecord;
    }
    const { data } = await httpClient.post<AttendanceRecord>('/attendance', payload);
    return data;
  },

  /**
   * DELETE /api/attendance/{id}
   * Hapus riwayat absen tertentu (misal salah jepret wajah atau mau absen ulang).
   */
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      const records = getStored<AttendanceRecord[]>('planly_attendance_records', []);
      setStored('planly_attendance_records', records.filter(r => r.id !== id));
      return;
    }
    await httpClient.delete(`/attendance/${id}`);
  },
};
