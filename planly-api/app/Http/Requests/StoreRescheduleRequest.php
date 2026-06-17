<?php

/**
 * =============================================================================
 * Planly — StoreRescheduleRequest.php
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

class StoreRescheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id'      => ['required', 'integer', 'exists:courses,id'],
            'original_date'  => ['required', 'date_format:Y-m-d'],
            'new_date'       => ['nullable', 'date_format:Y-m-d'],
            'new_start_time' => ['nullable', 'string', 'max:10'],
            'new_end_time'   => ['nullable', 'string', 'max:10'],
            'is_canceled'    => ['required', 'boolean'],
            'note'           => ['nullable', 'string'],
        ];
    }
}
