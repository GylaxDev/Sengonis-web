<?php

namespace Database\Seeders;

use App\Models\BlokPeta;
use App\Models\Keuangan;
use App\Models\LaporanKeuangan;
use App\Models\LaporanKematian;
use App\Models\Pengguna;
use App\Models\Tanaman;
use Illuminate\Database\Seeder;
use App\Services\GeometriPeta;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $owner = Pengguna::firstOrCreate(['username' => 'owner'], [
            'nama_pengguna' => 'Bu Siti', 'role' => 'Owner', 'password' => 'owner123',
            'no_telepon' => '081234567890', 'status_aktif' => true,
        ]);
        $officer = Pengguna::firstOrCreate(['username' => 'officer'], [
            'nama_pengguna' => 'Andi Pratama', 'role' => 'Field Officer', 'password' => 'officer123',
            'no_telepon' => '081298765432', 'status_aktif' => true,
        ]);
        if (Tanaman::query()->exists()) return;

        // Geometri demo mengikuti prototipe HTML (bukan geolokasi pengguna).
        $geometry = app(GeometriPeta::class);
        $polygons = $geometry->blokAwal((float) config('sengonis.center_lat'), (float) config('sengonis.center_lng'));
        foreach ($polygons as $poly) {
            BlokPeta::firstOrCreate(['nomor_blok' => $poly['nomor_blok']], ['koordinat' => $poly['koordinat']]);
        }

        $status = ['Seedling', 'Growing', 'Growing', 'Mature', 'Growing', 'Mature', 'Dead'];
        for ($i = 1; $i <= 36; $i++) {
            $blokNo = 1 + ($i % 4);
            // Grid 3×3 di tiap blok: 36 tanaman memperoleh posisi demo yang konsisten.
            $corners = $polygons[$blokNo - 1]['koordinat'];
            $minimumLng = min(array_column($corners, 0));
            $maximumLng = max(array_column($corners, 0));
            $minimumLat = min(array_column($corners, 1));
            $maximumLat = max(array_column($corners, 1));
            $slot = intdiv($i - 1, 4);
            $longitude = $minimumLng + ($maximumLng - $minimumLng) * (0.16 + 0.34 * ($slot % 3));
            $latitude = $minimumLat + ($maximumLat - $minimumLat) * (0.16 + 0.34 * intdiv($slot, 3));
            Tanaman::create([
                'FK_pengguna' => $officer->id_pengguna,
                'tanggal_tanam' => Carbon::today()->subMonths(1 + ($i % 18))->subDays($i % 20),
                'tinggi_pohon' => round(0.6 + ($i % 14) * 0.48, 2),
                'diameter_pohon' => round(1.1 + ($i % 15) * 0.65, 2),
                'lokasi_blok' => $blokNo,
                'latitude' => round($latitude, 7),
                'longitude' => round($longitude, 7),
                'status_pertumbuhan' => $status[$i % count($status)],
            ]);
        }

        for ($m = 12; $m >= 0; $m--) {
            $month = Carbon::today()->startOfMonth()->subMonthsNoOverflow($m);
            foreach ([
                ['Seedling purchase', 1200000 + $m * 120000],
                ['Operations', 1800000 + ($m % 3) * 500000],
                ['Sale', 4200000 + ($m % 4) * 600000],
            ] as [$type, $nominal]) {
                Keuangan::create([
                    'FK_pengguna' => $officer->id_pengguna,
                    'tanggal_transaksi' => $month->copy()->addDays(2 + ($type === 'Sale' ? 12 : 3)),
                    'jenis_transaksi' => $type,
                    'nominal' => $nominal,
                    'status_pembayaran' => 'Paid',
                    'status_validasi' => $m === 0 ? 'Pending validation' : 'Validated',
                ]);
            }
        }
        // Riwayat kematian diverifikasi selama 12 bulan supaya fitur RF dapat
        // belajar dari target biaya yang mengandung komponen kematian tanaman.
        for ($m = 12; $m >= 1; $m--) {
            LaporanKematian::create([
                'FK_pengguna' => $officer->id_pengguna,
                'FK_tanaman' => 1 + ($m % 36),
                'tanggal_kematian' => Carbon::today()->startOfMonth()->subMonthsNoOverflow($m)->addDays(16),
                'jumlah_mati' => 1 + ($m % 5),
                'penyebab_kematian' => $m % 2 ? 'Hama (boktor)' : 'Kekeringan',
                'status_verifikasi' => 'Verified',
                'status_arsip' => $m > 9,
            ]);
        }

        $transaction = Keuangan::query()->where('status_validasi', 'Validated')->first();
        LaporanKeuangan::create([
            'FK_pengguna' => $officer->id_pengguna,
            'FK_keuangan' => $transaction?->id_keuangan,
            'periode' => Carbon::today()->subMonth()->format('Y-m'),
            'total_pendapatan' => 4200000,
            'total_pengeluaran' => 3000000,
            'status_verifikasi' => 'Draft',
            'status_arsip' => false,
        ]);
        LaporanKematian::create([
            'FK_pengguna' => $officer->id_pengguna, 'FK_tanaman' => 7,
            'tanggal_kematian' => Carbon::today()->subDays(20),
            'jumlah_mati' => 2, 'penyebab_kematian' => 'Hama (boktor)',
            'status_verifikasi' => 'Draft', 'status_arsip' => false,
        ]);
    }
}
