<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        $query = Task::where('user_id', $userId);

        if ($request->has('course_id')) {
            $courseId = $request->query('course_id');
            if ($courseId === 'null' || $courseId === '') {
                $query->whereNull('course_id');
            } else {
                $query->where('course_id', $courseId);
            }
        }

        $tasks = $query->get();

        return response()->json(TaskResource::collection($tasks)->resolve(), 200);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();

        if ($user) {
            $task = $user->tasks()->create($request->validated());
        } else {
            $data = $request->validated();
            $data['user_id'] = 1;
            $task = Task::create($data);
        }

        return response()->json((new TaskResource($task))->resolve(), 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($task->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json((new TaskResource($task))->resolve(), 200);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($task->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->update($request->validated());

        return response()->json((new TaskResource($task))->resolve(), 200);
    }

    public function finish(Request $request, Task $task): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($task->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->update(['is_finished' => !$task->is_finished]);

        return response()->json((new TaskResource($task))->resolve(), 200);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($task->task_title && $task->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully'], 200);
    }
}