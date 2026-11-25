<?php

namespace App\Http\Controllers;

use App\Models\LaporanKematian;
use App\Models\Tanaman;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LaporanKematianController extends Controller
{
    public function index(Request $request)
    {
        return view('laporan-kematian.index', [
            'items' => LaporanKematian::with('tanaman', 'pengguna')
                ->when(! $request->boolean('arsip'), fn ($q) => $q->where('status_arsip', false))
                ->orderByDesc('tanggal_kematian')->paginate(10)->withQueryString(),
        ]);
    }
    public function create()
    {
        return view('laporan-kematian.form', ['item' => new LaporanKematian, 'tanaman' => Tanaman::orderBy('id_tanaman')->get()]);
    }
    public function edit(LaporanKematian $laporan_kematian)
    {
        abort_unless(! $laporan_kematian->status_arsip && $laporan_kematian->status_verifikasi === 'Draft', 403);
        abort_unless(auth()->user()->isOwner() || auth()->id() === $laporan_kematian->FK_pengguna, 403);
        return view('laporan-kematian.form', ['item' => $laporan_kematian, 'tanaman' => Tanaman::orderBy('id_tanaman')->get()]);
    }
    public function store(Request $request)
    {
        LaporanKematian::create([...$this->validated($request), 'FK_pengguna' => $request->user()->id_pengguna, 'status_verifikasi' => 'Draft', 'status_arsip' => false]);
        return redirect()->route('laporan-kematian.index')->with('success', 'Laporan kematian berhasil dibuat.');
    }
    public function update(Request $request, LaporanKematian $laporan_kematian)
    {
        abort_unless(! $laporan_kematian->status_arsip && $laporan_kematian->status_verifikasi === 'Draft', 403);
        abort_unless($request->user()->isOwner() || $request->user()->id_pengguna === $laporan_kematian->FK_pengguna, 403);
        $laporan_kematian->update($this->validated($request));
        return redirect()->route('laporan-kematian.index')->with('success', 'Laporan kematian diperbarui.');
    }
    public function review(Request $request, LaporanKematian $laporan_kematian)
    {
        abort_unless($request->user()->isOwner(), 403);
        abort_unless(! $laporan_kematian->status_arsip && $laporan_kematian->status_verifikasi === 'Draft', 422);
        $laporan_kematian->update(['status_verifikasi' => 'Verified']);
        return back()->with('success', 'Laporan kematian diverifikasi.');
    }
    public function archive(Request $request, LaporanKematian $laporan_kematian)
    {
        abort_unless($request->user()->isOwner(), 403);
        abort_unless($laporan_kematian->status_verifikasi === 'Verified', 422);
        $laporan_kematian->update(['status_arsip' => true]);
        return back()->with('success', 'Laporan kematian diarsipkan.');
    }
    private function validated(Request $request): array
    {
        return $request->validate([
            'FK_tanaman' => ['required', 'integer', 'exists:tanaman,id_tanaman'],
            'tanggal_kematian' => ['required', 'date', 'before_or_equal:today'],
            'jumlah_mati' => ['required', 'integer', 'min:1', 'max:1000000'],
            'penyebab_kematian' => ['required', 'string', 'max:2000'],
        ]);
    }
}
