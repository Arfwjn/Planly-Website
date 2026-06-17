<?php

/**
 * =============================================================================
 * Planly — AttendanceRecordResource.php
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

class AttendanceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'user_id'       => $this->user_id,
            'course_id'     => $this->course_id,
            'course_code'   => $this->course_code,
            'course_name'   => $this->course_name,
            'date'          => $this->date,
            'time'          => $this->time,
            'status'        => $this->status,
            'latitude'      => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude'     => $this->longitude !== null ? (float) $this->longitude : null,
            'image_base64'  => $this->image_base64,
            'verified_face' => (bool) $this->verified_face,
        ];
    }
}
