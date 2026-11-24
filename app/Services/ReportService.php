<?php

namespace App\Services;

use App\Models\Finance;
use App\Models\Plant;
use App\Models\Report;

class ReportService
{
    public function financialSummary(?string $from = null, ?string $to = null): array
    {
        $query = Finance::validated();
        if ($from) {
            $query->whereDate('tgl', '>=', $from);
        }
        if ($to) {
            $query->whereDate('tgl', '<=', $to);
        }

        $rows = $query->get();

        return [
            'income' => (int) $rows->where('jenis', 'Sale')->sum('nominal'),
            'expenses' => (int) $rows->where('jenis', '!=', 'Sale')->sum('nominal'),
            'count' => $rows->count(),
        ];
    }

    public function mortalitySummary(): array
    {
        return [
            'living' => Plant::living()->count(),
            'total' => Plant::count(),
            'reported' => (int) Report::where('jenis', 'mortality')->sum('jumlah'),
        ];
    }

    public function buildFinancialDraft(string $period): array
    {
        $from = $period.'-01';
        $to = date('Y-m-t', strtotime($from));
        $summary = $this->financialSummary($from, $to);

        return [
            'jenis' => 'financial',
            'periode' => $period,
            'masuk' => $summary['income'],
            'keluar' => $summary['expenses'],
        ];
    }
}
