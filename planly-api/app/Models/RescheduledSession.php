<?php

/**
 * =============================================================================
 * Planly — RescheduledSession.php
 * 
 * Kegunaan:
 * Model Eloquent Laravel yang mewakili entitas Jadwal Ulang Kuliah (Reschedule / Cancellation) di database MySQL.
 * Digunakan untuk mencatat apabila ada pemindahan hari/jam kuliah atau pembatalan kelas kuliah oleh dosen.
 * 
 * Relasi & Dependency:
 * - belongsTo Course: Menghubungkan sesi perubahan jadwal ini ke mata kuliah yang bersangkutan.
 * 
 * Aliran Data / State:
 * - Menyimpan ID mata kuliah, tanggal awal kelas yang batal/dipindah, tanggal baru,
 *   waktu mulai/selesai yang baru, bendera apakah kelas tersebut batal total (canceled),
 *   dan catatan/alasan perubahan dari dosen.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescheduledSession extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * 
     * Penjelasan Kegunaan Properti:
     * - course_id: ID mata kuliah yang mengalami perubahan jadwal (foreign key).
     * - original_date: Tanggal awal sesi kuliah rutin yang dipindah/dibatalkan.
     * - new_date: Tanggal baru pengganti sesi kuliah tersebut (nullable jika kelas dibatalkan).
     * - new_start_time: Jam mulai baru untuk sesi pengganti (format H:i, nullable).
     * - new_end_time: Jam selesai baru untuk sesi pengganti (format H:i, nullable).
     * - is_canceled: Boolean penanda jika sesi kuliah tersebut batal total (tidak ada kelas pengganti).
     * - note: Catatan tambahan/alasan pemindahan jadwal (misal: Dosen ada seminar luar kota).
     */
    protected $fillable = [
        'course_id',
        'original_date',
        'new_date',
        'new_start_time',
        'new_end_time',
        'is_canceled',
        'note',
    ];

    /**
     * Casting tipe data database ke PHP.
     * Memastikan tinyint is_canceled dikembalikan sebagai tipe data boolean PHP.
     */
    protected function casts(): array
    {
        return [
            'is_canceled' => 'boolean',
        ];
    }

    /**
     * Relasi Many-to-One ke model Course (Mata Kuliah).
     * Memperoleh detail data kelas (dosen, warna, nama kelas) yang mengalami reschedule.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}

