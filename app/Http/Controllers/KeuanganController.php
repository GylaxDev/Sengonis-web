<?php

namespace App\Http\Controllers;

use App\Models\Keuangan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KeuanganController extends Controller
{
    private const JENIS = ['Seedling purchase', 'Operations', 'Sale'];

    public function index(Request $request)
    {
        $query = Keuangan::with('pengguna')->orderByDesc('tanggal_transaksi')->orderByDesc('id_keuangan');
        if ($request->filled('jenis')) $query->where('jenis_transaksi', $request->input('jenis'));
        if ($request->filled('status')) $query->where('status_validasi', $request->input('status'));
        $items = $query->paginate(12)->withQueryString();
        return view('keuangan.index', [
            'items' => $items,
            'pendapatan' => Keuangan::where('status_validasi', 'Validated')->where('jenis_transaksi', 'Sale')->sum('nominal'),
            'pengeluaran' => Keuangan::where('status_validasi', 'Validated')->where('jenis_transaksi', '!=', 'Sale')->sum('nominal'),
            'menunggu' => Keuangan::where('status_validasi', 'Pending validation')->count(),
        ]);
    }

    public function create() { return view('keuangan.form', ['item' => new Keuangan]); }
    public function edit(Keuangan $keuangan) { return view('keuangan.form', ['item' => $keuangan]); }

    public function store(Request $request)
    {
        Keuangan::create([...$this->validated($request), 'FK_pengguna' => $request->user()->id_pengguna, 'status_validasi' => 'Pending validation']);
        return redirect()->route('keuangan.index')->with('success', 'Transaksi disimpan dan menunggu validasi Owner.');
    }

    public function update(Request $request, Keuangan $keuangan)
    {
        $this->canEdit($request, $keuangan);
        $keuangan->update([...$this->validated($request), 'status_validasi' => 'Pending validation']);
        return redirect()->route('keuangan.index')->with('success', 'Transaksi diperbarui; status kembali menunggu validasi.');
    }

    public function destroy(Request $request, Keuangan $keuangan)
    {
        $this->canEdit($request, $keuangan);
        if ($keuangan->laporanKeuangan()->exists()) return back()->with('error', 'Transaksi masih digunakan di laporan keuangan.');
        $keuangan->delete();
        return back()->with('success', 'Transaksi dihapus.');
    }

    public function review(Request $request, Keuangan $keuangan)
    {
        $data = $request->validate(['aksi' => ['required', Rule::in(['Validated', 'Rejected'])]]);
        abort_unless($request->user()->isOwner(), 403);
        abort_unless($keuangan->status_validasi === 'Pending validation', 422, 'Hanya transaksi tertunda yang dapat diproses.');
        $keuangan->update(['status_validasi' => $data['aksi']]);
        return back()->with('success', 'Status transaksi berhasil diperbarui.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'tanggal_transaksi' => ['required', 'date'],
            'jenis_transaksi' => ['required', Rule::in(self::JENIS)],
            'nominal' => ['required', 'numeric', 'min:0.01', 'max:9999999999999'],
            'status_pembayaran' => ['required', Rule::in(['Paid', 'Unpaid'])],
        ]);
    }

    private function canEdit(Request $request, Keuangan $keuangan): void
    {
        abort_unless($request->user()->isOwner() || $request->user()->id_pengguna === $keuangan->FK_pengguna, 403);
        abort_unless($keuangan->status_validasi !== 'Validated', 403, 'Transaksi tervalidasi tidak boleh diedit langsung.');
    }
}
