<?php

namespace Database\Seeders;

use App\Models\Plant;
use Illuminate\Database\Seeder;

class PlantSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([[1, 2.4, 3.1, 'Seedling'], [1, 3.8, 4.6, 'Growing'], [2, 5.2, 6.0, 'Mature']] as $i => [$block, $height, $diameter, $status]) {
            Plant::updateOrCreate(
                ['id' => $i + 1],
                [
                    'tgl' => now()->subDays(30 - $i * 7)->toDateString(),
                    'tinggi' => $height,
                    'dia' => $diameter,
                    'blok' => $block,
                    'st' => $status,
                ],
            );
        }
    }
}
