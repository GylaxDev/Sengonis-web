@extends('layouts.app')
@section('title', 'Tanaman')
@section('content')
<div class="ph"><div><h1><i data-lucide="sprout"></i>Tanaman</h1><p>{{ $jumlahHidup }} pohon hidup dari {{ $jumlahTanaman }} tanaman tercatat.</p></div><div class="row"><a class="btn" href="{{ route('tanaman.create') }}" data-modal-url="{{ route('tanaman.create') }}"><i data-lucide="plus"></i>Tambah tanaman</a></div></div>
<a class="btn ghost" href="{{ route('export', 'tanaman') }}" style="justify-self:start"><i data-lucide="download"></i>Export CSV</a>
<form method="GET" class="tools">
    <div class="row">
        <span class="search"><i data-lucide="search"></i><input name="q" value="{{ request('q') }}" placeholder="Cari ID / blok"></span>
        <select name="blok" aria-label="Filter blok"><option value="">Semua blok</option>@foreach($blok as $b)<option value="{{ $b }}" @selected((string)request('blok') === (string)$b)>Blok {{ $b }}</option>@endforeach</select>
        <select name="status" aria-label="Status"><option value="">Semua status</option>@foreach(['Seedling', 'Growing', 'Mature', 'Dead'] as $s)<option value="{{ $s }}" @selected(request('status') === $s)>{{ $s }}</option>@endforeach</select>
        <button class="btn ghost" type="submit"><i data-lucide="filter"></i>Filter</button>
    </div>
</form>
<div class="tw"><div class="sc"><table><thead><tr><th class="table-heading">ID</th><th class="table-heading">Tanggal tanam</th><th class="table-heading">Tinggi (m)</th><th class="table-heading">Diameter (cm)</th><th class="table-heading">Lokasi</th><th class="table-heading">Pertumbuhan</th><th class="table-heading">Dicatat oleh</th><th class="table-heading r">Aksi</th></tr></thead><tbody>
@forelse($items as $item)
<tr><td><b>#{{ $item->id_tanaman }}</b></td><td>{{ $item->tanggal_tanam->format('d/m/Y') }}</td><td>{{ number_format((float)$item->tinggi_pohon, 2, ',', '.') }}</td><td>{{ number_format((float)$item->diameter_pohon, 2, ',', '.') }}</td><td>Blok {{ $item->lokasi_blok }}</td><td><span class="pill {{ $item->status_pertumbuhan === 'Dead' ? 'no' : ($item->status_pertumbuhan === 'Mature' ? 'ok' : 'inf') }}">{{ $item->status_pertumbuhan }}</span></td><td>{{ $item->pengguna?->nama_pengguna ?? '—' }}</td><td class="a actions-wrap">
@if(auth()->user()->isOwner() || auth()->id() === $item->FK_pengguna)
<div class="table-actions"><a class="btn sm ghost" href="{{ route('tanaman.edit', $item) }}" data-modal-url="{{ route('tanaman.edit', $item) }}"><i data-lucide="pencil"></i>Edit</a><form method="POST" action="{{ route('tanaman.destroy', $item) }}" data-confirm="Hapus data tanaman ini?">@csrf @method('DELETE')<button class="btn sm ghost" type="submit"><i data-lucide="trash-2"></i>Hapus</button></form></div>
@else<span class="mut">—</span>@endif
</td></tr>
@empty<tr><td colspan="8" class="no-data">Belum ada data tanaman yang sesuai.</td></tr>@endforelse
</tbody></table></div>@include('partials.pagination')</div>
@endsection
