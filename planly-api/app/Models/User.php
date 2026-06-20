<?php

/**
 * =============================================================================
 * Planly — User.php
 * 
 * Kegunaan:
 * Model Eloquent Laravel yang mewakili entitas pengguna (Mahasiswa) di dalam sistem.
 * Kelas ini mewarisi Authenticatable untuk mendukung proses login dan manajemen
 * sesi pengguna, serta terintegrasi dengan Laravel Sanctum untuk otentikasi API.
 * 
 * Relasi & Dependency:
 * - Menjadi pusat/parent dari hampir seluruh transaksi data mahasiswa (Course, Task, Note, dll.).
 * - Menggunakan trait HasApiTokens untuk menghasilkan token Sanctum (Personal Access Token).
 * - Menggunakan trait HasFactory untuk memfasilitasi pembuatan dummy data (seeding/testing).
 * - Menggunakan trait Notifiable untuk mengirim notifikasi surat elektronik atau saluran lainnya.
 * 
 * Aliran Data / State:
 * - Menyimpan informasi kredensial login, data akademik (NIM, Jurusan, Semester), 
 *   target IPK, jam belajar, dan konfigurasi profil mahasiswa.
 * =============================================================================
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    // Mengaktifkan fitur token Sanctum, model factory, dan notifikasi Laravel
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * Kolom-kolom ini dipetakan langsung ke tabel 'users' di database MySQL.
     * 
     * Penjelasan Kegunaan Properti:
     * - name: Nama lengkap mahasiswa.
     * - email: Alamat email unik untuk login.
     * - password: Kata sandi yang telah di-hash.
     * - nim: Nomor Induk Mahasiswa unik.
     * - major: Program studi / jurusan mahasiswa.
     * - semester: Semester aktif saat ini.
     * - profile_photo_url: Alamat path foto profil di storage.
     * - gpa_current: IPK (Indeks Prestasi Kumulatif) mahasiswa saat ini.
     * - gpa_target: Target IPK yang ingin dicapai mahasiswa.
     * - target_study_hours: Durasi jam belajar mandiri yang ditargetkan per minggu.
     * - address: Alamat domisili mahasiswa.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nim',
        'major',
        'semester',
        'profile_photo_url',
        'gpa_current',
        'gpa_target',
        'target_study_hours',
        'address',
    ];

    /**
     * Atribut yang harus disembunyikan saat objek dikonversi ke array/JSON.
     * Sangat penting untuk menjaga keamanan agar data kredensial tidak bocor
     * ke respon API publik / klien frontend.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Melakukan casting tipe data database ke tipe data PHP yang sesuai.
     * Berguna agar saat kita mengakses properti model, nilainya sudah otomatis
     * bertipe data yang benar (misalnya float, integer, atau datetime) bukan string.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', // Konversi tanggal verifikasi email ke objek Carbon datetime
            'password' => 'hashed',   // Otomatis melakukan hashing password menggunakan bcrypt saat disimpan
            'semester' => 'integer',  // Memastikan semester dibaca sebagai integer
            'gpa_current' => 'float',    // Memastikan IPK saat ini dibaca sebagai float decimal
            'gpa_target' => 'float',    // Memastikan target IPK dibaca sebagai float decimal
            'target_study_hours' => 'integer',  // Memastikan target belajar dibaca sebagai integer
        ];
    }

    /**
     * Relasi One-to-Many ke model Course (Mata Kuliah).
     * Seorang mahasiswa dapat memiliki banyak jadwal mata kuliah terdaftar.
     * Relasi ini terhubung lewat foreign key `user_id` di tabel `courses`.
     */
    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Relasi One-to-Many ke model Task (Tugas Kuliah).
     * Seorang mahasiswa dapat memiliki banyak daftar tugas akademik.
     * Relasi ini terhubung lewat foreign key `user_id` di tabel `tasks`.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Relasi One-to-Many ke model Note (Catatan Kuliah).
     * Seorang mahasiswa dapat membuat banyak catatan belajar/rangkuman kuliah.
     * Relasi ini terhubung lewat foreign key `user_id` di tabel `notes`.
     */
    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    /**
     * Relasi One-to-Many ke model CampusEvent (Event Kampus).
     * Seorang mahasiswa dapat memiliki banyak agenda kegiatan non-kuliah/organisasi.
     * Relasi ini terhubung lewat foreign key `user_id` di tabel `campus_events`.
     */
    public function campusEvents()
    {
        return $this->hasMany(CampusEvent::class);
    }

    /**
     * Relasi One-to-Many ke model AttendanceRecord (Presensi Absensi).
     * Seorang mahasiswa memiliki banyak riwayat absensi perkuliahan.
     * Relasi ini terhubung lewat foreign key `user_id` di tabel `attendance_records`.
     */
    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}

