<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescheduledSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'original_date',
        'new_date',
        'new_start_time',
        'new_end_time',
        'is_canceled',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'is_canceled' => 'boolean',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
