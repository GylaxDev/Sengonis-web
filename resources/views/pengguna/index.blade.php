@extends('layouts.app')
@section('title', 'Pengguna')
@section('content')
<div class="ph"><div><h1><i data-lucide="users"></i>Pengguna</h1><p>Owner mengatur akun petugas. Pengguna nonaktif tidak dapat masuk.</p></div><a class="btn" href="{{ route('pengguna.create') }}"><i data-lucide="user-plus"></i>Tambah petugas</a></div>
<div class="tw"><div class="sc"><table><thead><tr><th class="table-heading">Nama pengguna</th><th class="table-heading">Username</th><th class="table-heading">Role</th><th class="table-heading">Telepon</th><th class="table-heading">Status</th><th class="table-heading r">Aksi</th></tr></thead><tbody>
@foreach($items as $item)<tr><td><b>{{ $item->nama_pengguna }}</b></td><td>{{ $item->username }}</td><td><span class="pill {{ $item->isOwner() ? 'inf' : '' }}">{{ $item->role }}</span></td><td>{{ $item->no_telepon ?? '—' }}</td><td><span class="pill {{ $item->status_aktif ? 'ok' : 'no' }}">{{ $item->status_aktif ? 'Aktif' : 'Nonaktif' }}</span></td><td class="a"><div class="table-actions"><a class="btn sm ghost" href="{{ route('pengguna.edit', $item) }}">Edit</a>@if(!$item->isOwner())<form method="POST" action="{{ route('pengguna.toggle', $item) }}" data-confirm="Ubah status akun ini?">@csrf<button class="btn sm {{ $item->status_aktif ? 'ghost' : '' }}" type="submit">{{ $item->status_aktif ? 'Nonaktifkan' : 'Aktifkan' }}</button></form>@endif</div></td></tr>@endforeach
</tbody></table></div>@include('partials.pagination')</div>
@endsection
