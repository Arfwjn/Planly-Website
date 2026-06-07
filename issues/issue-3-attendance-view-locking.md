# Issue 3: Struktur Halaman Absensi & Sistem Pengunci Otomatis (Attendance Locking)

Issue ini berfokus pada pembuatan file komponen `src/components/AttendanceView.tsx` yang mencakup antarmuka tab ("Absen Mandiri" dan "Rekap Kehadiran") serta sistem pemantauan kelas aktif secara real-time untuk membatasi absensi hanya pada jam kuliah yang sedang berlangsung.

## Deskripsi Tugas

### 1. Pembuatan file `src/components/AttendanceView.tsx`
*   Buat struktur komponen React dengan properti (props):
    ```typescript
    import { Course, RescheduledSession, AttendanceRecord, AttendanceSubmitPayload } from '../types';
    
    interface AttendanceViewProps {
      courses: Course[];
      rescheduledSessions: RescheduledSession[];
      attendanceRecords: AttendanceRecord[];
      onSubmitAttendance: (payload: AttendanceSubmitPayload) => Promise<AttendanceRecord>;
    }
    ```
*   Sediakan state untuk berpindah tab: `'checkin'` (Absen Mandiri) dan `'recap'` (Rekap Kehadiran).
*   Sediakan interval real-time (setiap 10-30 detik) untuk mengupdate status jam dan hari saat ini.

### 2. Implementasi Sistem Pengunci Jam Kuliah (Attendance Locking)
*   Format tanggal hari ini menjadi format string `"YYYY-MM-DD"`.
*   Panggil helper `getCoursesForDate` dari `../utils/reschedule` dengan parameter tanggal hari ini, daftar `courses`, dan `rescheduledSessions`. Ini menghasilkan daftar mata kuliah yang dijadwalkan aktif untuk hari ini (termasuk mengakomodasi reschedule jam/pembatalan).
*   Bandingkan waktu sistem saat ini (jam:menit) dengan interval `start_time` dan `end_time` dari mata kuliah hari ini.
*   Tentukan kelas aktif:
    *   **Ada Kelas Aktif**: Jika waktu saat ini berada di dalam salah satu interval jadwal kuliah hari ini.
    *   **Tidak Ada Kelas Aktif**: Di luar jam kuliah manapun hari ini.
*   **UI Status Absensi**:
    *   **Jika ada kelas aktif & belum absen**: Tampilkan kartu detail mata kuliah yang sedang berlangsung (Nama, Kode, Dosen, Jam, Ruangan) dengan tombol aktif berwarna indigo: **"Mulai Presensi Wajah"**.
    *   **Jika ada kelas aktif & sudah absen**: Tampilkan indikator sukses warna hijau: **"Anda telah melakukan presensi untuk kelas ini."**
    *   **Jika tidak ada kelas aktif**: Tampilkan ilustrasi gembok terkunci yang elegan dengan pesan: *"Absensi Terkunci. Tidak ada kelas aktif yang sedang berlangsung saat ini. Absensi hanya dibuka pada jam perkuliahan berjalan."*

## Langkah Verifikasi
1. Pastikan status absensi mendeteksi jadwal kuliah hari ini dengan benar.
2. Cek apakah tombol presensi terkunci jika di luar jam kuliah.
3. Lakukan pengujian dengan menyesuaikan jam kuliah tiruan di tab Kalender (reschedule kelas ke jam saat ini) dan verifikasi bahwa tombol presensi langsung terbuka.
