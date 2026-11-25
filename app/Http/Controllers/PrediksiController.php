<?php

namespace App\Http\Controllers;

use App\Models\Prediksi;
use App\Services\PrediksiService;
use Illuminate\Http\Request;

class PrediksiController extends Controller
{
    public function index(PrediksiService $service)
    {
        return view('prediksi.index', [
            'items' => Prediksi::orderByDesc('tanggal_prediksi')->orderByDesc('id_prediksi')->paginate(10),
            'estimasi' => $service->hitung(),
        ]);
    }

    public function store(Request $request, PrediksiService $service)
    {
        abort_unless($request->user()->isOwner(), 403);
        $data = $service->hitung();
        if ($data === null) {
            return back()->with('error', 'Random Forest memerlukan transaksi tervalidasi dari minimal 7 bulan berbeda yang sudah selesai.');
        }
        Prediksi::create(['tanggal_prediksi' => now()->toDateString(), 'hasil_prediksi' => json_encode($data, JSON_UNESCAPED_UNICODE)]);
        return back()->with('success', 'Hasil Random Forest berhasil disimpan ke database.');
    }
}
