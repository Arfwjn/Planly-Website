<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * GET /api/notes
     */
    public function index(Request $request): JsonResponse
    {
        $notes = $request->user()->notes()->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => NoteResource::collection($notes),
        ], 200);
    }

    /**
     * POST /api/notes
     */
    public function store(StoreNoteRequest $request): JsonResponse
    {
        $note = $request->user()->notes()->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Note created successfully',
            'data'    => new NoteResource($note),
        ], 201);
    }

    /**
     * GET /api/notes/{note}
     */
    public function show(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => new NoteResource($note),
        ], 200);
    }

    /**
     * PUT /api/notes/{note}
     */
    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $note->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Note updated successfully',
            'data'    => new NoteResource($note),
        ], 200);
    }

    /**
     * DELETE /api/notes/{note}
     */
    public function destroy(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Note deleted successfully',
        ], 200);
    }
}
