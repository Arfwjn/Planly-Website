<?php

namespace App\Services;

use App\Models\RescheduledSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class RescheduleService
{
    /**
     * Get all rescheduled sessions for courses belonging to the user.
     */
    public function getReschedulesForUser(User $user): Collection
    {
        return RescheduledSession::whereHas('course', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();
    }

    /**
     * Create or update a rescheduled session.
     */
    public function createOrUpdateReschedule(array $data): RescheduledSession
    {
        $reschedule = RescheduledSession::where('course_id', $data['course_id'])
            ->where('original_date', $data['original_date'])
            ->first();

        if ($reschedule) {
            $reschedule->update($data);
            return $reschedule;
        }

        return RescheduledSession::create($data);
    }

    /**
     * Delete a rescheduled session based on course ID and original date.
     */
    public function deleteReschedule(int $courseId, string $originalDate): bool
    {
        return RescheduledSession::where('course_id', $courseId)
            ->where('original_date', $originalDate)
            ->delete() > 0;
    }
}
