@extends('layouts.app')
@section('title', 'Dashboard')
@section('content')
<section class="hero">
    <div class="hc">
        <p class="eye">Sengonis Plantation</p>
        <h1>Halo, {{ explode(' ', auth()->user()->nama_pengguna)[0] }}</h1>
        <p class="sub">Kelola tanaman, keuangan, dan risiko perkebunan dalam satu tempat.</p>
        <div class="row"><a class="btn" href="{{ route('tanaman.create') }}" data-modal-url="{{ route('tanaman.create') }}"><i data-lucide="plus"></i>Tambah tanaman</a><a class="btn ghost" href="{{ route('peta.index') }}"><i data-lucide="map"></i>Buka peta</a></div>
    </div>
    <div class="hart"><svg class="art" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="blur-art" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter></defs><rect width="600" height="400" fill="var(--artbg)"/><g filter="url(#blur-art)"><circle cx="140" cy="270" r="150" fill="var(--acc)"/><circle cx="340" cy="140" r="170" fill="var(--acc)" opacity=".92"/><circle cx="470" cy="310" r="140" fill="var(--blue)"/><circle cx="580" cy="110" r="110" fill="var(--acc)"/><circle cx="290" cy="380" r="110" fill="var(--taupe)"/></g><g fill="none" stroke="#fffaf0" stroke-width="2" opacity=".9"><circle cx="340" cy="210" r="150"/><circle cx="165" cy="310" r="115" stroke-dasharray="5 7"/><path d="M30 370C170 130 330 80 470 70"/></g></svg></div>
</section>
<div class="gs">
    <div class="stat"><span class="l">Pohon hidup</span><b>{{ number_format($jumlahHidup, 0, ',', '.') }}</b><span class="s">{{ $jumlahTanaman }} tanaman tercatat</span><i class="tic"><i data-lucide="sprout"></i></i></div>
    <div class="stat"><span class="l">Arus kas bersih · {{ $periode }} bulan</span><b class="{{ $arusKas < 0 ? 'neg' : 'pos' }}" title="Rp{{ number_format($arusKas,0,',','.') }}">Rp{{ number_format($arusKas, 0, ',', '.') }}</b><span class="s">Transaksi tervalidasi</span><i class="tic"><i data-lucide="trending-up"></i></i></div>
    <div class="stat"><span class="l">Pohon mati · {{ $periode }} bulan</span><b>{{ $jumlahMati }}</b><span class="s">Laporan terverifikasi</span><i class="tic"><i data-lucide="triangle-alert"></i></i></div>
    <div class="stat"><span class="l">Prediksi kerugian · bulan berikutnya</span><b title="{{ $prediksiSaatIni ? number_format($prediksiSaatIni['perkiraan_rupiah'],0,',','.') : '' }}">{{ $prediksiSaatIni ? 'Rp'.number_format($prediksiSaatIni['perkiraan_rupiah'],0,',','.') : 'Belum tersedia' }}</b><span class="s">{{ $prediksiSaatIni ? $prediksiSaatIni['target_bulan'] : 'Perlu 7+ bulan data valid' }}</span><i class="tic"><i data-lucide="activity"></i></i></div>
</div>
<div class="g2">
    <div class="col">
        <section class="card">
            <div class="ch-h"><h2>Tren data</h2><div class="seg" aria-label="Periode chart">
                @foreach([3,6,12] as $bulan)<a class="seg-link" href="{{ route('dashboard', ['periode'=>$bulan]) }}" aria-pressed="{{ $periode === $bulan ? 'true' : 'false' }}">{{ $bulan }} bulan</a>@endforeach
            </div></div>
            @include('partials.dashboard-chart', ['metric' => 'rupiah'])
            @include('partials.dashboard-chart', ['metric' => 'pohon'])
        </section>
        <section class="card">
            <div class="ch-h"><h2>Tanaman per blok</h2></div>
            @php
                $jumlahTahap = max(1, $jumlahTanaman);
                $maksBlok = max(1, $blok->max(fn($b) => $b->count()));
                $tahapWarna = ['Seedling' => '#9ed36a', 'Growing' => '#4c9a3a', 'Mature' => '#6d5d3f', 'Dead' => '#8d8d8d'];
            @endphp
            <div class="stk" role="img" aria-label="Komposisi pertumbuhan tanaman">@foreach($tahapWarna as $status => $warna)@if($tahap->get($status, 0))<i style="flex:{{ $tahap->get($status) }};background:{{ $warna }}" title="{{ $status }}: {{ $tahap->get($status) }}"></i>@endif @endforeach</div>
            <div class="lgd" style="margin:10px 0 18px">@foreach($tahapWarna as $status => $warna)<span><i style="background:{{ $warna }}"></i>{{ $status }} {{ $tahap->get($status, 0) }}</span>@endforeach</div>
            @forelse($blok as $id => $items)
                @php $hidup = $items->where('status_pertumbuhan', '!=', 'Dead'); $tinggi = $hidup->avg('tinggi_pohon') ?? 0; @endphp
                <div class="hz"><span>Blok {{ $id }} · {{ number_format($tinggi,1,',','.') }} m</span><div class="t"><i style="width:{{ $hidup->count() / $maksBlok * 100 }}%"></i></div><span>{{ $hidup->count() }}/{{ $items->count() }}</span></div>
            @empty<p class="mut">Belum ada tanaman.</p>@endforelse
        </section>
    </div>
    <div class="col">
        @include('partials.cuaca')
        <section class="card"><div class="ch-h"><h2>{{ auth()->user()->isOwner() ? 'Perlu ditinjau' : 'Menunggu persetujuan' }}</h2></div>
            @if($pendingKeuangan + $pendingLaporan + $pendingKematian)
            @if($pendingKeuangan)<a class="li clickable-card" href="{{ route('keuangan.index',['status'=>'Pending validation']) }}"><span class="dot"><i data-lucide="receipt"></i></span><span><b>{{ $pendingKeuangan }} transaksi</b><small>Menunggu validasi</small></span><span class="go"><i data-lucide="chevron-right"></i></span></a>@endif
            @if($pendingLaporan)<a class="li clickable-card" href="{{ route('laporan-keuangan.index') }}"><span class="dot"><i data-lucide="file-text"></i></span><span><b>{{ $pendingLaporan }} laporan keuangan</b><small>Belum diverifikasi</small></span><span class="go"><i data-lucide="chevron-right"></i></span></a>@endif
            @if($pendingKematian)<a class="li clickable-card" href="{{ route('laporan-kematian.index') }}"><span class="dot"><i data-lucide="triangle-alert"></i></span><span><b>{{ $pendingKematian }} laporan kematian</b><small>Belum diverifikasi</small></span><span class="go"><i data-lucide="chevron-right"></i></span></a>@endif
            @else<div class="ok-note"><i data-lucide="circle-check"></i>Semua data sudah ditinjau.</div>@endif
        </section>
    </div>
</div>
@include('dashboard.prediksi')
@endsection
@push('scripts')<script src="{{ asset('js/cuaca.js') }}"></script>@endpush
