@extends('layouts.app')
@section('title', $item->exists ? 'Edit Laporan Kematian' : 'Buat Laporan Kematian')
@section('content')
<div class="ph"><div><h1><i data-lucide="triangle-alert"></i>{{ $item->exists ? 'Edit Laporan Kematian' : 'Laporan Kematian Baru' }}</h1><p>Laporan tercatat sebagai Draft hingga diverifikasi Owner.</p></div><a class="btn ghost" href="{{ route('laporan-kematian.index') }}"><i data-lucide="arrow-left"></i>Kembali</a></div>
<section class="card form-card"><form method="POST" action="{{ $item->exists ? route('laporan-kematian.update', $item) : route('laporan-kematian.store') }}">@csrf @if($item->exists)@method('PUT')@endif
<div class="form-grid">
<label class="fld">Tanaman<select name="FK_tanaman" required><option value="">Pilih tanaman</option>@foreach($tanaman as $t)<option value="{{ $t->id_tanaman }}" @selected((string)old('FK_tanaman',$item->FK_tanaman)===(string)$t->id_tanaman)>#{{ $t->id_tanaman }} · Blok {{ $t->lokasi_blok }}</option>@endforeach</select></label>
<label class="fld">Tanggal kematian<input type="date" name="tanggal_kematian" required max="{{ today()->toDateString() }}" value="{{ old('tanggal_kematian', $item->tanggal_kematian?->format('Y-m-d') ?? today()->toDateString()) }}"></label>
<label class="fld">Jumlah pohon mati<input type="number" name="jumlah_mati" min="1" step="1" required value="{{ old('jumlah_mati', $item->jumlah_mati ?? 1) }}"></label>
<label class="fld full">Penyebab kematian<textarea name="penyebab_kematian" rows="3" maxlength="2000" required placeholder="Contoh: serangan hama boktor">{{ old('penyebab_kematian', $item->penyebab_kematian) }}</textarea></label>
</div>
<div class="form-actions"><button class="btn"><i data-lucide="save"></i>Simpan laporan</button><a class="btn ghost" href="{{ route('laporan-kematian.index') }}">Batal</a></div></form></section>
@endsection
