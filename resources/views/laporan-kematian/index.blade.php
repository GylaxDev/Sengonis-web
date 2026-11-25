@extends('layouts.app')
@section('title', 'Laporan Kematian')
@section('content')
<div class="ph"><div><h1><i data-lucide="triangle-alert"></i>Laporan Kematian</h1><p>Rekam penyebab dan jumlah kematian pohon untuk tindak lanjut.</p></div><a class="btn" href="{{ route('laporan-kematian.create') }}"><i data-lucide="plus"></i>Buat laporan</a></div>
<a class="btn ghost" href="{{ route('export', 'laporan-kematian') }}"><i data-lucide="download"></i>Export CSV</a>
<div class="tools"><div class="row"><a href="{{ route('laporan-kematian.index') }}" class="btn {{ request()->boolean('arsip') ? 'ghost' : '' }} sm">Aktif</a><a href="{{ route('laporan-kematian.index',['arsip'=>1]) }}" class="btn {{ request()->boolean('arsip') ? '' : 'ghost' }} sm">Semua termasuk arsip</a></div></div>
<div class="tw"><div class="sc"><table><thead><tr><th class="table-heading">Tanggal</th><th class="table-heading">ID Tanaman</th><th class="table-heading r">Jumlah mati</th><th class="table-heading">Penyebab</th><th class="table-heading">Verifikasi</th><th class="table-heading">Arsip</th><th class="table-heading">Pelapor</th><th class="table-heading r">Aksi</th></tr></thead><tbody>
@forelse($items as $item)
<tr><td>{{ $item->tanggal_kematian->format('d/m/Y') }}</td><td><b>#{{ $item->FK_tanaman }}</b> <span class="mini-sub">· Blok {{ $item->tanaman?->lokasi_blok ?? '—' }}</span></td><td class="r">{{ $item->jumlah_mati }}</td><td style="white-space:normal;max-width:260px">{{ $item->penyebab_kematian }}</td><td><span class="pill {{ $item->status_verifikasi === 'Verified' ? 'ok' : 'wait' }}">{{ $item->status_verifikasi }}</span></td><td>{{ $item->status_arsip ? 'Ya' : 'Tidak' }}</td><td>{{ $item->pengguna?->nama_pengguna ?? '—' }}</td><td class="a actions-wrap"><div class="table-actions">
@if(!$item->status_arsip && $item->status_verifikasi === 'Draft' && (auth()->user()->isOwner() || auth()->id() === $item->FK_pengguna))<a class="btn sm ghost" href="{{ route('laporan-kematian.edit', $item) }}">Edit</a>@endif
@if(auth()->user()->isOwner() && !$item->status_arsip)
@if($item->status_verifikasi === 'Draft')<form method="POST" action="{{ route('laporan-kematian.review', $item) }}">@csrf<button class="btn sm">Verifikasi</button></form>@else<form method="POST" action="{{ route('laporan-kematian.archive', $item) }}" data-confirm="Arsipkan laporan kematian ini?">@csrf<button class="btn sm ghost">Arsipkan</button></form>@endif
@endif
</div></td></tr>
@empty<tr><td colspan="8" class="no-data">Belum ada laporan kematian.</td></tr>@endforelse
</tbody></table></div>@include('partials.pagination')</div>
@endsection
