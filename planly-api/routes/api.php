<?php

/**
 * File ini mendefinisikan seluruh rute (routes) API untuk aplikasi Planly.
 * Di sini kita mengatur rute publik untuk autentikasi serta rute-rute yang dilindungi
 * menggunakan middleware Sanctum.
 */

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rute Publik (Authentication-Free Routes)
|--------------------------------------------------------------------------
|
| Rute-rute ini dapat diakses oleh siapa saja tanpa memerlukan token autentikasi.
| Kita menggunakannya untuk registrasi pengguna baru dan login ke sistem.
|
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Rute Terproteksi (Sanctum Protected Routes)
|--------------------------------------------------------------------------
|
| Rute di bawah ini dilindungi oleh middleware 'auth:sanctum'.
| Hanya pengguna dengan token autentikasi yang valid yang dapat mengaksesnya.
|
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Rute untuk melakukan logout dan membatalkan token yang aktif
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rute untuk melihat dan memperbarui profil pengguna saat ini
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    /*
    |--------------------------------------------------------------------------
    | Modul Courses (Mata Kuliah / Kursus)
    |--------------------------------------------------------------------------
    |
    | Rute CRUD standar untuk courses menggunakan Route::apiResource.
    | Route Model Binding & Scoping:
    | - Laravel secara otomatis mengikat parameter `{course}` pada rute ke instance model Course.
    | - Untuk scoping data (membatasi agar user hanya dapat mengakses course miliknya sendiri),
    |   kita melakukan filter query di dalam CourseController atau Policy terkait menggunakan
    |   relasi dari user yang sedang login.
    |
    */
    Route::apiResource('courses', CourseController::class);

    /*
    |--------------------------------------------------------------------------
    | Modul Tasks (Tugas)
    |--------------------------------------------------------------------------
    |
    | Menyediakan CRUD tasks dan rute khusus untuk menyelesaikan tugas.
    | Route Model Binding & Scoping:
    | - Parameter `{task}` dipetakan langsung ke model Task.
    | - Pengguna dibatasi (scoping) hanya bisa melihat, mengupdate, menghapus, atau
    |   menyelesaikan tugas miliknya sendiri melalui validasi di controller/policy.
    |
    */
    Route::patch('tasks/{task}/finish', [TaskController::class, 'finish']);
    Route::apiResource('tasks', TaskController::class);

    /*
    |--------------------------------------------------------------------------
    | Modul Notes (Catatan)
    |--------------------------------------------------------------------------
    |
    | Rute CRUD untuk catatan pribadi.
    | Route Model Binding & Scoping:
    | - Model Note diikat secara otomatis melalui parameter `{note}` di URL.
    | - Setiap operasi CRUD dibatasi (scoped) hanya pada catatan kepunyaan user
    |   yang telah terautentikasi untuk menjaga privasi data.
    |
    */
    Route::apiResource('notes', NoteController::class);
});
