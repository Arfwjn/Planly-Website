<?php

/**
 * =============================================================================
 * Planly — UpdateCourseRequest.php
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

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_code'   => ['sometimes', 'required', 'string', 'max:50'],
            'course_name'   => ['sometimes', 'required', 'string', 'max:255'],
            'sks'           => ['sometimes', 'required', 'integer', 'min:1'],
            'lecturer_name' => ['sometimes', 'required', 'string', 'max:255'],
            'room'          => ['sometimes', 'required', 'string', 'max:100'],
            'day_of_week'   => ['sometimes', 'required', 'string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'start_time'    => ['sometimes', 'required', 'date_format:H:i'],
            'end_time'      => ['sometimes', 'required', 'date_format:H:i'],
            'color_hex'     => ['nullable', 'string', 'max:10'],
        ];
    }
}
