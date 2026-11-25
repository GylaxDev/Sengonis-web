@extends('layouts.app')
@section('title', 'Prediksi Random Forest')
@section('content')
<div class="ph">
    <div><h1><i data-lucide="trending-up"></i>Prediksi Kerugian Sengon</h1><p>Estimasi kerugian bulan berikutnya berdasarkan data historis yang sudah diverifikasi.</p></div>
    @if(auth()->user()->isOwner())
    <form method="POST" action="{{ route('prediksi.store') }}">@csrf<button class="btn" type="submit"><i data-lucide="save"></i>Simpan prediksi</button></form>
    @endif
</div>
<div class="prediction-content">
    <section class="card">
        <div class="ch-h"><h2>Perkiraan biaya kerugian</h2></div>
        @if($estimasi)
            <p class="mini-sub">Target periode {{ $estimasi['target_bulan'] }} • berdasarkan data lengkap sampai {{ $estimasi['data_sampai'] }}</p>
            <p style="font-size:2.2rem;font-weight:600;margin:14px 0">Rp{{ number_format($estimasi['perkiraan_rupiah'],0,',','.') }}</p>
            <div class="hstat">
                <div>Rata-rata arus kas<b>Rp{{ number_format($estimasi['rerata_arus_kas'],0,',','.') }}</b></div>
                <div>Rata-rata pohon mati<b>{{ number_format($estimasi['rerata_kematian'],1,',','.') }}/bulan</b></div>
                <div>Jumlah bulan historis<b>{{ $estimasi['jumlah_bulan'] }} bulan</b></div>
            </div>
            <p class="mini-sub" style="margin-top:12px">Kerugian aktual bulan terakhir: Rp{{ number_format($estimasi['kerugian_terakhir'],0,',','.') }}.</p>
        @else
            <div class="no-data"><b>Riwayat belum mencukupi</b>Belum cukup transaksi tervalidasi untuk membuat prediksi.</div>
        @endif
    </section>
</div>
<section class="card" style="overflow:auto"><div class="ch-h"><h2>Riwayat prediksi tersimpan</h2></div><div class="tw"><div class="sc"><table><thead><tr><th class="table-heading">Tanggal</th><th class="table-heading">Periode target</th><th class="table-heading">Prediksi</th><th class="table-heading">Metode</th></tr></thead><tbody>
@forelse($items as $item)
@php $result = json_decode($item->hasil_prediksi ?? '',true); @endphp
<tr><td>{{ $item->tanggal_prediksi->format('d/m/Y') }}</td><td>{{ is_array($result) ? ($result['target_bulan'] ?? '—') : '—' }}</td><td><b>{{ is_array($result) && isset($result['perkiraan_rupiah']) ? 'Rp'.number_format($result['perkiraan_rupiah'],0,',','.') : '—' }}</b></td><td>{{ is_array($result) ? ($result['metode'] ?? 'Data lama') : 'Data lama' }}</td></tr>
@empty<tr><td colspan="4" class="no-data">Belum ada hasil prediksi yang disimpan.</td></tr>@endforelse
</tbody></table></div>@include('partials.pagination')</div></section>
@endsection
