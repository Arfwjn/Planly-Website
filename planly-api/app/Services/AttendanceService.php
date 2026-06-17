<?php

/**
 * =============================================================================
 * Planly — AttendanceService.php
 * 
 * Kegunaan:
 * Service Layer tingkat backend yang menangani seluruh logika bisnis utama untuk
 * modul absensi/kehadiran mahasiswa. Pemisahan ini mempermudah perawatan kode,
 * reuse logic di tempat lain, serta unit testing.
 * 
 * Relasi & Dependency:
 * - Dipanggil oleh AttendanceController.php untuk mendelegasikan transaksi data.
 * - Berinteraksi langsung dengan model Eloquent User dan AttendanceRecord.
 * 
 * Aliran Data / State:
 * - Menangani kueri pengambilan daftar presensi, validasi kepemilikan data saat
 *   menghapus, dan pengisian data verifikasi presensi baru.
 * =============================================================================
 */

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AttendanceService
{
    /**
     * Mengambil daftar seluruh riwayat presensi kehadiran milik mahasiswa tertentu.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Menerima instance model User yang sedang aktif.
     * 2. Melakukan kueri relasi `attendanceRecords()` untuk menjamin isolasi data.
     * 3. Mengurutkan hasil secara kronologis terbaru (berdasarkan tanggal DESC dan waktu DESC).
     * 4. Mengembalikan objek Eloquent Collection yang berisi daftar absensi.
     */
    public function getAttendanceForUser(User $user): Collection
    {
        return $user->attendanceRecords()
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();
    }

    /**
     * Mencatat data kehadiran baru (check-in) ke database.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Menerima instance model User dan payload data absensi tervalidasi dari controller.
     * 2. Menyisipkan properti `user_id` agar terhubung ke mahasiswa pemilik secara otomatis.
     * 3. Menyisipkan status `verified_face` bernilai true sebagai simulasi sukses verifikasi wajah di backend.
     * 4. Memanggil `AttendanceRecord::create($data)` untuk menyimpan baris data di tabel `attendance_records`.
     * 5. Mengembalikan model AttendanceRecord yang baru dibuat.
     */
    public function recordAttendance(User $user, array $data): AttendanceRecord
    {
        // Hubungkan data input ke ID user yang login
        $data['user_id'] = $user->id;
        
        // Menandai sukses verifikasi wajah secara default
        $data['verified_face'] = true; 
        
        // Simpan baris baru ke tabel database
        return AttendanceRecord::create($data);
    }

    /**
     * Menghapus catatan riwayat presensi tertentu dari database.
     * 
     * Penjelasan Logika & Aliran Data (Pencegahan IDOR):
     * 1. Menerima user aktif dan ID record presensi yang ingin dihapus.
     * 2. Kueri penghapusan diikat dalam relasi `$user->attendanceRecords()`, sehingga
     *    meskipun ada user jahil mengirimkan ID absensi orang lain, kueri WHERE ini
     *    tidak akan menemukan record tersebut dan database aman dari kebocoran/manipulasi.
     * 3. Mengembalikan nilai boolean true jika ada baris data yang berhasil dihapus (> 0),
     *    dan false jika data tidak ditemukan atau bukan milik user login.
     */
    public function deleteAttendance(User $user, int $id): bool
    {
        return $user->attendanceRecords()
            ->where('id', $id)
            ->delete() > 0;
    }
}

