<?php

namespace App\Services;

use App\Models\CampusEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CampusEventService
{
    /**
     * Get all events for the authenticated user.
     */
    public function getEventsForUser(User $user): Collection
    {
        return $user->campusEvents()
            ->orderBy('event_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Create a new campus event.
     */
    public function createEvent(User $user, array $data): CampusEvent
    {
        return $user->campusEvents()->create($data);
    }

    /**
     * Update an existing campus event.
     */
    public function updateEvent(CampusEvent $event, array $data): CampusEvent
    {
        $event->update($data);
        return $event;
    }

    /**
     * Delete a campus event.
     */
    public function deleteEvent(CampusEvent $event): bool
    {
        return $event->delete();
    }
}
