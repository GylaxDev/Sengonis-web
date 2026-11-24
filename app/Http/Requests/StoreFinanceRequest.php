<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tgl' => ['required', 'date'],
            'jenis' => ['required', 'string', 'max:50'],
            'nominal' => ['required', 'integer', 'min:0'],
            'bayar' => ['required', 'string', 'max:20'],
        ];
    }
}
