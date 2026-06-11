<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'user_id'   => $this->user_id,
            'course_id' => $this->course_id,
            'title'       => $this->title,
            'content'     => $this->content,
            'attachments' => $this->attachments,
        ];
    }
}
