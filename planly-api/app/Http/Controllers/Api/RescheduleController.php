<?php

/**
 * =============================================================================
 * Planly — RescheduleController.php
 * 
 * Kegunaan:
 * Controller API Laravel untuk menangani request pemindahan jadwal (reschedule)
 * perkuliahan rutin atau pembatalan kelas.
 * 
 * Relasi & Dependency:
 * - Menggunakan `RescheduleService` untuk memisahkan kueri database.
 * - Menggunakan `StoreRescheduleRequest` untuk validasi parameter tanggal/jam baru.
 * - Menggunakan `RescheduledSessionResource` untuk formatur JSON API.
 * - Dilindungi oleh middleware 'auth:sanctum'.
 * 
 * Aliran Data / State:
 * - Menampilkan daftar reschedule user, melakukan penambahan/pembaruan (upsert),
 *   dan menghapus data reschedule yang mengembalikan jadwal ke waktu normal.
 * =============================================================================
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRescheduleRequest;
use App\Http\Resources\RescheduledSessionResource;
use App\Services\RescheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RescheduleController extends Controller
{
    // Instance service layer reschedule
    protected RescheduleService $rescheduleService;

    /**
     * Constructor injection untuk menghubungkan service layer reschedule.
     */
    public function __construct(RescheduleService $rescheduleService)
    {
        $this->rescheduleService = $rescheduleService;
    }

    /**
     * GET /api/reschedules
     * Mengambil daftar pemindahan jadwal kuliah untuk mahasiswa aktif.
     * 
     * Aliran Data:
     * 1. Meminta service layer menarik data reschedule yang disaring hanya untuk matakuliah milik user aktif.
     * 2. Membungkus collection model database ke `RescheduledSessionResource` dan mengembalikannya ke frontend.
     */
    public function index(Request $request): JsonResponse
    {
        $reschedules = $this->rescheduleService->getReschedulesForUser($request->user());

        return response()->json(RescheduledSessionResource::collection($reschedules)->resolve(), 200);
    }

    /**
     * POST /api/reschedules
     * Membuat atau memperbarui data reschedule kelas kuliah.
     * 
     * Aliran Data:
     * 1. Validator `StoreRescheduleRequest` memastikan data input valid.
     * 2. Memanggil service untuk menyimpan/update.
     * 3. Mengembalikan model reschedule terformat baru dengan kode HTTP 201.
     */
    public function store(StoreRescheduleRequest $request): JsonResponse
    {
        $reschedule = $this->rescheduleService->createOrUpdateReschedule($request->validated());

        return response()->json((new RescheduledSessionResource($reschedule))->resolve(), 201);
    }

    /**
     * DELETE /api/reschedules/{courseId}/{originalDate}
     * Menghapus sesi reschedule sehingga mengembalikan kelas ke jadwal rutin semula.
     * 
     * Keamanan (IDOR protection):
     * 1. Memeriksa apakah `courseId` yang dikirim benar-benar milik user aktif via `$request->user()->courses()->find($courseId)`.
     * 2. Jika tidak ditemukan (bukan milik user), return error 403 Forbidden.
     * 3. Jika valid, panggil service untuk menghapus data reschedule.
     */
    public function destroy(Request $request, int $courseId, string $originalDate): JsonResponse
    {
        // Cek kepemilikan mata kuliah terkait
        $course = $request->user()->courses()->find($courseId);
        if (!$course) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Panggil service untuk eksekusi penghapusan
        $deleted = $this->rescheduleService->deleteReschedule($courseId, $originalDate);

        if (!$deleted) {
            return response()->json([
                'message' => 'Rescheduled session not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Jadwal kuliah berhasil dikembalikan ke normal',
        ], 200);
    }
}

