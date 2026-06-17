<?php

/**
 * =============================================================================
 * Planly — StoreCampusEventRequest.php
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

class StoreCampusEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_name'   => ['required', 'string', 'max:255'],
            'category'     => ['required', 'string', 'max:100'],
            'description'  => ['nullable', 'string'],
            'event_date'   => ['required', 'date_format:Y-m-d'],
            'start_time'   => ['required', 'string', 'max:10'],
            'end_time'     => ['required', 'string', 'max:10'],
            'location'     => ['required', 'string', 'max:255'],
            'organizer'    => ['required', 'string', 'max:255'],
            'color_hex'    => ['sometimes', 'string', 'max:7'],
            'is_important' => ['sometimes', 'boolean'],
        ];
    }
}
