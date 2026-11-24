@extends('layouts.app')

@section('title', 'Add plant · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Add plant</h1></div>
        <form method="POST" action="{{ route('plants.store') }}" class="card">
            @csrf
            <label class="fld">Planted <input type="date" name="tgl" value="{{ old('tgl', date('Y-m-d')) }}" required></label>
            <label class="fld">Height <input type="number" step="0.1" name="tinggi" value="{{ old('tinggi', 0) }}" required></label>
            <label class="fld">Diameter <input type="number" step="0.1" name="dia" value="{{ old('dia', 0) }}" required></label>
            <label class="fld">Block <input type="number" name="blok" value="{{ old('blok', 1) }}" required></label>
            <label class="fld">Status <input name="st" value="{{ old('st', 'Seedling') }}" required></label>
            <button class="btn" type="submit">Save</button>
        </form>
    </section>
@endsection
