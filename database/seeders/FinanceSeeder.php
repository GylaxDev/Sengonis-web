<?php

namespace Database\Seeders;

use App\Models\Finance;
use Illuminate\Database\Seeder;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['Operations', 1250000, 'Paid', 'Validated'],
            ['Sale', 3400000, 'Paid', 'Validated'],
            ['Seedling', 480000, 'Unpaid', 'Pending validation'],
        ];

        foreach ($rows as $i => [$type, $amount, $payment, $status]) {
            Finance::updateOrCreate(
                ['id' => $i + 1],
                [
                    'tgl' => now()->subDays(10 - $i * 3)->toDateString(),
                    'jenis' => $type,
                    'nominal' => $amount,
                    'bayar' => $payment,
                    'status' => $status,
                ],
            );
        }
    }
}
