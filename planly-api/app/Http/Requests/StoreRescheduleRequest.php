<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRescheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id'      => ['required', 'integer', 'exists:courses,id'],
            'original_date'  => ['required', 'date_format:Y-m-d'],
            'new_date'       => ['nullable', 'date_format:Y-m-d'],
            'new_start_time' => ['nullable', 'string', 'max:10'],
            'new_end_time'   => ['nullable', 'string', 'max:10'],
            'is_canceled'    => ['required', 'boolean'],
            'note'           => ['nullable', 'string'],
        ];
    }
}
