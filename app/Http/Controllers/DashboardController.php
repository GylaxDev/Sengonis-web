<?php

namespace App\Http\Controllers;

use App\Models\Keuangan;
use App\Models\LaporanKeuangan;
use App\Models\LaporanKematian;
use App\Models\Prediksi;
use App\Models\Tanaman;
use App\Services\PrediksiService;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(PrediksiService $prediksiService)
    {
        $periode = in_array((int) request('periode', 6), [3, 6, 12], true) ? (int) request('periode', 6) : 6;
        $tanaman = Tanaman::all();
        $keuangan = Keuangan::where('status_validasi', 'Validated')->get();
        $kematian = LaporanKematian::where('status_verifikasi', 'Verified')->get();
        $bulanan = collect(range($periode - 1, 0))->map(function ($offset) use ($keuangan, $kematian) {
            $month = Carbon::today()->subMonths($offset)->format('Y-m');
            $items = $keuangan->filter(fn ($t) => $t->tanggal_transaksi->format('Y-m') === $month);
            return [
                'bulan' => $month,
                'label' => Carbon::parse($month.'-01')->translatedFormat('M y'),
                'pendapatan' => $items->where('jenis_transaksi', 'Sale')->sum('nominal'),
                'pengeluaran' => $items->where('jenis_transaksi', '!=', 'Sale')->sum('nominal'),
                'mati' => $kematian->filter(fn ($d) => $d->tanggal_kematian->format('Y-m') === $month)->sum('jumlah_mati'),
            ];
        });

        return view('dashboard.index', [
            'periode' => $periode,
            'jumlahHidup' => $tanaman->where('status_pertumbuhan', '!=', 'Dead')->count(),
            'jumlahTanaman' => $tanaman->count(),
            'arusKas' => $bulanan->sum(fn ($b) => $b['pendapatan'] - $b['pengeluaran']),
            'jumlahMati' => $bulanan->sum('mati'),
            'dataBulan' => $bulanan,
            'tahap' => $tanaman->countBy('status_pertumbuhan'),
            'blok' => $tanaman->groupBy('lokasi_blok')->sortKeys(),
            'pendingKeuangan' => Keuangan::where('status_validasi', 'Pending validation')->count(),
            'pendingLaporan' => LaporanKeuangan::where('status_verifikasi', 'Draft')->where('status_arsip', false)->count(),
            'pendingKematian' => LaporanKematian::where('status_verifikasi', 'Draft')->where('status_arsip', false)->count(),
            'prediksi' => Prediksi::orderByDesc('tanggal_prediksi')->orderByDesc('id_prediksi')->first(),
            'prediksiSaatIni' => $prediksiService->hitung(),
        ]);
    }
}
