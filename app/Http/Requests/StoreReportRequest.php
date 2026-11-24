<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jenis' => ['required', 'in:financial,mortality'],
            'periode' => ['required_if:jenis,financial', 'nullable', 'date_format:Y-m'],
            'tgl' => ['required_if:jenis,mortality', 'nullable', 'date'],
            'masuk' => ['nullable', 'integer', 'min:0'],
            'keluar' => ['nullable', 'integer', 'min:0'],
            'jumlah' => ['nullable', 'integer', 'min:1'],
            'penyebab' => ['nullable', 'string', 'max:100'],
        ];
    }
}
