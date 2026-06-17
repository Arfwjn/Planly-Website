<?php

/**
 * =============================================================================
 * Planly — NoteController.php
 * 
 * Kegunaan:
 * Controller API Laravel yang menangani request HTTP CRUD untuk data modul
 * Catatan Kuliah (Notes). Mengurus tulisan/rangkuman kuliah bermutu mahasiswa.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan model Eloquent `Note`.
 * - Menggunakan `StoreNoteRequest` dan `UpdateNoteRequest` untuk memvalidasi isian form notes.
 * - Menggunakan `NoteResource` untuk memformat data JSON keluaran.
 * - Dilindungi middleware 'auth:sanctum' untuk membatasi akses ilegal.
 * 
 * Aliran Data / State:
 * - Mengambil list catatan, membatasi manipulasi data (IDOR protection),
 *   dan mengembalikan JSON data model beserta status code HTTP yang sesuai.
 * =============================================================================
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * GET /api/notes
     * Mengambil daftar seluruh catatan belajar milik mahasiswa login.
     * 
     * Aliran Data:
     * 1. Menjaring data melalui relasi `$request->user()->notes()`.
     * 2. Mengurutkan berdasarkan waktu pembuatan terbaru (`latest()`).
     * 3. Membungkus collection data ke `NoteResource::collection` lalu mengembalikan respons.
     */
    public function index(Request $request): JsonResponse
    {
        // Scoping: Membaca catatan khusus miliki user aktif secara kronologis terbaru
        $notes = $request->user()->notes()->latest()->get();

        return response()->json(NoteResource::collection($notes)->resolve(), 200);
    }

    /**
     * POST /api/notes
     * Membuat catatan belajar baru di database.
     * 
     * Aliran Data:
     * 1. `StoreNoteRequest` memvalidasi kelayakan parameter input (title, content, attachments).
     * 2. Membuat data baru terikat langsung dengan user aktif via `$request->user()->notes()->create()`.
     * 3. Mengembalikan JSON NoteResource bersandi HTTP 201 (Created).
     */
    public function store(StoreNoteRequest $request): JsonResponse
    {
        $note = $request->user()->notes()->create($request->validated());

        return response()->json((new NoteResource($note))->resolve(), 201);
    }

    /**
     * GET /api/notes/{note}
     * Menampilkan isi satu catatan belajar berdasarkan ID.
     * 
     * Proteksi IDOR:
     * - Membandingkan `note->user_id` dengan ID user login.
     * - Jika tidak cocok, tolak dengan status 403 Forbidden.
     */
    public function show(Request $request, Note $note): JsonResponse
    {
        // Validasi kepemilikan data
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json((new NoteResource($note))->resolve(), 200);
    }

    /**
     * PUT /api/notes/{note}
     * Menyunting/mengubah detail isi catatan belajar yang sudah ada.
     * 
     * Proteksi IDOR:
     * - Mengecek hak akses kepemilikan user aktif terhadap model Note target.
     * - Melakukan update data berdasarkan isian yang divalidasi oleh `UpdateNoteRequest`.
     */
    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        // Validasi kepemilikan data
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $note->update($request->validated());

        return response()->json((new NoteResource($note))->resolve(), 200);
    }

    /**
     * DELETE /api/notes/{note}
     * Menghapus secara permanen baris catatan kuliah dari database.
     * 
     * Proteksi IDOR:
     * - Memastikan user aktif adalah pemilik dari catatan tersebut sebelum dieksekusi.
     */
    public function destroy(Request $request, Note $note): JsonResponse
    {
        // Validasi kepemilikan data
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully'], 200);
    }
}

