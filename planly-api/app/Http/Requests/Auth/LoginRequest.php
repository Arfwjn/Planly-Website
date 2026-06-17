<?php

/**
 * =============================================================================
 * Planly — LoginRequest.php
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
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
