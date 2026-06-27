<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        $courses = Course::where('user_id', $userId)->get();

        return response()->json(CourseResource::collection($courses)->resolve(), 200);
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();

        if ($user) {
            $course = $user->courses()->create($request->validated());
        } else {
            $data = $request->validated();
            $data['user_id'] = 1;
            $course = Course::create($data);
        }

        return response()->json((new CourseResource($course))->resolve(), 201);
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($course->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json((new CourseResource($course))->resolve(), 200);
    }

    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($course->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course->update($request->validated());

        return response()->json((new CourseResource($course))->resolve(), 200);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($course->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully'], 200);
    }
}