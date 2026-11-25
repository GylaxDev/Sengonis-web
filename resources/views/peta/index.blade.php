@extends('layouts.app')
@section('title', 'Peta 3D & Cuaca')
@push('styles')<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css">@endpush
@section('content')
<div class="ph">
    <div><h1><i data-lucide="map"></i>Peta perkebunan</h1><p>Geser untuk navigasi, klik kanan dan geser untuk memutar. Pohon ditampilkan sesuai tinggi tercatat.</p></div>
    <div class="row map-heading-controls">
        <form id="map-search" class="search" autocomplete="off"><i data-lucide="search"></i><input name="q" placeholder="Cari lokasi" aria-label="Cari lokasi peta" required></form>
        <button class="btn" type="button" id="map-plant"><i data-lucide="sprout"></i>Tanam melalui peta</button>
        @if(auth()->user()->isOwner())<button class="btn ghost" type="button" id="map-new-block"><i data-lucide="plus"></i>Buat blok</button><button class="btn ghost" type="button" id="map-move"><i data-lucide="map-pin"></i>Pindahkan kebun</button>@endif
    </div>
</div>
<div class="mapgrid sengonis-mapgrid">
    <section class="card" style="padding:10px">
        <div class="map-wrap map-large">
            <div id="map" aria-label="Peta interaktif perkebunan"></div>
            <div class="map-tools" role="group" aria-label="Opsi peta">
                <button type="button" class="btn sm" id="map-3d" aria-pressed="true">3D</button>
                <button type="button" class="btn sm" id="map-terrain" aria-pressed="true"><i data-lucide="mountain"></i>Terrain</button>
                <button type="button" class="btn sm" id="map-reset"><i data-lucide="locate-fixed"></i>Atur ulang</button>
            </div>
            <div class="map-instructions" id="map-instructions" hidden>
                <span id="map-instructions-text"></span>
                <button type="button" class="btn ghost sm" id="map-undo" hidden>Urungkan</button>
                <button type="button" class="btn sm" id="map-finish" hidden>Simpan blok</button>
                <button type="button" class="btn ghost sm" id="map-cancel">Batal</button>
            </div>
            <div class="map-loading" id="map-loading">Menyiapkan peta 3D…</div>
        </div>
    </section>
    <div class="col">
        @include('partials.cuaca')
        <section class="card" id="map-block-list"><div class="ch-h"><h2>Blok kebun</h2><span class="pill">{{ $jumlahBlok }} blok</span></div>
            @forelse($blocks as $block)
            <div class="map-block-row">
                <button type="button" class="map-block-focus" data-focus-block="{{ $block['nomor'] }}"><strong>Blok {{ $block['nomor'] }}</strong><small>{{ collect($markers)->where('blok', $block['nomor'])->where('status', '!=', 'Dead')->count() }} pohon hidup dari {{ collect($markers)->where('blok', $block['nomor'])->count() }} berkoordinat</small></button>
                @if(auth()->user()->isOwner())
                <button type="button" class="btn ghost sm" data-draw-block="{{ $block['nomor'] }}" title="Gambar ulang batas">Gambar ulang</button>
                <form method="POST" action="{{ route('peta.blok.delete', $block['nomor']) }}" onsubmit="return confirm('Hapus blok ini? Koordinat tanaman di blok ini akan dikosongkan.')">@csrf @method('DELETE')<button type="submit" class="btn ghost sm" title="Hapus blok">Hapus</button></form>
                @endif
            </div>
            @empty<p class="mut">Belum ada blok.</p>@endforelse
        </section>
    </div>
</div>
@if(auth()->user()->isOwner())
<form id="map-block-form" method="POST" action="{{ route('peta.blok.save') }}" hidden>@csrf<input name="nomor_blok" id="map-block-number"><input name="koordinat" id="map-block-coordinates"></form>
<form id="map-move-form" method="POST" action="{{ route('peta.pindah') }}" hidden>@csrf<input name="latitude" id="map-new-lat"><input name="longitude" id="map-new-lon"></form>
@endif
<script id="map-data" type="application/json">@json($mapData)</script>
@endsection
@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script src="{{ asset('js/peta-3d.js') }}"></script>
<script src="{{ asset('js/cuaca.js') }}"></script>
@endpush
