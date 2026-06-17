<?php

/**
 * =============================================================================
 * Planly — CampusEventController.php
 * 
 * Kegunaan:
 * Controller API Laravel yang menangani request HTTP CRUD untuk data modul
 * Kegiatan Kampus (Campus Events / Agenda Non-Kuliah).
 * 
 * Relasi & Dependency:
 * - Menggunakan `CampusEventService` untuk delegasi operasi database.
 * - Mengimpor `StoreCampusEventRequest` dan `UpdateCampusEventRequest` untuk validasi parameter input.
 * - Menggunakan `CampusEventResource` untuk memformat data JSON keluaran.
 * - Dilindungi oleh middleware 'auth:sanctum' di dalam routing api.php.
 * 
 * Aliran Data / State:
 * - Menerima payload input dari React, memvalidasinya, menyaring kepemilikan data (scoping user_id),
 *   dan mengembalikan JSON terformat beserta status code HTTP (200 OK, 201 Created, 403 Forbidden).
 * =============================================================================
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampusEventRequest;
use App\Http\Requests\UpdateCampusEventRequest;
use App\Http\Resources\CampusEventResource;
use App\Models\CampusEvent;
use App\Services\CampusEventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampusEventController extends Controller
{
    // Menyimpan instance service layer untuk diakses seluruh method controller
    protected CampusEventService $eventService;

    /**
     * Constructor injection untuk menempelkan CampusEventService secara otomatis.
     */
    public function __construct(CampusEventService $eventService)
    {
        $this->eventService = $eventService;
    }

    /**
     * GET /api/events
     * Mengambil daftar seluruh kegiatan kampus mahasiswa yang sedang login.
     * 
     * Aliran Data:
     * 1. Mengidentifikasi user aktif dari request.
     * 2. Memanggil service untuk menarik list event milik user tersebut.
     * 3. Membungkus hasil dengan CampusEventResource::collection untuk menyamakan struktur JSON.
     */
    public function index(Request $request): JsonResponse
    {
        // Menarik data event dari database terfilter user_id
        $events = $this->eventService->getEventsForUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => CampusEventResource::collection($events),
        ], 200);
    }

    /**
     * POST /api/events
     * Mendaftarkan agenda kegiatan kampus baru.
     * 
     * Aliran Data:
     * 1. StoreCampusEventRequest memverifikasi kelayakan parameter input (required fields, format data).
     * 2. Memanggil service `createEvent` dengan user login dan payload yang lolos validasi.
     * 3. Mengembalikan respons JSON bersandi HTTP 201 (Created).
     */
    public function store(StoreCampusEventRequest $request): JsonResponse
    {
        // Perekaman data baru ke database via service
        $event = $this->eventService->createEvent($request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data'    => new CampusEventResource($event),
        ], 201);
    }

    /**
     * GET /api/events/{event}
     * Melihat detail dari satu kegiatan kampus tertentu berdasarkan ID.
     * 
     * Proteksi IDOR:
     * - Mengecek apakah properti `user_id` pada event tersebut sama dengan ID user login.
     * - Jika berbeda, mengembalikan status 403 Forbidden agar user tidak bisa mengintip event orang lain.
     */
    public function show(Request $request, CampusEvent $event): JsonResponse
    {
        // Validasi kepemilikan data
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => new CampusEventResource($event),
        ], 200);
    }

    /**
     * PUT /api/events/{event}
     * Menyunting/mengubah informasi dari suatu kegiatan kampus.
     * 
     * Proteksi IDOR:
     * - Memvalidasi hak kepemilikan user terhadap event tersebut sebelum pembaruan.
     */
    public function update(UpdateCampusEventRequest $request, CampusEvent $event): JsonResponse
    {
        // Validasi kepemilikan data
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Pengeksekusian edit data via service
        $updatedEvent = $this->eventService->updateEvent($event, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data'    => new CampusEventResource($updatedEvent),
        ], 200);
    }

    /**
     * DELETE /api/events/{event}
     * Menghapus secara permanen satu kegiatan kampus dari database.
     * 
     * Proteksi IDOR:
     * - Memvalidasi kepemilikan data sebelum mengizinkan proses penghapusan.
     */
    public function destroy(Request $request, CampusEvent $event): JsonResponse
    {
        // Validasi kepemilikan data
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Penghapusan data via service
        $this->eventService->deleteEvent($event);

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully',
        ], 200);
    }
}

