@extends('layouts.app')
@section('title', $item->exists ? 'Edit Tanaman' : 'Tambah Tanaman')
@section('content')
<div class="ph"><div><h1><i data-lucide="sprout"></i>{{ $item->exists ? 'Edit Tanaman #'.$item->id_tanaman : 'Tambah Tanaman' }}</h1><p>Catat atau perbarui data tanaman.</p></div><a class="btn ghost" href="{{ route('tanaman.index') }}"><i data-lucide="arrow-left"></i>Kembali</a></div>
<section class="card form-card"><form method="POST" action="{{ $item->exists ? route('tanaman.update', $item) : route('tanaman.store') }}">@csrf @if($item->exists)@method('PUT')@endif
    <div class="form-grid">
        <label class="fld">Tanggal tanam<input type="date" name="tanggal_tanam" required max="{{ today()->toDateString() }}" value="{{ old('tanggal_tanam', $item->tanggal_tanam?->format('Y-m-d') ?? today()->toDateString()) }}">@error('tanggal_tanam')<span class="field-error">{{ $message }}</span>@enderror</label>
        <label class="fld">Blok<input type="number" min="1" step="1" name="lokasi_blok" required value="{{ old('lokasi_blok', $item->lokasi_blok ?? request()->query('lokasi_blok', 1)) }}">@error('lokasi_blok')<span class="field-error">{{ $message }}</span>@enderror</label>
        <label class="fld">Tinggi pohon (meter)<input type="number" step="0.01" min="0" name="tinggi_pohon" required value="{{ old('tinggi_pohon', $item->tinggi_pohon ?? 0) }}">@error('tinggi_pohon')<span class="field-error">{{ $message }}</span>@enderror</label>
        <label class="fld">Diameter pohon (cm)<input type="number" step="0.01" min="0" name="diameter_pohon" required value="{{ old('diameter_pohon', $item->diameter_pohon ?? 0) }}">@error('diameter_pohon')<span class="field-error">{{ $message }}</span>@enderror</label>
        <label class="fld">Status pertumbuhan<select name="status_pertumbuhan" required>@foreach(['Seedling', 'Growing', 'Mature', 'Dead'] as $s)<option value="{{ $s }}" @selected(old('status_pertumbuhan', $item->status_pertumbuhan ?? 'Seedling') === $s)>{{ $s }}</option>@endforeach</select></label>
        <details class="optional-coordinates full" @if(request()->filled('latitude') || request()->filled('longitude')) open @endif>
            <summary>Koordinat peta (opsional)</summary>
            <div class="coords-grid">
                <label class="fld">Latitude<input type="number" step="0.0000001" min="-90" max="90" name="latitude" value="{{ old('latitude', $item->latitude ?? request()->query('latitude')) }}" placeholder="-8.1400000"></label>
                <label class="fld">Longitude<input type="number" step="0.0000001" min="-180" max="180" name="longitude" value="{{ old('longitude', $item->longitude ?? request()->query('longitude')) }}" placeholder="113.7180000"></label>
            </div>
        </details>
    </div>
    <div class="form-actions"><button class="btn" type="submit"><i data-lucide="save"></i>Simpan tanaman</button><a class="btn ghost" href="{{ route('tanaman.index') }}">Batal</a></div>
</form></section>
@endsection
