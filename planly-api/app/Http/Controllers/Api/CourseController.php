<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * GET /api/courses
     */
    public function index(Request $request): JsonResponse
    {
        $courses = $request->user()->courses;

        return response()->json(CourseResource::collection($courses)->resolve(), 200);
    }

    /**
     * POST /api/courses
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = $request->user()->courses()->create($request->validated());

        return response()->json((new CourseResource($course))->resolve(), 201);
    }

    /**
     * GET /api/courses/{course}
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        if ($course->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json((new CourseResource($course))->resolve(), 200);
    }

    /**
     * PUT /api/courses/{course}
     */
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        if ($course->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course->update($request->validated());

        return response()->json((new CourseResource($course))->resolve(), 200);
    }

    /**
     * DELETE /api/courses/{course}
     */
    public function destroy(Request $request, Course $course): JsonResponse
    {
        if ($course->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully'], 200);
    }
}
