<?php

/**
 * =============================================================================
 * Planly — CourseController.php
 * 
 * Kegunaan:
 * Controller API Laravel yang menangani request HTTP CRUD untuk data modul
 * Mata Kuliah (Courses). Mengurus manipulasi data jadwal kelas rutin mahasiswa.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan model Eloquent `Course`.
 * - Menggunakan `StoreCourseRequest` dan `UpdateCourseRequest` untuk validasi form input.
 * - Menggunakan `CourseResource` untuk standarisasi format keluaran JSON ke frontend.
 * - Dilindungi oleh middleware 'auth:sanctum' di routes/api.php.
 * 
 * Aliran Data / State:
 * - Membaca list matakuliah terdaftar, membatasi manipulasi data (IDOR protection),
 *   dan mengembalikan JSON data model beserta status code HTTP yang sesuai.
 * =============================================================================
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * GET /api/courses
     * Mengambil seluruh jadwal kuliah terdaftar milik mahasiswa yang login.
     * 
     * Aliran Data:
     * 1. Menjaring data melalui relasi `$request->user()->courses` untuk memastikan
     *    hanya mengambil jadwal mata kuliah kepunyaan user aktif.
     * 2. Membungkus collection data ke `CourseResource::collection` lalu mengembalikan respons.
     */
    public function index(Request $request): JsonResponse
    {
        $courses = $request->user()->courses;

        return response()->json(CourseResource::collection($courses)->resolve(), 200);
    }

    /**
     * POST /api/courses
     * Mendaftarkan jadwal mata kuliah baru ke database.
     * 
     * Aliran Data:
     * 1. `StoreCourseRequest` memvalidasi kelayakan parameter input (sks, nama dosen, jam).
     * 2. Membuat data baru terikat langsung dengan user aktif via `$request->user()->courses()->create()`.
     * 3. Mengembalikan JSON CourseResource bersandi HTTP 201 (Created).
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = $request->user()->courses()->create($request->validated());

        return response()->json((new CourseResource($course))->resolve(), 201);
    }

    /**
     * GET /api/courses/{course}
     * Menampilkan detail informasi satu mata kuliah tertentu.
     * 
     * Proteksi IDOR:
     * - Membandingkan `course->user_id` dengan ID user aktif.
     * - Jika tidak cocok, tolak dengan status 403 Forbidden.
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        // Validasi kepemilikan data
        if ($course->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json((new CourseResource($course))->resolve(), 200);
    }

    /**
     * PUT /api/courses/{course}
     * Menyunting detail informasi mata kuliah yang sudah terdaftar.
     * 
     * Proteksi IDOR:
     * - Mengecek hak akses kepemilikan user aktif terhadap model Course target.
     * - Melakukan update data berdasarkan isian yang divalidasi oleh `UpdateCourseRequest`.
     */
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        // Validasi kepemilikan data
        if ($course->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course->update($request->validated());

        return response()->json((new CourseResource($course))->resolve(), 200);
    }

    /**
     * DELETE /api/courses/{course}
     * Menghapus mata kuliah terdaftar secara permanen.
     * 
     * Proteksi IDOR:
     * - Memastikan user aktif adalah pemilik dari mata kuliah tersebut sebelum dieksekusi.
     * - MySQL cascade constraint akan otomatis memutuskan atau menghapus tugas/catatan terikat.
     */
    public function destroy(Request $request, Course $course): JsonResponse
    {
        // Validasi kepemilikan data
        if ($course->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully'], 200);
    }
}

