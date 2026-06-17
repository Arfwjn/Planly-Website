<?php

/**
 * =============================================================================
 * Planly — CampusEventResource.php
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

class CampusEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'event_name'   => $this->event_name,
            'category'     => $this->category,
            'description'  => $this->description,
            'event_date'   => $this->event_date,
            'start_time'   => $this->start_time,
            'end_time'     => $this->end_time,
            'location'     => $this->location,
            'organizer'    => $this->organizer,
            'color_hex'    => $this->color_hex,
            'is_important' => (bool) $this->is_important,
        ];
    }
}
