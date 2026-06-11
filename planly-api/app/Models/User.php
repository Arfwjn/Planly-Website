<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'nim',
        'major',
        'semester',
        'profile_photo_url',
        'gpa_current',
        'gpa_target',
        'target_study_hours',
        'address',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'semester'           => 'integer',
            'gpa_current'        => 'float',
            'gpa_target'         => 'float',
            'target_study_hours' => 'integer',
        ];
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function campusEvents()
    {
        return $this->hasMany(CampusEvent::class);
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
