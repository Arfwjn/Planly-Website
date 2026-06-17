<?php

/**
 * =============================================================================
 * Planly — TaskController.php
 * 
 * Kegunaan:
 * Controller API Laravel yang menangani request HTTP CRUD untuk data modul
 * Tugas Akademik (Tasks).
 * 
 * Relasi & Dependency:
 * - Berelasi dengan model Eloquent `Task`.
 * - Menggunakan `StoreTaskRequest` dan `UpdateTaskRequest` untuk memvalidasi payload tugas.
 * - Menggunakan `TaskResource` untuk memformat data JSON keluaran.
 * - Dilindungi oleh middleware 'auth:sanctum'.
 * 
 * Aliran Data / State:
 * - Mengambil list tugas terfilter course_id (jika dikirim), membuat tugas baru terikat user,
 *   merubah status pengerjaan tugas secara parsial (finish), dan menghapus tugas ter-scope user.
 * =============================================================================
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * GET /api/tasks
     * Mengambil daftar tugas akademik milik mahasiswa login.
     * 
     * Aliran Data & Penapisan:
     * 1. Menjaring data melalui relasi `$request->user()->tasks()`.
     * 2. Jika ada query parameter `course_id`:
     *    - Jika nilainya string 'null' atau kosong, filter tugas yang TIDAK memiliki mata kuliah (`whereNull('course_id')`).
     *    - Jika ada nilainya, filter tugas khusus untuk mata kuliah tersebut (`where('course_id', $courseId)`).
     * 3. Membungkus collection model database ke `TaskResource::collection` lalu mengembalikan respons.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks();

        // Menyaring data tugas berdasarkan filter mata kuliah yang dipilih di UI
        if ($request->has('course_id')) {
            $courseId = $request->query('course_id');
            if ($courseId === 'null' || $courseId === '') {
                $query->whereNull('course_id');
            } else {
                $query->where('course_id', $courseId);
            }
        }

        $tasks = $query->get();

        return response()->json(TaskResource::collection($tasks)->resolve(), 200);
    }

    /**
     * POST /api/tasks
     * Mendaftarkan tugas akademik baru.
     * 
     * Aliran Data:
     * 1. `StoreTaskRequest` memvalidasi input payload (judul, deskripsi, deadline, prioritas).
     * 2. Membuat baris data baru terhubung ke user aktif via `$request->user()->tasks()->create()`.
     * 3. Mengembalikan JSON TaskResource bersandi HTTP 201 (Created).
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $request->user()->tasks()->create($request->validated());

        return response()->json((new TaskResource($task))->resolve(), 201);
    }

    /**
     * GET /api/tasks/{task}
     * Menampilkan detail informasi satu tugas kuliah tertentu.
     * 
     * Proteksi IDOR:
     * - Membandingkan `task->user_id` dengan ID user aktif.
     * - Jika tidak cocok, tolak dengan status 403 Forbidden.
     */
    public function show(Request $request, Task $task): JsonResponse
    {
        // Validasi kepemilikan data
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json((new TaskResource($task))->resolve(), 200);
    }

    /**
     * PUT /api/tasks/{task}
     * Menyunting/mengubah detail informasi tugas kuliah.
     * 
     * Proteksi IDOR:
     * - Memastikan hak akses kepemilikan user aktif terhadap model Task target.
     * - Melakukan update data berdasarkan isian yang divalidasi oleh `UpdateTaskRequest`.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        // Validasi kepemilikan data
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->update($request->validated());

        return response()->json((new TaskResource($task))->resolve(), 200);
    }

    /**
     * PATCH /api/tasks/{task}/finish
     * Menyelesaikan tugas kuliah secara cepat tanpa membuka editor penuh.
     * 
     * Aliran Data & Proteksi IDOR:
     * 1. Memvalidasi kepemilikan tugas kuliah.
     * 2. Memperbarui atribut `is_finished` menjadi true.
     * 3. Mengembalikan JSON model terformat ter-update.
     */
    public function finish(Request $request, Task $task): JsonResponse
    {
        // Validasi kepemilikan data
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Tandai/alihkan status penyelesaian tugas
        $task->update(['is_finished' => !$task->is_finished]);

        return response()->json((new TaskResource($task))->resolve(), 200);
    }

    /**
     * DELETE /api/tasks/{task}
     * Menghapus tugas akademik secara permanen.
     * 
     * Proteksi IDOR:
     * - Memastikan user aktif adalah pemilik dari tugas tersebut sebelum dieksekusi.
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        // Validasi kepemilikan data
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully'], 200);
    }
}

