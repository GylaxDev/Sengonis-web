<?php

namespace App\Services;

use App\Models\Keuangan;
use App\Models\LaporanKematian;
use Carbon\CarbonImmutable;

/** Prediksi biaya kerugian bulanan menggunakan Random Forest regression. */
class PrediksiService
{
    public function __construct(private readonly RandomForestRegressor $forest) {}

    public function hitung(): ?array
    {
        $awalBulanIni = CarbonImmutable::today()->startOfMonth();
        $transactions = Keuangan::query()
            ->where('status_validasi', 'Validated')
            ->whereDate('tanggal_transaksi', '<', $awalBulanIni->toDateString())
            ->orderBy('tanggal_transaksi')->get();

        // Minimal tujuh bulan BERBEDA berisi transaksi tervalidasi.
        $validMonths = $transactions->map(fn ($t) => $t->tanggal_transaksi->format('Y-m'))->unique()->values();
        if ($validMonths->count() < 7) return null;

        // 36 bulan terbaru untuk mengurangi beban CPU; bulan tanpa data dicatat 0, bukan dilewati.
        $earliest = CarbonImmutable::parse($validMonths->first().'-01');
        $start = $earliest->greaterThan($awalBulanIni->subMonths(36)) ? $earliest : $awalBulanIni->subMonths(36);
        $months = [];
        for ($cursor = $start; $cursor->lessThan($awalBulanIni); $cursor = $cursor->addMonth()) {
            $key = $cursor->format('Y-m');
            $months[$key] = ['bulan' => $key, 'masuk' => 0.0, 'keluar' => 0.0, 'mati' => 0];
        }
        if (count($months) < 7 || $validMonths->filter(fn ($key) => isset($months[$key]))->count() < 7) return null;

        foreach ($transactions as $t) {
            $key = $t->tanggal_transaksi->format('Y-m');
            if (!isset($months[$key])) continue;
            $type = $t->jenis_transaksi === 'Sale' ? 'masuk' : 'keluar';
            $months[$key][$type] += (float) $t->nominal;
        }
        $deaths = LaporanKematian::query()
            ->where('status_verifikasi', 'Verified')
            ->whereDate('tanggal_kematian', '>=', $start->toDateString())
            ->whereDate('tanggal_kematian', '<', $awalBulanIni->toDateString())->get();
        foreach ($deaths as $death) {
            $key = $death->tanggal_kematian->format('Y-m');
            if (isset($months[$key])) $months[$key]['mati'] += (int) $death->jumlah_mati;
        }

        $history = array_values($months);
        $x = []; $y = [];
        $loss = fn (array $m) => max(0, $m['keluar'] - $m['masuk']) + $m['mati'] * (int) config('sengonis.biaya_pohon_mati');
        for ($i = 0; $i < count($history) - 1; $i++) {
            $x[] = $this->fitur($history, $i);
            $y[] = $loss($history[$i + 1]);
        }
        $last = count($history) - 1;
        $predicted = $this->forest->predict($x, $y, $this->fitur($history, $last));
        $lastMonth = $history[$last];
        return [
            'perkiraan_rupiah' => (int) round($predicted),
            'target_bulan' => $awalBulanIni->format('Y-m'),
            'data_sampai' => $lastMonth['bulan'],
            'jumlah_bulan' => count($history),
            'jumlah_pelatihan' => count($y),
            'rerata_arus_kas' => (int) round(array_sum(array_map(fn ($m) => $m['masuk'] - $m['keluar'], $history)) / count($history)),
            'rerata_kematian' => round(array_sum(array_column($history, 'mati')) / count($history), 1),
            'kerugian_terakhir' => (int) round($loss($lastMonth)),
            'biaya_pohon_mati' => (int) config('sengonis.biaya_pohon_mati'),
            'metode' => 'Random Forest Regression (50 pohon, bootstrap, 2/4 fitur acak)',
        ];
    }

    private function fitur(array $months, int $index): array
    {
        $m = $months[$index];
        return [(float) $m['mati'], $m['keluar'] / 1000000, $m['masuk'] / 1000000, (float) ($months[$index - 1]['mati'] ?? 0)];
    }
}
