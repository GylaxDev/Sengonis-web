<?php

namespace Database\Seeders;

use App\Models\MapBlock;
use Illuminate\Database\Seeder;

class MapBlockSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([1, 2, 3] as $number) {
            MapBlock::updateOrCreate(
                ['nomor' => $number],
                ['ring' => [
                    [-95.35, 5.60],
                    [-95.33, 5.60],
                    [-95.33, 5.58],
                    [-95.35, 5.58],
                    [-95.35, 5.60],
                ]],
            );
        }
    }
}
