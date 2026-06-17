<?php

/**
 * =============================================================================
 * Planly — StoreNoteRequest.php
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

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id'   => ['nullable', 'integer', 'exists:courses,id'],
            'title'       => ['required', 'string', 'max:255'],
            'content'     => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
        ];
    }
}
