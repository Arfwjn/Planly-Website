<?php

/**
 * =============================================================================
 * Planly — StoreCourseRequest.php
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

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_code'   => ['required', 'string', 'max:50'],
            'course_name'   => ['required', 'string', 'max:255'],
            'sks'           => ['required', 'integer', 'min:1'],
            'lecturer_name' => ['required', 'string', 'max:255'],
            'room'          => ['required', 'string', 'max:100'],
            'day_of_week'   => ['required', 'string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i', 'after:start_time'],
            'color_hex'     => ['nullable', 'string', 'max:10'],
        ];
    }
}
