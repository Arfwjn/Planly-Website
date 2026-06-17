<?php

/**
 * =============================================================================
 * Planly — Note.php
 * 
 * Kegunaan:
 * Model Eloquent Laravel yang mewakili entitas Catatan Kuliah (Note) di database MySQL.
 * Digunakan untuk menulis dan menyimpan catatan kuliah/belajar berformat Markdown.
 * 
 * Relasi & Dependency:
 * - belongsTo User: Catatan ini dibuat dan dimiliki oleh seorang Mahasiswa.
 * - belongsTo Course: Catatan dapat ditautkan ke mata kuliah tertentu secara opsional.
 * 
 * Aliran Data / State:
 * - Menyimpan judul catatan, isi catatan (content) berformat teks Markdown, dan list attachments JSON.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * 
     * Penjelasan Kegunaan Properti:
     * - user_id: ID mahasiswa pembuat catatan (foreign key).
     * - course_id: ID mata kuliah terkait catatan ini (foreign key, nullable).
     * - title: Judul catatan kuliah (misal: Rangkuman Logika Informatika).
     * - content: Isi tulisan catatan yang didukung rendering Markdown di frontend.
     * - attachments: JSON array untuk menyimpan info berkas/gambar pendukung catatan.
     */
    protected $fillable = [
        'user_id',
        'course_id',
        'title',
        'content',
        'attachments',
    ];

    /**
     * Konversi tipe data otomatis (Casting).
     * Kolom 'attachments' disimpan sebagai teks JSON di MySQL. Cast ini secara otomatis
     * mengubahnya menjadi tipe array PHP saat diakses oleh controller/klien.
     */
    protected function casts(): array
    {
        return [
            'attachments' => 'array',
        ];
    }

    /**
     * Relasi Many-to-One ke model User (Mahasiswa Pembuat).
     * Digunakan untuk memastikan pembatasan akses data (scoping) di NoteController.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi Many-to-One ke model Course (Mata Kuliah terkait).
     * Menghubungkan catatan rangkuman dengan jadwal kelas matakuliah terkait.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}

