<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_name',
        'category',
        'description',
        'event_date',
        'start_time',
        'end_time',
        'location',
        'organizer',
        'color_hex',
        'is_important',
    ];

    protected function casts(): array
    {
        return [
            'is_important' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
