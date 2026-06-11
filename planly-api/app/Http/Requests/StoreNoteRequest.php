<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id'   => ['nullable', 'integer', 'exists:courses,id'],
            'title'       => ['required', 'string', 'max:255'],
            'content'     => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
        ];
    }
}
