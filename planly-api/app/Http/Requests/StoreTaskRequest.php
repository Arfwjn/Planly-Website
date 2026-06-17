<?php

/**
 * =============================================================================
 * Planly — StoreTaskRequest.php
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

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id'   => ['nullable', 'integer', 'exists:courses,id'],
            'task_title'  => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'deadline'    => ['required', 'date_format:Y-m-d H:i:s'],
            'is_finished' => ['sometimes', 'boolean'],
            'is_priority' => ['sometimes', 'boolean'],
            'attachments' => ['nullable', 'array'],
        ];
    }
}
