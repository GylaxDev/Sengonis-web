@extends('layouts.app')
@section('title', $item->exists ? 'Edit Laporan Keuangan' : 'Buat Laporan Keuangan')
@section('content')
<div class="ph"><div><h1><i data-lucide="file-text"></i>{{ $item->exists ? 'Edit Laporan Keuangan' : 'Laporan Keuangan Baru' }}</h1><p>Isi rekap pendapatan dan pengeluaran. Owner dapat memverifikasi setelah disimpan.</p></div><a class="btn ghost" href="{{ route('laporan-keuangan.index') }}"><i data-lucide="arrow-left"></i>Kembali</a></div>
<section class="card form-card"><form method="POST" action="{{ $item->exists ? route('laporan-keuangan.update', $item) : route('laporan-keuangan.store') }}">@csrf @if($item->exists)@method('PUT')@endif
<div class="form-grid">
<label class="fld">Periode (bulan)<input type="month" name="periode" value="{{ old('periode', $item->periode ?? now()->format('Y-m')) }}" required></label>
<label class="fld">Referensi transaksi (opsional)<select name="FK_keuangan"><option value="">Tanpa referensi transaksi tunggal</option>@foreach($transaksi as $t)<option value="{{ $t->id_keuangan }}" @selected((string)old('FK_keuangan',$item->FK_keuangan)===(string)$t->id_keuangan)>#{{ $t->id_keuangan }} · {{ $t->tanggal_transaksi->format('d/m/Y') }} · {{ $t->jenis_transaksi }}</option>@endforeach</select></label>
<label class="fld">Total pendapatan (Rp)<input type="number" name="total_pendapatan" min="0" step="0.01" value="{{ old('total_pendapatan', $item->total_pendapatan ?? 0) }}" required></label>
<label class="fld">Total pengeluaran (Rp)<input type="number" name="total_pengeluaran" min="0" step="0.01" value="{{ old('total_pengeluaran', $item->total_pengeluaran ?? 0) }}" required></label>
</div>
<div class="form-actions"><button class="btn"><i data-lucide="save"></i>Simpan laporan</button><a class="btn ghost" href="{{ route('laporan-keuangan.index') }}">Batal</a></div></form></section>
@endsection
