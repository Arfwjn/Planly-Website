<?php

/**
 * =============================================================================
 * Planly — CampusEventService.php
 * 
 * Kegunaan:
 * Service Layer tingkat backend untuk mengelola modul Kegiatan Kampus (Campus Events).
 * Menangani urusan logis pengurutan, pembuatan, pembaruan, dan penghapusan event non-kuliah.
 * 
 * Relasi & Dependency:
 * - Dipanggil oleh CampusEventController.php.
 * - Berhubungan dengan model User dan CampusEvent.
 * 
 * Aliran Data / State:
 * - Menyalurkan data list event mahasiswa, mengolah payload form event, dan mengeksekusi query database.
 * =============================================================================
 */

namespace App\Services;

use App\Models\CampusEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CampusEventService
{
    /**
     * Mengambil seluruh data event milik user mahasiswa aktif.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Menerima user aktif.
     * 2. Melakukan kueri relasi `campusEvents()` milik user tersebut.
     * 3. Mengurutkan secara ASC (naik) berdasarkan tanggal event dan jam mulai agar event terdekat tampil dahulu.
     * 4. Mengembalikan objek Eloquent Collection.
     */
    public function getEventsForUser(User $user): Collection
    {
        return $user->campusEvents()
            ->orderBy('event_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Membuat kegiatan kampus baru.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Menerima payload input ter-validasi dan user aktif.
     * 2. Memanggil method relasi `create()` yang otomatis menyisipkan foreign key `user_id`.
     * 3. Mengembalikan model CampusEvent yang baru dibuat.
     */
    public function createEvent(User $user, array $data): CampusEvent
    {
        return $user->campusEvents()->create($data);
    }

    /**
     * Memperbarui detail kegiatan kampus yang sudah terdaftar.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Menerima instance model CampusEvent target dan payload array perubahan.
     * 2. Menjalankan `$event->update($data)` untuk menimpa data di MySQL.
     * 3. Mengembalikan model CampusEvent yang ter-update.
     */
    public function updateEvent(CampusEvent $event, array $data): CampusEvent
    {
        $event->update($data);
        return $event;
    }

    /**
     * Menghapus baris kegiatan kampus secara permanen.
     * 
     * Penjelasan Logika & Aliran Data:
     * 1. Menerima model CampusEvent target.
     * 2. Memanggil method `delete()`.
     * 3. Mengembalikan boolean pertanda sukses/gagal penghapusan.
     */
    public function deleteEvent(CampusEvent $event): bool
    {
        return $event->delete();
    }
}

