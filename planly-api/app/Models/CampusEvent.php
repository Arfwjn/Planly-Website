<?php

/**
 * =============================================================================
 * Planly — CampusEvent.php
 * 
 * Kegunaan:
 * Model Eloquent Laravel yang mewakili entitas Kegiatan Non-Kuliah (Campus Event) di database MySQL.
 * Digunakan untuk mengelola event seperti seminar, workshop, rapat himpunan, lomba, dan UKM.
 * 
 * Relasi & Dependency:
 * - belongsTo User: Setiap event dibuat dan dimiliki oleh seorang Mahasiswa.
 * 
 * Aliran Data / State:
 * - Menyimpan nama kegiatan, kategori event, deskripsi, tanggal, jam mulai/selesai,
 *   lokasi kegiatan, penyelenggara (organizer), warna penanda, dan prioritas penting.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusEvent extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * 
     * Penjelasan Kegunaan Properti:
     * - user_id: ID mahasiswa pembuat event (foreign key).
     * - event_name: Nama kegiatan/acara (misal: Workshop UI/UX).
     * - category: Kategori acara (seminar, workshop, study_club, ukm, rapat_himpunan, lomba, webinar, lainnya).
     * - description: Deskripsi detail atau materi acara.
     * - event_date: Tanggal pelaksanaan acara.
     * - start_time: Waktu mulai acara (format H:i, misal: 09:00).
     * - end_time: Waktu berakhirnya acara (format H:i, misal: 12:00).
     * - location: Tempat/lokasi acara (misal: Aula Kampus 3 / Zoom Link).
     * - organizer: Pihak penyelenggara atau pembuat acara (misal: Himpunan Mahasiswa).
     * - color_hex: Kode warna untuk penandaan kartu/visualisasi di UI.
     * - is_important: Boolean penanda apakah event tersebut penting/ditandai bintang.
     */
    protected $fillable = [
        'user_id',
        'event_name',
        'category',
        'description',
        'event_date',
        'start_time',
        'end_time',
        'location',
        'organizer',
        'color_hex',
        'is_important',
    ];

    /**
     * Casting tipe data database ke PHP.
     * Memastikan nilai tinyint is_important otomatis dikembalikan sebagai boolean true/false.
     */
    protected function casts(): array
    {
        return [
            'is_important' => 'boolean',
        ];
    }

    /**
     * Relasi Many-to-One ke model User (Mahasiswa Pemilik).
     * Membatasi agar CRUD event hanya bisa dilakukan oleh mahasiswa yang bersangkutan.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

