<?php

/**
 * =============================================================================
 * Planly — Course.php
 * 
 * Kegunaan:
 * Model Eloquent Laravel yang mewakili entitas Mata Kuliah (Course) di database MySQL.
 * Digunakan untuk menyimpan jadwal kuliah tetap mahasiswa per semester.
 * 
 * Relasi & Dependency:
 * - belongsTo User: Setiap mata kuliah terdaftar milik satu mahasiswa tertentu.
 * - hasMany Task: Satu mata kuliah dapat memiliki banyak tugas terkait.
 * - hasMany Note: Satu mata kuliah dapat memiliki banyak catatan materi kuliah terkait.
 * 
 * Aliran Data / State:
 * - Menampung kode mata kuliah, nama kelas, jumlah SKS, nama dosen, ruang kelas,
 *   hari kuliah, serta jam mulai dan jam selesai kuliah.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    /**
     * Properti yang dapat diisi secara massal (Mass Assignment).
     * 
     * Penjelasan Kegunaan Properti:
     * - user_id: ID mahasiswa pemilik jadwal mata kuliah ini (foreign key).
     * - course_code: Kode unik mata kuliah (misal: INF101).
     * - course_name: Nama mata kuliah (misal: Algoritma dan Pemrograman).
     * - sks: Jumlah Satuan Kredit Semester (bobot beban kuliah).
     * - lecturer_name: Nama dosen pengampu mata kuliah.
     * - room: Ruang kelas tempat kuliah berlangsung.
     * - day_of_week: Hari perkuliahan dalam seminggu (misal: Senin, Selasa).
     * - start_time: Waktu mulai perkuliahan (format jam H:i, misal: 07:30).
     * - end_time: Waktu selesai perkuliahan (format jam H:i, misal: 10:00).
     * - color_hex: Kode warna representatif mata kuliah untuk pewarnaan di kalender/UI.
     */
    protected $fillable = [
        'user_id',
        'course_code',
        'course_name',
        'sks',
        'lecturer_name',
        'room',
        'day_of_week',
        'start_time',
        'end_time',
        'color_hex',
    ];

    /**
     * Casting tipe data database ke tipe data PHP.
     * Memastikan nilai sks dikembalikan sebagai integer.
     */
    protected function casts(): array
    {
        return [
            'sks' => 'integer',
        ];
    }

    /**
     * Relasi Many-to-One ke model User (Mahasiswa Pemilik).
     * Menghubungkan mata kuliah kembali ke data mahasiswa pengambil kelas.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi One-to-Many ke model Task (Daftar Tugas terkait).
     * Jika mata kuliah ini memiliki tugas, relasi ini mempermudah kueri tugas
     * berdasarkan mata kuliah tertentu.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Relasi One-to-Many ke model Note (Catatan Belajar terkait).
     * Menghubungkan catatan rangkuman kuliah dengan mata kuliah yang bersangkutan.
     */
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}

