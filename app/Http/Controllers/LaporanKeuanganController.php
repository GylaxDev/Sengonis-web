<?php

namespace App\Http\Controllers;

use App\Models\Keuangan;
use App\Models\LaporanKeuangan;
use Illuminate\Http\Request;

class LaporanKeuanganController extends Controller
{
    public function index(Request $request)
    {
        return view('laporan-keuangan.index', [
            'items' => LaporanKeuangan::with('pengguna', 'keuangan')
                ->when(! $request->boolean('arsip'), fn ($q) => $q->where('status_arsip', false))
                ->orderByDesc('periode')->orderByDesc('id_laporan_keuangan')->paginate(10)->withQueryString(),
        ]);
    }

    public function create()
    {
        return view('laporan-keuangan.form', ['item' => new LaporanKeuangan, 'transaksi' => Keuangan::where('status_validasi', 'Validated')->orderByDesc('tanggal_transaksi')->get()]);
    }
    public function edit(LaporanKeuangan $laporan_keuangan)
    {
        abort_unless(! $laporan_keuangan->status_arsip && $laporan_keuangan->status_verifikasi === 'Draft', 403);
        abort_unless(auth()->user()->isOwner() || auth()->id() === $laporan_keuangan->FK_pengguna, 403);
        return view('laporan-keuangan.form', ['item' => $laporan_keuangan, 'transaksi' => Keuangan::where('status_validasi', 'Validated')->orderByDesc('tanggal_transaksi')->get()]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        LaporanKeuangan::create([...$data, 'FK_pengguna' => $request->user()->id_pengguna, 'status_verifikasi' => 'Draft', 'status_arsip' => false]);
        return redirect()->route('laporan-keuangan.index')->with('success', 'Laporan keuangan berhasil dibuat.');
    }

    public function update(Request $request, LaporanKeuangan $laporan_keuangan)
    {
        abort_unless(! $laporan_keuangan->status_arsip && $laporan_keuangan->status_verifikasi === 'Draft', 403);
        abort_unless($request->user()->isOwner() || $request->user()->id_pengguna === $laporan_keuangan->FK_pengguna, 403);
        $laporan_keuangan->update($this->validated($request));
        return redirect()->route('laporan-keuangan.index')->with('success', 'Laporan diperbarui.');
    }

    public function review(Request $request, LaporanKeuangan $laporan_keuangan)
    {
        abort_unless($request->user()->isOwner(), 403);
        abort_unless($laporan_keuangan->status_verifikasi === 'Draft' && ! $laporan_keuangan->status_arsip, 422);
        $laporan_keuangan->update(['status_verifikasi' => 'Verified']);
        return back()->with('success', 'Laporan sudah diverifikasi.');
    }

    public function archive(Request $request, LaporanKeuangan $laporan_keuangan)
    {
        abort_unless($request->user()->isOwner(), 403);
        abort_unless($laporan_keuangan->status_verifikasi === 'Verified', 422);
        $laporan_keuangan->update(['status_arsip' => true]);
        return back()->with('success', 'Laporan diarsipkan.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'periode' => ['required', 'date_format:Y-m'],
            'FK_keuangan' => ['nullable', 'integer', 'exists:keuangan,id_keuangan'],
            'total_pendapatan' => ['required', 'numeric', 'min:0', 'max:9999999999999'],
            'total_pengeluaran' => ['required', 'numeric', 'min:0', 'max:9999999999999'],
        ]);
    }
}
