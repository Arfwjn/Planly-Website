<?php

/**
 * =============================================================================
 * Planly — UserResource.php
 * 
 * Kegunaan:
 * Laravel API Resource untuk menstandardisasi bentuk respon data keluar (JSON output) ke klien frontend.
 * 
 * Relasi & Dependency:
 * - Digunakan di Controller untuk membungkus instance Model atau Collection database.
 * 
 * Aliran Data / State:
 * - Memformat properti model database, mengubah format waktu/tanggal, dan melampirkan data relasi.
 * =============================================================================
 */
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'email'              => $this->email,
            'nim'                => $this->nim,
            'major'              => $this->major,
            'semester'           => $this->semester,
            'profile_photo_url'  => $this->profile_photo_url,
            'gpa_current'        => $this->gpa_current !== null ? (float) $this->gpa_current : null,
            'gpa_target'         => $this->gpa_target !== null ? (float) $this->gpa_target : null,
            'target_study_hours' => $this->target_study_hours !== null ? (int) $this->target_study_hours : null,
            'address'            => $this->address,
        ];
    }
}
