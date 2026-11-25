@extends('layouts.app')
@section('title', 'Laporan Keuangan')
@section('content')
<div class="ph"><div><h1><i data-lucide="file-text"></i>Laporan Keuangan</h1><p>Rekap pendapatan dan pengeluaran berdasarkan periode.</p></div><a class="btn" href="{{ route('laporan-keuangan.create') }}"><i data-lucide="plus"></i>Buat laporan</a></div>
<a class="btn ghost" href="{{ route('export', 'laporan-keuangan') }}"><i data-lucide="download"></i>Export CSV</a>
<div class="tools"><div class="row"><a href="{{ route('laporan-keuangan.index') }}" class="btn {{ request()->boolean('arsip') ? 'ghost' : '' }} sm">Aktif</a><a href="{{ route('laporan-keuangan.index',['arsip'=>1]) }}" class="btn {{ request()->boolean('arsip') ? '' : 'ghost' }} sm">Semua termasuk arsip</a></div></div>
<div class="tw"><div class="sc"><table><thead><tr><th class="table-heading">ID</th><th class="table-heading">Periode</th><th class="table-heading r">Total pendapatan</th><th class="table-heading r">Total pengeluaran</th><th class="table-heading">Verifikasi</th><th class="table-heading">Arsip</th><th class="table-heading">Dibuat oleh</th><th class="table-heading r">Aksi</th></tr></thead><tbody>
@forelse($items as $item)
<tr><td><b>#{{ $item->id_laporan_keuangan }}</b></td><td>{{ $item->periode }}</td><td class="r pos">Rp{{ number_format((float)$item->total_pendapatan,0,',','.') }}</td><td class="r">Rp{{ number_format((float)$item->total_pengeluaran,0,',','.') }}</td><td><span class="pill {{ $item->status_verifikasi === 'Verified' ? 'ok' : 'wait' }}">{{ $item->status_verifikasi }}</span></td><td><span class="pill {{ $item->status_arsip ? 'inf' : '' }}">{{ $item->status_arsip ? 'Diarsip' : 'Aktif' }}</span></td><td>{{ $item->pengguna?->nama_pengguna ?? '—' }}</td><td class="a actions-wrap"><div class="table-actions">
@if(!$item->status_arsip && $item->status_verifikasi === 'Draft' && (auth()->user()->isOwner() || auth()->id() === $item->FK_pengguna))<a class="btn sm ghost" href="{{ route('laporan-keuangan.edit', $item) }}">Edit</a>@endif
@if(auth()->user()->isOwner() && !$item->status_arsip)
    @if($item->status_verifikasi === 'Draft')<form method="POST" action="{{ route('laporan-keuangan.review', $item) }}">@csrf<button class="btn sm" type="submit">Verifikasi</button></form>@else<form method="POST" action="{{ route('laporan-keuangan.archive', $item) }}" data-confirm="Arsipkan laporan ini?">@csrf<button class="btn sm ghost" type="submit">Arsipkan</button></form>@endif
@endif
</div></td></tr>
@empty<tr><td colspan="8" class="no-data">Belum ada laporan keuangan.</td></tr>@endforelse
</tbody></table></div>@include('partials.pagination')</div>
@endsection
