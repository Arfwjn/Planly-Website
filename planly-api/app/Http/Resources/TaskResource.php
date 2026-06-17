<?php

/**
 * =============================================================================
 * Planly — TaskResource.php
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

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'course_id'   => $this->course_id,
            'task_title'  => $this->task_title,
            'description' => $this->description,
            'deadline'    => $this->deadline
                                ? $this->deadline->format('Y-m-d H:i:s')
                                : null,
            'is_finished' => (bool) $this->is_finished,
            'is_priority' => (bool) $this->is_priority,
            'attachments' => $this->attachments,
        ];
    }
}
