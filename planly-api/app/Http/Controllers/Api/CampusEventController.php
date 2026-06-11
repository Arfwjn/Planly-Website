<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampusEventRequest;
use App\Http\Requests\UpdateCampusEventRequest;
use App\Http\Resources\CampusEventResource;
use App\Models\CampusEvent;
use App\Services\CampusEventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampusEventController extends Controller
{
    protected CampusEventService $eventService;

    public function __construct(CampusEventService $eventService)
    {
        $this->eventService = $eventService;
    }

    /**
     * GET /api/events
     */
    public function index(Request $request): JsonResponse
    {
        $events = $this->eventService->getEventsForUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => CampusEventResource::collection($events),
        ], 200);
    }

    /**
     * POST /api/events
     */
    public function store(StoreCampusEventRequest $request): JsonResponse
    {
        $event = $this->eventService->createEvent($request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data'    => new CampusEventResource($event),
        ], 201);
    }

    /**
     * GET /api/events/{event}
     */
    public function show(Request $request, CampusEvent $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => new CampusEventResource($event),
        ], 200);
    }

    /**
     * PUT /api/events/{event}
     */
    public function update(UpdateCampusEventRequest $request, CampusEvent $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $updatedEvent = $this->eventService->updateEvent($event, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data'    => new CampusEventResource($updatedEvent),
        ], 200);
    }

    /**
     * DELETE /api/events/{event}
     */
    public function destroy(Request $request, CampusEvent $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $this->eventService->deleteEvent($event);

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully',
        ], 200);
    }
}
