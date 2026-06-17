<?php

/**
 * =============================================================================
 * Planly — StoreAttendanceRequest.php
 * 
 * Kegunaan:
 * Laravel Form Request untuk mengurus validasi input form & pengecekan hak akses (authorization).
 * 
 * Relasi & Dependency:
 * - Dipanggil secara otomatis oleh router sebelum parameter diteruskan ke method Controller.
 * 
 * Aliran Data / State:
 * - Menyaring payload HTTP request, mengecek tipe data, batasan karakter, dan kewajiban parameter data masuk.
 * =============================================================================
 */
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id'    => ['required', 'integer', 'exists:courses,id'],
            'course_code'  => ['required', 'string', 'max:50'],
            'course_name'  => ['required', 'string', 'max:255'],
            'date'         => ['required', 'date_format:Y-m-d'],
            'time'         => ['required', 'string', 'max:10'],
            'status'       => ['required', 'string', 'in:Hadir,Sakit,Izin,Alpha'],
            'latitude'     => ['nullable', 'numeric'],
            'longitude'    => ['nullable', 'numeric'],
            'image_base64' => ['nullable', 'string'],
        ];
    }
}
