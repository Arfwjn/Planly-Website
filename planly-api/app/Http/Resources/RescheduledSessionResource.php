<?php

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
