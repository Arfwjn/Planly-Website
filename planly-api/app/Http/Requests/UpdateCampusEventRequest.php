<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCampusEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_name'   => ['sometimes', 'required', 'string', 'max:255'],
            'category'     => ['sometimes', 'required', 'string', 'max:100'],
            'description'  => ['nullable', 'string'],
            'event_date'   => ['sometimes', 'required', 'date_format:Y-m-d'],
            'start_time'   => ['sometimes', 'required', 'string', 'max:10'],
            'end_time'     => ['sometimes', 'required', 'string', 'max:10'],
            'location'     => ['sometimes', 'required', 'string', 'max:255'],
            'organizer'    => ['sometimes', 'required', 'string', 'max:255'],
            'color_hex'    => ['sometimes', 'string', 'max:7'],
            'is_important' => ['sometimes', 'boolean'],
        ];
    }
}
