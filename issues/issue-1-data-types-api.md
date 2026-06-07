# Issue 1: Pembaruan Tipe Data & Integrasi API Service Layer

Issue ini berfokus pada penyusunan tipe data absensi di file types dan pembuatan API service layer untuk mendukung penyimpanan data absensi baik pada mode Mock (localStorage) maupun mode Live (planly-api).

## Deskripsi Tugas

### 1. Pembaruan file `src/types.ts`
*   Tambahkan nilai `'attendance'` pada type `SidebarTab` agar menu navigasi absensi dikenali secara type-safe.
*   Definisikan interface `AttendanceRecord` untuk menyimpan riwayat kehadiran:
    ```typescript
    export interface AttendanceRecord {
      id: number;
      user_id: number;
      course_id: number;
      course_code: string;
      course_name: string;
      date: string;              // Format "YYYY-MM-DD"
      time: string;              // Format "HH:MM:SS"
      status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
      latitude: number | null;
      longitude: number | null;
      image_base64: string | null;
      verified_face: boolean;
    }
    ```
*   Definisikan interface `AttendanceSubmitPayload` untuk data yang akan dikirim saat melakukan absensi:
    ```typescript
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
    ```

### 2. Pembaruan file `src/services/api.ts`
*   Tambahkan sub-service `attendance` di dalam objek `api` utama.
*   Implementasikan fungsi `getAll` untuk mengambil data riwayat absensi:
    *   **Mock Mode**: Mengambil array dari localStorage dengan kunci `planly_attendance_records` (jika kosong, kembalikan array kosong `[]`).
    *   **Live Mode**: Mengirimkan HTTP GET ke `/attendance` menggunakan `httpClient`.
*   Implementasikan fungsi `submit` untuk menyimpan data absensi baru:
    *   **Mock Mode**: Membuat record baru dengan ID unik, menyimpannya ke array di localStorage `planly_attendance_records`, dan mengembalikan record tersebut.
    *   **Live Mode**: Mengirimkan HTTP POST ke `/attendance` dengan payload absensi menggunakan `httpClient`.

## Langkah Verifikasi
1. Pastikan project dapat dikompilasi tanpa ada error tipe data menggunakan perintah `npm run build`.
