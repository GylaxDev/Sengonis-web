<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'owner'],
            [
                'nama' => 'Owner',
                'password' => 'owner123',
                'role' => 'Owner',
                'aktif' => true,
            ],
        );

        User::updateOrCreate(
            ['username' => 'officer'],
            [
                'nama' => 'Field Officer',
                'password' => 'officer123',
                'role' => 'Officer',
                'aktif' => true,
            ],
        );
    }
}
