<?php

/**
 * =============================================================================
 * Planly — RescheduledSessionResource.php
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

class RescheduledSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'course_id'      => $this->course_id,
            'original_date'  => $this->original_date,
            'new_date'       => $this->new_date,
            'new_start_time' => $this->new_start_time,
            'new_end_time'   => $this->new_end_time,
            'is_canceled'    => (bool) $this->is_canceled,
            'note'           => $this->note,
        ];
    }
}
