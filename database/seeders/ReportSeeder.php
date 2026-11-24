<?php

namespace Database\Seeders;

use App\Models\Report;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        Report::updateOrCreate(
            ['id' => 1],
            [
                'jenis' => 'financial',
                'periode' => now()->subMonth()->format('Y-m'),
                'masuk' => 3400000,
                'keluar' => 1250000,
                'status' => 'Verified',
                'arsip' => false,
            ],
        );

        Report::updateOrCreate(
            ['id' => 2],
            [
                'jenis' => 'mortality',
                'tgl' => now()->subDays(5)->toDateString(),
                'jumlah' => 2,
                'penyebab' => 'Drought',
                'status' => 'Pending validation',
                'arsip' => false,
            ],
        );
    }
}
