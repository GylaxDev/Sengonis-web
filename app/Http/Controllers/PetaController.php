<?php

namespace App\Http\Controllers;

use App\Models\BlokPeta;
use App\Models\Tanaman;
use App\Services\GeometriPeta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class PetaController extends Controller
{
    public function index(GeometriPeta $geo)
    {
        $tanaman = Tanaman::query()->get();
        $blocks = BlokPeta::query()->orderBy('nomor_blok')->get()->map(fn ($b) => [
            'nomor' => $b->nomor_blok,
            'koordinat' => $b->koordinat,
        ])->all();
        $markers = $tanaman->filter(fn ($t) => $t->latitude !== null && $t->longitude !== null)
            ->map(fn ($t) => [
                'id' => $t->id_tanaman,
                'lat' => (float) $t->latitude,
                'lng' => (float) $t->longitude,
                'blok' => (int) $t->lokasi_blok,
                'status' => $t->status_pertumbuhan,
                'tinggi' => (float) $t->tinggi_pohon,
                'diameter' => (float) $t->diameter_pohon,
                'tanggal' => $t->tanggal_tanam->toDateString(),
                'ubah_url' => route('tanaman.edit', $t),
            ])->values()->all();

        // Pusat kebun tetap valid walau seluruh batas blok belum diinput.
        $center = $blocks ? $geo->pusat(array_map(fn ($b) => ['koordinat' => $b['koordinat']], $blocks))
            : ($markers ? [$markers[0]['lng'], $markers[0]['lat']] : [(float) config('sengonis.center_lng'), (float) config('sengonis.center_lat')]);

        // Bangun array di controller agar directive @json Blade menerima variabel sederhana.
        // Ini menghindari parse error saat Blade membaca ekspresi array dengan fungsi bersarang.
        $mapData = [
            'markers' => $markers,
            'blocks' => $blocks,
            'center' => $center,
            'plantUrl' => route('tanaman.create'),
            'isOwner' => auth()->user()->isOwner(),
        ];

        return view('peta.index', [
            'mapData' => $mapData,
            'markers' => $markers,
            'blocks' => $blocks,
            'center' => $center,
            'total' => count($markers),
            'jumlahTanaman' => $tanaman->count(),
            'jumlahBlok' => count($blocks),
        ]);
    }

    public function simpanBlok(Request $request, GeometriPeta $geo)
    {
        $data = $request->validate([
            'nomor_blok' => ['required', 'integer', 'min:1', 'max:1000000'],
            'koordinat' => ['required', 'string', 'json', 'max:30000'],
        ]);
        try {
            $ring = $geo->validateRing(json_decode($data['koordinat'], true, 512, JSON_THROW_ON_ERROR));
        } catch (InvalidArgumentException $error) {
            throw ValidationException::withMessages(['koordinat' => $error->getMessage()]);
        }
        BlokPeta::updateOrCreate(['nomor_blok' => $data['nomor_blok']], ['koordinat' => $ring]);
        return redirect()->route('peta.index')->with('success', 'Poligon blok '.$data['nomor_blok'].' berhasil disimpan di database.');
    }

    public function hapusBlok(BlokPeta $blok)
    {
        DB::transaction(function () use ($blok) {
            // Perilaku prototipe: data tanaman tetap ada tetapi penanda peta ditarik.
            Tanaman::where('lokasi_blok', $blok->nomor_blok)->update(['latitude' => null, 'longitude' => null]);
            $blok->delete();
        });
        return back()->with('success', 'Blok dihapus. Tanamannya tetap tercatat, tetapi koordinatnya dikosongkan.');
    }

    public function pindah(Request $request, GeometriPeta $geo)
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-85,85'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);
        DB::transaction(function () use ($geo, $data) {
            $blocks = BlokPeta::query()->lockForUpdate()->get();
            if ($blocks->isEmpty()) {
                throw ValidationException::withMessages(['latitude' => 'Buat minimal satu blok sebelum memindahkan kebun.']);
            }
            $pusatLama = $geo->pusat($blocks->map(fn ($b) => ['koordinat' => $b->koordinat])->all());
            $pusatBaru = [(float) $data['longitude'], (float) $data['latitude']];
            foreach ($blocks as $blok) {
                $blok->update(['koordinat' => array_map(fn ($point) => $geo->translasi($point, $pusatLama, $pusatBaru), $blok->koordinat)]);
            }
            Tanaman::query()->whereNotNull('latitude')->whereNotNull('longitude')->chunkById(100, function ($tanaman) use ($geo, $pusatLama, $pusatBaru) {
                foreach ($tanaman as $t) {
                    [$lng, $lat] = $geo->translasi([(float) $t->longitude, (float) $t->latitude], $pusatLama, $pusatBaru);
                    $t->update(['longitude' => $lng, 'latitude' => $lat]);
                }
            }, 'id_tanaman');
        });
        return redirect()->route('peta.index')->with('success', 'Seluruh blok dan titik tanaman dipindah ke pusat kebun baru.');
    }
}
