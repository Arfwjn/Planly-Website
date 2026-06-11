<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRescheduleRequest;
use App\Http\Resources\RescheduledSessionResource;
use App\Services\RescheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RescheduleController extends Controller
{
    protected RescheduleService $rescheduleService;

    public function __construct(RescheduleService $rescheduleService)
    {
        $this->rescheduleService = $rescheduleService;
    }

    /**
     * GET /api/reschedules
     */
    public function index(Request $request): JsonResponse
    {
        $reschedules = $this->rescheduleService->getReschedulesForUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => RescheduledSessionResource::collection($reschedules),
        ], 200);
    }

    /**
     * POST /api/reschedules
     */
    public function store(StoreRescheduleRequest $request): JsonResponse
    {
        $reschedule = $this->rescheduleService->createOrUpdateReschedule($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Rescheduled session saved successfully',
            'data'    => new RescheduledSessionResource($reschedule),
        ], 201);
    }

    /**
     * DELETE /api/reschedules/{courseId}/{originalDate}
     */
    public function destroy(Request $request, int $courseId, string $originalDate): JsonResponse
    {
        $course = $request->user()->courses()->find($courseId);
        if (!$course) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $deleted = $this->rescheduleService->deleteReschedule($courseId, $originalDate);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Rescheduled session not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal kuliah berhasil dikembalikan ke normal',
        ], 200);
    }
}
