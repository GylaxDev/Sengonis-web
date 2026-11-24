@extends('layouts.app')

@section('title', 'Edit plant · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Edit plant #{{ $plant->id }}</h1></div>
        <form method="POST" action="{{ route('plants.update', $plant) }}" class="card">
            @csrf
            @method('PUT')
            <label class="fld">Planted <input type="date" name="tgl" value="{{ old('tgl', $plant->tgl?->format('Y-m-d')) }}" required></label>
            <label class="fld">Height <input type="number" step="0.1" name="tinggi" value="{{ old('tinggi', $plant->tinggi) }}" required></label>
            <label class="fld">Diameter <input type="number" step="0.1" name="dia" value="{{ old('dia', $plant->dia) }}" required></label>
            <label class="fld">Block <input type="number" name="blok" value="{{ old('blok', $plant->blok) }}" required></label>
            <label class="fld">Status <input name="st" value="{{ old('st', $plant->st) }}" required></label>
            <button class="btn" type="submit">Save</button>
        </form>
    </section>
@endsection
