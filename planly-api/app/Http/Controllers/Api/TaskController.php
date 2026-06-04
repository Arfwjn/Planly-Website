<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * GET /api/tasks
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks();

        if ($request->has('course_id')) {
            $courseId = $request->query('course_id');
            // 'null' as string or empty string or null value
            if ($courseId === 'null' || $courseId === '') {
                $query->whereNull('course_id');
            } else {
                $query->where('course_id', $courseId);
            }
        }

        $tasks = $query->get();

        return response()->json([
            'success' => true,
            'data'    => TaskResource::collection($tasks),
        ], 200);
    }

    /**
     * POST /api/tasks
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $request->user()->tasks()->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data'    => new TaskResource($task),
        ], 201);
    }

    /**
     * GET /api/tasks/{task}
     */
    public function show(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => new TaskResource($task),
        ], 200);
    }

    /**
     * PUT /api/tasks/{task}
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data'    => new TaskResource($task),
        ], 200);
    }

    /**
     * PATCH /api/tasks/{task}/finish
     */
    public function finish(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->update(['is_finished' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Task marked as finished',
            'data'    => new TaskResource($task),
        ], 200);
    }

    /**
     * DELETE /api/tasks/{task}
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ], 200);
    }
}
