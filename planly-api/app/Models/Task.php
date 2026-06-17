<?php

/**
 * =============================================================================
 * Planly — Task.php
 * 
 * Kegunaan:
 * Model Eloquent Laravel yang mewakili entitas Tugas Kuliah (Task) di database MySQL.
 * Digunakan untuk mengelola tugas perkuliahan, deadlines, priority, status pengerjaan,
 * dan lampiran file pendukung.
 * 
 * Relasi & Dependency:
 * - belongsTo User: Setiap baris tugas terikat ke satu akun Mahasiswa pemilik.
 * - belongsTo Course: Tugas dapat dikaitkan secara opsional dengan satu mata kuliah tertentu (nullable).
 * 
 * Aliran Data / State:
 * - Menyimpan judul, deskripsi tugas, tanggal deadline, status pengerjaan (selesai/belum),
 *   status prioritas penting, dan list berkas lampiran yang diunggah.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * 
     * Penjelasan Kegunaan Properti:
     * - user_id: ID mahasiswa pemilik tugas (foreign key).
     * - course_id: ID mata kuliah terkait tugas ini (foreign key, nullable).
     * - task_title: Judul atau nama tugas (misal: Tugas 1 OOP).
     * - description: Deskripsi instruksi atau catatan tugas.
     * - deadline: Tanggal dan waktu tenggat pengumpulan tugas.
     * - is_finished: Penanda boolean apakah tugas sudah diselesaikan.
     * - is_priority: Penanda boolean apakah tugas ini penting/prioritas tinggi.
     * - attachments: Kolom biner/text JSON yang menyimpan array nama/path file lampiran tugas.
     */
    protected $fillable = [
        'user_id',
        'course_id',
        'task_title',
        'description',
        'deadline',
        'is_finished',
        'is_priority',
        'attachments',
    ];

    /**
     * Konversi tipe data otomatis (Casting) dari database ke objek/tipe PHP.
     * 
     * Penjelasan Casts:
     * - deadline: Mengonversi string datetime database menjadi objek Carbon datetime.
     * - is_finished: Mengonversi tinyint(1) database ke boolean true/false.
     * - is_priority: Mengonversi tinyint(1) database ke boolean true/false.
     * - attachments: Mengonversi teks JSON database ke PHP array secara otomatis saat dibaca,
     *                dan merelasikan array ke JSON string saat menyimpan ke database.
     */
    protected function casts(): array
    {
        return [
            'deadline'    => 'datetime',
            'is_finished' => 'boolean',
            'is_priority' => 'boolean',
            'attachments' => 'array',
        ];
    }

    /**
     * Relasi Many-to-One ke model User (Mahasiswa Pemilik).
     * Memastikan hak kepemilikan dan penapisan data tugas khusus mahasiswa login.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi Many-to-One ke model Course (Mata Kuliah terkait).
     * Menghubungkan tugas ini ke salah satu mata kuliah yang diambil mahasiswa.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}

