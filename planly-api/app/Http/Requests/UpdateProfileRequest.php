<?php

/**
 * =============================================================================
 * Planly — UpdateProfileRequest.php
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
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'               => ['sometimes', 'required', 'string', 'max:255'],
            'email'              => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($this->user()->id)],
            'nim'                => ['nullable', 'string', 'max:50'],
            'major'              => ['nullable', 'string', 'max:100'],
            'semester'           => ['nullable', 'integer', 'min:1', 'max:14'],
            'profile_photo_url'  => ['nullable', 'string'],
            'gpa_current'        => ['nullable', 'numeric', 'min:0', 'max:4'],
            'gpa_target'         => ['nullable', 'numeric', 'min:0', 'max:4'],
            'target_study_hours' => ['nullable', 'integer', 'min:0'],
            'address'            => ['nullable', 'string', 'max:500'],
        ];
    }
}
