// =============================================================================
// Planly — TypeScript Types
//
// File ini mendefinisikan interface dan tipe data TypeScript yang digunakan
// di seluruh aplikasi kita. Semua field di sini ditulis dalam format snake_case
// agar selaras dan cocok secara langsung dengan response JSON dari API Laravel.
// Hal ini memudahkan kita dalam memetakan data dari backend ke frontend tanpa
// perlu melakukan konversi format penulisan.
// =============================================================================

/**
 * Interface User merepresentasikan data pengguna (user) di sistem kita.
 * Berisi informasi pribadi dasar seperti nama, email, NIM, jurusan,
 * semester, dan URL foto profil.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  nim: string | null;
  major: string | null;
  semester: number | null;
  profile_photo_url: string | null;
  gpa_current?: number | null;
  gpa_target?: number | null;
  target_study_hours?: number | null;
  address?: string | null;
  calendar_sync?: CalendarSyncConfig;
}

/**
 * Interface Course merepresentasikan data mata kuliah yang diambil oleh user.
 * Menyimpan informasi kode, nama matakuliah, jumlah SKS, dosen pengampu,
 * ruangan, hari, waktu mulai dan selesai, serta warna label untuk kalender.
 */
export interface Course {
  id: number;
  user_id: number;
  course_code: string;
  course_name: string;
  sks: number;
  lecturer_name: string;
  room: string;
  day_of_week: string; // 'Monday', 'Tuesday', dll.
  start_time: string; // format "HH:MM"
  end_time: string; // format "HH:MM"
  color_hex: string;
}

export interface AttachmentFile {
  name: string;
  type: string;
  size: number;
  data_url: string; // Base64 representation
}

/**
 * Interface Task merepresentasikan tugas kuliah atau catatan tugas user.
 * Tugas ini opsional dikaitkan dengan mata kuliah tertentu (course_id),
 * memiliki tenggat waktu (deadline), status pengerjaan, dan tingkat prioritas.
 */
export interface Task {
  id: number;
  user_id: number;
  course_id: number | null;
  task_title: string;
  description: string | null;
  deadline: string; // format "YYYY-MM-DD HH:MM:SS"
  is_finished: boolean;
  is_priority: boolean;
  attachments?: AttachmentFile[];
}

/**
 * Interface Note merepresentasikan catatan sederhana yang dibuat oleh user.
 * Catatan ini bisa bersifat umum atau dikaitkan secara khusus dengan mata kuliah (course_id).
 */
export interface Note {
  id: number;
  user_id: number;
  course_id: number | null;
  title: string;
  content: string;
  attachments?: AttachmentFile[];
  created_at?: string;
  updated_at?: string;
}

// --- Auth DTOs (Data Transfer Objects untuk proses autentikasi Laravel) ---

/**
 * Payload yang kita kirimkan ke Laravel saat user ingin login.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Struktur response dari backend setelah user berhasil login,
 * mengembalikan token akses (Bearer token) beserta detail data user.
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Payload yang dikirimkan ke Laravel untuk pendaftaran akun baru.
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  nim?: string;
}

/**
 * Struktur response setelah registrasi berhasil, berisi pesan sukses dan detail user baru.
 */
export interface RegisterResponse {
  message: string;
  user: User;
  token?: string;
}

// --- CRUD DTOs (Payload untuk operasi pembuatan dan pembaruan data) ---

/**
 * Payload untuk membuat mata kuliah baru.
 * Di sini kita mengecualikan (Omit) field 'id' dan 'user_id' karena
 * field tersebut akan diatur secara otomatis di sisi backend.
 */
export type CourseCreatePayload = Omit<Course, 'id' | 'user_id'>;

/**
 * Payload untuk memperbarui data mata kuliah yang sudah ada.
 * Tipe data ini bersifat opsional (Partial) karena kita bisa saja hanya memperbarui beberapa field saja.
 */
export type CourseUpdatePayload = Partial<CourseCreatePayload>;

/**
 * Payload untuk membuat tugas baru (tanpa 'id' dan 'user_id').
 */
export type TaskCreatePayload = Omit<Task, 'id' | 'user_id'>;

/**
 * Payload untuk memperbarui status atau detail tugas.
 */
export type TaskUpdatePayload = Partial<TaskCreatePayload>;

/**
 * Payload untuk membuat catatan baru (tanpa 'id' dan 'user_id').
 */
export type NoteCreatePayload = Omit<Note, 'id' | 'user_id'>;

/**
 * Payload untuk memperbarui catatan yang sudah ada.
 */
export type NoteUpdatePayload = Partial<NoteCreatePayload>;

/**
 * Payload khusus untuk memperbarui profil user di backend.
 * Semua field dibuat opsional agar user bisa mengubah informasi tertentu saja.
 */
export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  nim?: string | null;
  major?: string | null;
  semester?: number | null;
}

// --- Navigasi Aplikasi ---

/**
 * Menentukan tab aktif pada sidebar navigasi utama aplikasi Planly.
 */
export type SidebarTab = 'today' | 'calendar' | 'tasks' | 'courses' | 'notes' | 'profile' | 'workspace' | 'discussion' | 'events' | 'attendance' | 'ai-companion';

// --- Event Kampus ---

/**
 * Tipe kategori event kampus.
 */
export type EventCategory = 'seminar' | 'workshop' | 'study_club' | 'ukm' | 'rapat_himpunan' | 'lomba' | 'webinar' | 'lainnya';

/**
 * Interface CampusEvent merepresentasikan event non-kuliah kampus.
 */
export interface CampusEvent {
  id: number;
  user_id: number;
  event_name: string;
  category: EventCategory;
  description: string | null;
  event_date: string; // format "YYYY-MM-DD"
  start_time: string; // format "HH:MM"
  end_time: string; // format "HH:MM"
  location: string;
  organizer: string;
  color_hex: string;
  is_important: boolean;
}

/**
 * Payload untuk membuat event baru.
 */
export type CampusEventCreatePayload = Omit<CampusEvent, 'id' | 'user_id'>;

/**
 * Interface RescheduledSession merepresentasikan pemindahan atau pembatalan sesi kelas tertentu.
 * Menghindari duplikasi atau modifikasi pada data permanen Course.
 */
export interface RescheduledSession {
  id: number;
  course_id: number;
  original_date: string; // Format "YYYY-MM-DD"
  new_date: string | null; // "YYYY-MM-DD" (null jika dibatalkan sepenuhnya)
  new_start_time: string | null; // "HH:MM"
  new_end_time: string | null; // "HH:MM"
  is_canceled: boolean;
  note: string | null; // Alasan reschedule, e.g. "Dosen ada seminar"
}

// --- Absensi Kuliah ---

/**
 * Interface AttendanceRecord merepresentasikan riwayat absensi mahasiswa.
 */
export interface AttendanceRecord {
  id: number;
  user_id: number;
  course_id: number;
  course_code: string;
  course_name: string;
  date: string; // Format "YYYY-MM-DD"
  time: string; // Format "HH:MM:SS"
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
  latitude: number | null;
  longitude: number | null;
  image_base64: string | null;
  verified_face: boolean;
}

/**
 * Payload untuk mengirimkan data absensi baru.
 */
export interface AttendanceSubmitPayload {
  course_id: number;
  course_code: string;
  course_name: string;
  date: string;
  time: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
  latitude: number | null;
  longitude: number | null;
  image_base64: string | null;
}

export interface CalendarSyncConfig {
  google_connected: boolean;
  outlook_connected: boolean;
  sync_courses: boolean;
  sync_reschedules: boolean;
  sync_tasks: boolean;
  sync_events: boolean;
  last_sync_time: string | null;
}
