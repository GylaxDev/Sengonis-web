<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tgl' => ['required', 'date'],
            'tinggi' => ['required', 'numeric', 'min:0'],
            'dia' => ['required', 'numeric', 'min:0'],
            'blok' => ['required', 'integer', 'min:1'],
            'st' => ['required', 'string', 'max:50'],
            'lng' => ['nullable', 'numeric'],
            'lat' => ['nullable', 'numeric'],
        ];
    }
}
