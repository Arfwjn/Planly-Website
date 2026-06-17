<?php

/**
 * =============================================================================
 * Planly — RescheduleService.php
 * 
 * Kegunaan:
 * Service Layer tingkat backend yang mengelola logika pemindahan jadwal kuliah (rescheduling)
 * maupun pembatalan kelas kuliah rutin. Memastikan sinkronisasi agenda kalender mahasiswa.
 * 
 * Relasi & Dependency:
 * - Dipanggil oleh RescheduleController.php.
 * - Berelasi dengan model Course (untuk verifikasi kepemilikan jadwal) dan RescheduledSession.
 * 
 * Aliran Data / State:
 * - Mengambil list pemindahan kelas terhubung ke user, menangani penulisan data/upsert
 *   berdasarkan kunci unik ganda (course_id + original_date), dan pembersihan data.
 * =============================================================================
 */

namespace App\Services;

use App\Models\RescheduledSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class RescheduleService
{
    /**
     * Mengambil daftar pemindahan/pembatalan jadwal kuliah milik user aktif.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Menggunakan query builder dengan `whereHas` pada relasi `course` untuk menyaring
     *    baris RescheduledSession yang hanya terhubung ke Course milik user aktif (`user_id = $user->id`).
     * 2. Ini menjamin data jadwal ulang tidak bocor ke mahasiswa lain (Data Isolation).
     * 3. Mengembalikan Eloquent Collection berisi data reschedule yang cocok.
     */
    public function getReschedulesForUser(User $user): Collection
    {
        return RescheduledSession::whereHas('course', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();
    }

    /**
     * Membuat baru atau memperbarui (Upsert) sesi jadwal ulang/pembatalan kuliah.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Mencari apakah sudah ada data reschedule untuk `course_id` dan `original_date` yang sama.
     * 2. Jika sudah ada (`$reschedule` tidak null):
     *    - Menjalankan `$reschedule->update($data)` untuk memperbarui data waktu baru atau status batal.
     *    - Mengembalikan model yang diperbarui.
     * 3. Jika belum ada:
     *    - Memanggil `RescheduledSession::create($data)` untuk menyisipkan data baru.
     *    - Mengembalikan model baru tersebut.
     */
    public function createOrUpdateReschedule(array $data): RescheduledSession
    {
        // Mengecek duplikasi reschedule pada tanggal awal yang sama untuk mata kuliah tersebut
        $reschedule = RescheduledSession::where('course_id', $data['course_id'])
            ->where('original_date', $data['original_date'])
            ->first();

        if ($reschedule) {
            // Perbarui record jika sudah ada
            $reschedule->update($data);
            return $reschedule;
        }

        // Buat record baru jika belum ada sebelumnya
        return RescheduledSession::create($data);
    }

    /**
     * Menghapus sesi reschedule (mengembalikan ke jadwal rutin semula).
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Mencari record RescheduledSession berdasarkan kombinasi unik `course_id` dan `original_date`.
     * 2. Melakukan perintah `delete()`.
     * 3. Mengembalikan boolean true jika berhasil menghapus baris data (> 0).
     */
    public function deleteReschedule(int $courseId, string $originalDate): bool
    {
        return RescheduledSession::where('course_id', $courseId)
            ->where('original_date', $originalDate)
            ->delete() > 0;
    }
}

