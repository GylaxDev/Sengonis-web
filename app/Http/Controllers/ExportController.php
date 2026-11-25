<?php

namespace App\Http\Controllers;

use App\Models\Keuangan;
use App\Models\LaporanKeuangan;
use App\Models\LaporanKematian;
use App\Models\Tanaman;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function download(string $jenis): StreamedResponse
    {
        abort_unless(in_array($jenis, ['tanaman', 'keuangan', 'laporan-keuangan', 'laporan-kematian'], true), 404);
        return response()->streamDownload(function () use ($jenis) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            $rows = match ($jenis) {
                'tanaman' => [
                    ['ID', 'Tanggal tanam', 'Tinggi (m)', 'Diameter (cm)', 'Blok', 'Pertumbuhan'],
                    Tanaman::orderBy('id_tanaman')->get()->map(fn ($t) => [$t->id_tanaman, $t->tanggal_tanam->format('Y-m-d'), $t->tinggi_pohon, $t->diameter_pohon, $t->lokasi_blok, $t->status_pertumbuhan]),
                ],
                'keuangan' => [
                    ['ID', 'Tanggal', 'Jenis', 'Nominal (Rp)', 'Pembayaran', 'Validasi'],
                    Keuangan::orderBy('id_keuangan')->get()->map(fn ($t) => [$t->id_keuangan, $t->tanggal_transaksi->format('Y-m-d'), $t->jenis_transaksi, $t->nominal, $t->status_pembayaran, $t->status_validasi]),
                ],
                'laporan-keuangan' => [
                    ['ID', 'Periode', 'Pendapatan', 'Pengeluaran', 'Verifikasi', 'Arsip'],
                    LaporanKeuangan::orderBy('id_laporan_keuangan')->get()->map(fn ($t) => [$t->id_laporan_keuangan, $t->periode, $t->total_pendapatan, $t->total_pengeluaran, $t->status_verifikasi, $t->status_arsip ? 'Ya' : 'Tidak']),
                ],
                'laporan-kematian' => [
                    ['ID', 'ID tanaman', 'Tanggal', 'Jumlah mati', 'Penyebab', 'Verifikasi', 'Arsip'],
                    LaporanKematian::orderBy('id_laporan_kematian')->get()->map(fn ($t) => [$t->id_laporan_kematian, $t->FK_tanaman, $t->tanggal_kematian->format('Y-m-d'), $t->jumlah_mati, $t->penyebab_kematian, $t->status_verifikasi, $t->status_arsip ? 'Ya' : 'Tidak']),
                ],
            };
            fputcsv($out, $rows[0]);
            foreach ($rows[1] as $row) {
                // Cegah formula spreadsheet dari teks yang diawali = + - @.
                $safe = array_map(function ($value) {
                    $text = (string) $value;
                    return preg_match('/^[=+\-@\t\r]/u', $text) ? "'".$text : $text;
                }, $row);
                fputcsv($out, $safe);
            }
            fclose($out);
        }, 'sengonis-'.$jenis.'-'.now()->format('Ymd').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
