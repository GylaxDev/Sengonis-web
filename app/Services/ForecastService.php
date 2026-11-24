<?php

namespace App\Services;

use App\Models\Finance;
use Illuminate\Support\Collection;

class ForecastService
{
    /**
     * Group validated transactions per month and project the next month using
     * a simple three-month moving average.
     */
    public function monthly(int $months = 6): array
    {
        $history = Finance::validated()
            ->get()
            ->groupBy(fn (Finance $row) => $row->tgl->format('Y-m'))
            ->map(fn (Collection $rows) => [
                'income' => (int) $rows->where('jenis', 'Sale')->sum('nominal'),
                'expenses' => (int) $rows->where('jenis', '!=', 'Sale')->sum('nominal'),
            ]);

        $months = array_slice($history->all(), -$months, null, true);
        $recent = array_slice(array_values($months), -3);
        $average = fn (string $key) => $recent
            ? (int) round(collect($recent)->avg($key))
            : 0;

        return [
            'history' => $months,
            'forecast' => [
                'income' => $average('income'),
                'expenses' => $average('expenses'),
            ],
        ];
    }
}
