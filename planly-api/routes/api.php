<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Public Authentication Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Authenticated Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // User Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Courses CRUD
    Route::apiResource('courses', CourseController::class);

    // Tasks CRUD & Custom finish route
    Route::patch('tasks/{task}/finish', [TaskController::class, 'finish']);
    Route::apiResource('tasks', TaskController::class);

    // Notes CRUD
    Route::apiResource('notes', NoteController::class);
});
