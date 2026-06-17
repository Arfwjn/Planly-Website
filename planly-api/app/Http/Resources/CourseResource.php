<?php

/**
 * =============================================================================
 * Planly — CourseResource.php
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

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'user_id'       => $this->user_id,
            'course_code'   => $this->course_code,
            'course_name'   => $this->course_name,
            'sks'           => (int) $this->sks,
            'lecturer_name' => $this->lecturer_name,
            'room'          => $this->room,
            'day_of_week'   => $this->day_of_week,
            'start_time'    => $this->start_time,
            'end_time'      => $this->end_time,
            'color_hex'     => $this->color_hex,
        ];
    }
}
