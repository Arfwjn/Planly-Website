<?php

/**
 * =============================================================================
 * Planly — AttendanceRecord.php
 * 
 * Kegunaan:
 * Model Eloquent Laravel yang mewakili entitas Rekaman Absensi/Presensi (Attendance Record) di database MySQL.
 * Digunakan untuk mencatat bukti kehadiran mahasiswa pada suatu sesi kuliah aktif.
 * 
 * Relasi & Dependency:
 * - belongsTo User: Absensi dilakukan oleh seorang Mahasiswa.
 * - belongsTo Course: Absensi dikaitkan ke suatu mata kuliah tertentu.
 * 
 * Aliran Data / State:
 * - Menyimpan ID mahasiswa, ID mata kuliah, data redundan (kode & nama kelas untuk optimalisasi query),
 *   tanggal, waktu check-in, status kehadiran (Hadir, Izin, Sakit, Alpa), koordinat GPS (lat, lng),
 *   foto swafoto Base64, dan status verifikasi wajah.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * 
     * Penjelasan Kegunaan Properti:
     * - user_id: ID mahasiswa pembuat absensi (foreign key).
     * - course_id: ID mata kuliah yang dihadiri (foreign key).
     * - course_code: Kode mata kuliah (denormalisasi untuk rekap cepat).
     * - course_name: Nama mata kuliah (denormalisasi untuk rekap cepat).
     * - date: Tanggal absensi (format Y-m-d).
     * - time: Waktu check-in (format H:i:s).
     * - status: Status kehadiran (Hadir, Izin, Sakit, Alpa, Terlalu Jauh).
     * - latitude: Titik lintang GPS lokasi check-in mahasiswa.
     * - longitude: Titik bujur GPS lokasi check-in mahasiswa.
     * - image_base64: Teks biner/Base64 foto swafoto webcam wajah mahasiswa.
     * - verified_face: Boolean penanda hasil verifikasi pemindai wajah (face recognition).
     */
    protected $fillable = [
        'user_id',
        'course_id',
        'course_code',
        'course_name',
        'date',
        'time',
        'status',
        'latitude',
        'longitude',
        'image_base64',
        'verified_face',
    ];

    /**
     * Casting tipe data database ke PHP.
     * 
     * Penjelasan Casts:
     * - verified_face: Casting integer tinyint dari database ke boolean true/false.
     * - latitude: Casting string koordinat database ke float PHP untuk presisi perhitungan jarak.
     * - longitude: Casting string koordinat database ke float PHP untuk presisi perhitungan jarak.
     */
    protected function casts(): array
    {
        return [
            'verified_face' => 'boolean',
            'latitude'      => 'float',
            'longitude'     => 'float',
        ];
    }

    /**
     * Relasi Many-to-One ke model User (Mahasiswa Pemilik).
     * Menghubungkan kembali rekaman presensi ke akun mahasiswa yang bersangkutan.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi Many-to-One ke model Course (Mata Kuliah).
     * Menghubungkan presensi ini ke mata kuliah terkait guna melacak statistik rekap kehadiran per kelas.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}

