<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_code',
        'course_name',
        'sks',
        'lecturer_name',
        'room',
        'day_of_week',
        'start_time',
        'end_time',
        'color_hex',
    ];

    protected function casts(): array
    {
        return [
            'sks' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
