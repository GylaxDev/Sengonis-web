@extends('layouts.app')
@section('title', $item->exists ? 'Edit Pengguna' : 'Tambah Petugas')
@section('content')
<div class="ph"><div><h1><i data-lucide="user-plus"></i>{{ $item->exists ? 'Edit Pengguna' : 'Tambah Petugas Lapangan' }}</h1><p>Akun baru memiliki peran Field Officer.</p></div><a class="btn ghost" href="{{ route('pengguna.index') }}"><i data-lucide="arrow-left"></i>Kembali</a></div>
<section class="card form-card"><form method="POST" action="{{ $item->exists ? route('pengguna.update', $item) : route('pengguna.store') }}">@csrf @if($item->exists)@method('PUT')@endif
<div class="form-grid"><label class="fld">Nama lengkap<input name="nama_pengguna" required maxlength="50" value="{{ old('nama_pengguna', $item->nama_pengguna) }}"></label>
<label class="fld">Username<input name="username" required maxlength="100" autocomplete="off" value="{{ old('username', $item->username) }}"></label>
<label class="fld">Nomor telepon<input name="no_telepon" maxlength="15" value="{{ old('no_telepon', $item->no_telepon) }}"></label>
<label class="fld">Password {{ $item->exists ? '(kosongkan bila tidak berubah)' : '' }}<input name="password" type="password" {{ $item->exists ? '' : 'required' }} autocomplete="new-password" minlength="8"><small>Minimal 8 karakter.</small></label></div>
<div class="form-actions"><button class="btn"><i data-lucide="save"></i>Simpan akun</button><a class="btn ghost" href="{{ route('pengguna.index') }}">Batal</a></div>
</form></section>
@endsection
