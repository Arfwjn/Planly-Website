<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'task_title',
        'description',
        'deadline',
        'is_finished',
        'is_priority',
    ];

    protected function casts(): array
    {
        return [
            'deadline'    => 'datetime',
            'is_finished' => 'boolean',
            'is_priority' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
