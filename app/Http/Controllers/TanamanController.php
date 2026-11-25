<?php

namespace App\Http\Controllers;

use App\Models\Tanaman;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TanamanController extends Controller
{
    private array $statuses = ['Seedling', 'Growing', 'Mature', 'Dead'];

    public function index(Request $request)
    {
        $query = Tanaman::with('pengguna')->orderByDesc('id_tanaman');
        if ($request->filled('blok')) $query->where('lokasi_blok', $request->input('blok'));
        if ($request->filled('status')) $query->where('status_pertumbuhan', $request->input('status'));
        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('id_tanaman', 'like', "%{$q}%")
                    ->orWhere('lokasi_blok', 'like', "%{$q}%");
            });
        }
        return view('tanaman.index', [
            'items' => $query->paginate(10)->withQueryString(),
            'blok' => Tanaman::distinct()->orderBy('lokasi_blok')->pluck('lokasi_blok'),
            'jumlahHidup' => Tanaman::where('status_pertumbuhan', '!=', 'Dead')->count(),
            'jumlahTanaman' => Tanaman::count(),
        ]);
    }

    public function create() { return view('tanaman.form', ['item' => new Tanaman]); }
    public function edit(Tanaman $tanaman) { return view('tanaman.form', ['item' => $tanaman]); }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        Tanaman::create([...$data, 'FK_pengguna' => $request->user()->id_pengguna]);
        return redirect()->route('tanaman.index')->with('success', 'Data tanaman berhasil ditambahkan.');
    }

    public function update(Request $request, Tanaman $tanaman)
    {
        $this->authorizeEditor($request, $tanaman->FK_pengguna);
        $tanaman->update($this->validated($request));
        return redirect()->route('tanaman.index')->with('success', 'Data tanaman berhasil diperbarui.');
    }

    public function destroy(Request $request, Tanaman $tanaman)
    {
        $this->authorizeEditor($request, $tanaman->FK_pengguna);
        if ($tanaman->laporanKematian()->exists()) {
            return back()->with('error', 'Tanaman sudah digunakan dalam laporan kematian, tidak bisa dihapus.');
        }
        $tanaman->delete();
        return back()->with('success', 'Tanaman berhasil dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'tanggal_tanam' => ['required', 'date', 'before_or_equal:today'],
            'tinggi_pohon' => ['required', 'numeric', 'min:0', 'max:999999'],
            'diameter_pohon' => ['required', 'numeric', 'min:0', 'max:999999'],
            'lokasi_blok' => ['required', 'integer', 'min:1', 'max:1000000'],
            'status_pertumbuhan' => ['required', Rule::in($this->statuses)],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);
    }

    private function authorizeEditor(Request $request, int $creatorId): void
    {
        abort_unless($request->user()->isOwner() || $request->user()->id_pengguna === $creatorId, 403);
    }
}
