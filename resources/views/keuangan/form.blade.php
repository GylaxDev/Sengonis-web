@extends('layouts.app')
@section('title', $item->exists ? 'Edit Transaksi' : 'Tambah Transaksi')
@section('content')
<div class="ph"><div><h1><i data-lucide="receipt"></i>{{ $item->exists ? 'Edit Transaksi #'.$item->id_keuangan : 'Tambah Transaksi' }}</h1><p>Transaksi baru dan perubahan akan menunggu validasi Owner.</p></div><a class="btn ghost" href="{{ route('keuangan.index') }}"><i data-lucide="arrow-left"></i>Kembali</a></div>
<section class="card form-card"><form method="POST" action="{{ $item->exists ? route('keuangan.update', $item) : route('keuangan.store') }}">@csrf @if($item->exists)@method('PUT')@endif
<div class="form-grid">
<label class="fld">Tanggal transaksi<input type="date" name="tanggal_transaksi" required value="{{ old('tanggal_transaksi', $item->tanggal_transaksi?->format('Y-m-d') ?? today()->toDateString()) }}"></label>
<label class="fld">Jenis transaksi<select name="jenis_transaksi">@foreach(['Seedling purchase' => 'Pembelian bibit', 'Operations' => 'Operasional', 'Sale' => 'Penjualan'] as $key=>$label)<option value="{{ $key }}" @selected(old('jenis_transaksi', $item->jenis_transaksi ?? 'Operations') === $key)>{{ $label }}</option>@endforeach</select></label>
<label class="fld">Nominal (Rp)<input type="number" name="nominal" step="0.01" min="0.01" required value="{{ old('nominal', $item->nominal ?? 0) }}"></label>
<label class="fld">Status pembayaran<select name="status_pembayaran"><option value="Paid" @selected(old('status_pembayaran', $item->status_pembayaran ?? 'Paid') === 'Paid')>Sudah dibayar</option><option value="Unpaid" @selected(old('status_pembayaran', $item->status_pembayaran) === 'Unpaid')>Belum dibayar</option></select></label>
</div>
<div class="form-actions"><button class="btn"><i data-lucide="save"></i>Simpan transaksi</button><a class="btn ghost" href="{{ route('keuangan.index') }}">Batal</a></div>
</form></section>
@endsection
