<?php

/**
 * =============================================================================
 * Planly — AuthController.php
 * 
 * Kegunaan:
 * Laravel Controller API untuk menangani request HTTP masuk dari frontend React.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan Model Eloquent, FormRequest validator, API Resource formatter, & diatur di api.php.
 * 
 * Aliran Data / State:
 * - Memvalidasi otorisasi user, kueri database scoped (ownership), manipulasi CRUD tabel database, & mengembalikan JSON.
 * =============================================================================
 */
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Controller ini bertanggung jawab untuk menangani proses autentikasi pengguna API,
 * termasuk registrasi akun baru, login, dan logout menggunakan Laravel Sanctum.
 */
class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     * 
     * Fungsi ini berguna untuk mendaftarkan pengguna baru ke dalam sistem.
     * Di sini kita menerima data yang sudah divalidasi oleh RegisterRequest,
     * membuat data pengguna baru dengan password yang di-hash demi keamanan,
     * lalu membuat Sanctum personal access token untuk autentikasi berikutnya.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Membuat baris baru di tabel users dengan data registrasi
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password), // Password di-hash agar aman di database
            'nim'      => $request->nim,
        ]);

        // Menghasilkan Sanctum token baru agar pengguna bisa langsung terautentikasi setelah mendaftar
        $token = $user->createToken('auth_token')->plainTextToken;

        // Mengembalikan respons sukses dengan status kode 201 (Created)
        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => new UserResource($user),
        ], 201);
    }

    /**
     * POST /api/auth/login
     * 
     * Fungsi ini digunakan untuk memverifikasi kredensial pengguna (email dan password).
     * Jika verifikasi gagal, sistem akan mengembalikan status error 401 (Unauthorized).
     * Jika verifikasi berhasil, kita akan membuat Sanctum token baru untuk sesi aktif pengguna.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Mencoba mencocokkan email dan password menggunakan Auth::attempt
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Mengembalikan status kode 401 jika email atau password salah
            return response()->json([
                'message' => 'Invalid login credentials',
            ], 401);
        }

        // Jika berhasil login, cari objek pengguna berdasarkan email
        $user = User::where('email', $request->email)->firstOrFail();
        
        // Membuat Sanctum token baru untuk sesi login saat ini
        $token = $user->createToken('auth_token')->plainTextToken;

        // Mengembalikan respons dengan status kode 200 (OK) beserta token dan data pengguna
        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => new UserResource($user),
        ], 200);
    }

    /**
     * POST /api/logout
     * 
     * Fungsi ini digunakan untuk mengeluarkan pengguna (logout) dari sistem.
     * Di sini kita membersihkan token akses yang sedang digunakan oleh pengguna saat ini
     * dengan menghapusnya dari database agar tidak bisa dipakai kembali.
     */
    public function logout(Request $request): JsonResponse
    {
        // Menghapus/mencabut current access token yang sedang aktif digunakan pengguna
        $request->user()->currentAccessToken()->delete();

        // Mengembalikan respons sukses logout dengan status kode 200 (OK)
        return response()->json([
            'message' => 'Successfully logged out',
        ], 200);
    }
}
