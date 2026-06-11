<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AttendanceService
{
    /**
     * Get all attendance records for the user.
     */
    public function getAttendanceForUser(User $user): Collection
    {
        return $user->attendanceRecords()
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();
    }

    /**
     * Record new attendance.
     */
    public function recordAttendance(User $user, array $data): AttendanceRecord
    {
        $data['user_id'] = $user->id;
        $data['verified_face'] = true; // Default verification success
        
        return AttendanceRecord::create($data);
    }

    /**
     * Delete an attendance record.
     */
    public function deleteAttendance(User $user, int $id): bool
    {
        return $user->attendanceRecords()
            ->where('id', $id)
            ->delete() > 0;
    }
}
