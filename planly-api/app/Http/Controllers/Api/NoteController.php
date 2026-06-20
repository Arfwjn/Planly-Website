<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class NoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        $notes = Note::where('user_id', $userId)->latest()->get();

        return response()->json(NoteResource::collection($notes)->resolve(), 200);
    }

    public function store(StoreNoteRequest $request): JsonResponse
    {
        $user = $request->user() ?? Auth::user();

        if ($user) {
            $note = $user->notes()->create($request->validated());
        } else {
            $data = $request->validated();
            $data['user_id'] = 1;
            $note = Note::create($data);
        }

        return response()->json((new NoteResource($note))->resolve(), 201);
    }

    public function show(Request $request, Note $note): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($note->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json((new NoteResource($note))->resolve(), 200);
    }

    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($note->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $note->update($request->validated());

        return response()->json((new NoteResource($note))->resolve(), 200);
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        $user = $request->user() ?? Auth::user();
        $userId = $user ? $user->id : 1;

        if ($note->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully'], 200);
    }
}