<?php

/**
 * =============================================================================
 * Planly — AttendanceController.php
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
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Resources\AttendanceRecordResource;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class AttendanceController
 * 
 * Pengendali utama (Controller) untuk mengelola data presensi kehadiran mahasiswa.
 * Fungsi:
 * - index: Mengambil daftar kehadiran user aktif.
 * - store: Menyimpan presensi check-in baru (disertai koordinat GPS dan foto Base64).
 * - destroy: Menghapus catatan riwayat presensi.
 * 
 * Relasi:
 * - Menghubungkan request dari frontend (via attendanceService di React) ke core business logic di AttendanceService.php Laravel.
 */
class AttendanceController extends Controller
{
    // Memakai instance AttendanceService untuk memisahkan kueri database dari controller (Service Layer Pattern)
    protected AttendanceService $attendanceService;

    /**
     * Constructor injection untuk menempelkan AttendanceService ke controller secara otomatis.
     */
    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * GET /api/attendance
     * Mengambil seluruh data riwayat absensi mahasiswa yang sedang login.
     * Aliran data:
     * 1. Klien frontend mengirim Bearer Token.
     * 2. Laravel mengidentifikasi objek User via `$request->user()`.
     * 3. Controller meminta service mengambil data absensi khusus user tersebut.
     */
    public function index(Request $request): JsonResponse
    {
        $attendance = $this->attendanceService->getAttendanceForUser($request->user());

        // Menyelesaikan resource collection agar mengembalikan struktur array JSON terformat seragam
        return response()->json(AttendanceRecordResource::collection($attendance)->resolve(), 200);
    }

    /**
     * POST /api/attendance
     * Mencatat sesi kehadiran baru (check-in kelas aktif).
     * Aliran data:
     * 1. Validasi input lokasi GPS & webcam snapshot via StoreAttendanceRequest.
     * 2. Menjalankan logika penyimpanan di database via `AttendanceService->recordAttendance()`.
     */
    public function store(StoreAttendanceRequest $request): JsonResponse
    {
        $record = $this->attendanceService->recordAttendance($request->user(), $request->validated());

        return response()->json((new AttendanceRecordResource($record))->resolve(), 201);
    }

    /**
     * DELETE /api/attendance/{id}
     * Menghapus salah satu baris riwayat absensi berdasarkan ID presensi.
     * Keamanan: Logika di service memastikan record hanya bisa dihapus oleh pemiliknya sendiri.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->attendanceService->deleteAttendance($request->user(), $id);

        if (!$deleted) {
            return response()->json([
                'message' => 'Catatan presensi tidak ditemukan atau Anda tidak memiliki akses.',
            ], 404);
        }

        return response()->json([
            'message' => 'Riwayat presensi berhasil dihapus.',
        ], 200);
    }
}
