<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'course_code',
        'course_name',
        'date',
        'time',
        'status',
        'latitude',
        'longitude',
        'image_base64',
        'verified_face',
    ];

    protected function casts(): array
    {
        return [
            'verified_face' => 'boolean',
            'latitude'      => 'float',
            'longitude'     => 'float',
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
