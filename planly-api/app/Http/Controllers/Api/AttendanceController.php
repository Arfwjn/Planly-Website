<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Resources\AttendanceRecordResource;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    protected AttendanceService $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * GET /api/attendance
     */
    public function index(Request $request): JsonResponse
    {
        $attendance = $this->attendanceService->getAttendanceForUser($request->user());

        return response()->json(AttendanceRecordResource::collection($attendance)->resolve(), 200);
    }

    /**
     * POST /api/attendance
     */
    public function store(StoreAttendanceRequest $request): JsonResponse
    {
        $record = $this->attendanceService->recordAttendance($request->user(), $request->validated());

        return response()->json((new AttendanceRecordResource($record))->resolve(), 201);
    }

    /**
     * DELETE /api/attendance/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->attendanceService->deleteAttendance($request->user(), $id);

        if (!$deleted) {
            return response()->json([
                'message' => 'Attendance record not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Riwayat presensi berhasil dihapus.',
        ], 200);
    }
}
