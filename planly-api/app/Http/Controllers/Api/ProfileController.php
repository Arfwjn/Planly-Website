<?php

/**
 * =============================================================================
 * Planly — ProfileController.php
 * 
 * Kegunaan:
 * Controller API Laravel yang menangani request melihat dan memperbarui
 * profil mahasiswa (IPK, target jam belajar, biodata, dll.).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan model Eloquent `User` (pengguna aktif).
 * - Menggunakan `UpdateProfileRequest` untuk memvalidasi isian form profil.
 * - Menggunakan `UserResource` untuk standarisasi format keluaran JSON ke frontend.
 * - Dilindungi oleh middleware 'auth:sanctum'.
 * 
 * Aliran Data / State:
 * - Membaca data mahasiswa terautentikasi dan melakukan update langsung ke record tabel `users`.
 * =============================================================================
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * GET /api/profile
     * Mengambil informasi lengkap profil mahasiswa yang sedang masuk log.
     * 
     * Aliran Data:
     * 1. Laravel mendeteksi user aktif dari token Sanctum.
     * 2. Controller membungkus user aktif ke `UserResource` dan mengembalikannya ke React.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json((new UserResource($request->user()))->resolve(), 200);
    }

    /**
     * PUT/POST /api/profile
     * Memperbarui detail profil mahasiswa (termasuk GPA, Jurusan, Target Jam Belajar).
     * 
     * Aliran Data:
     * 1. `UpdateProfileRequest` memvalidasi input (semester harus integer, GPA harus numerik desimal).
     * 2. Menjalankan `$user->update()` pada model user terautentikasi.
     * 3. Mengembalikan JSON profil terformat baru dengan status 200 OK.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        
        // Melakukan update mass-assignment dengan data tervalidasi
        $user->update($request->validated());

        return response()->json((new UserResource($user))->resolve(), 200);
    }
}

