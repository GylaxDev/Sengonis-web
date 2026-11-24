@extends('layouts.app')

@section('title', 'Plant #'.$plant->id.' · Sengonis')

@section('content')
    <section class="page">
        <div class="ph">
            <h1>Plant #{{ $plant->id }}</h1>
            <p><a class="btn" href="{{ route('plants.edit', $plant) }}">Edit</a></p>
        </div>
        <div class="card">
            @foreach (['tgl' => $plant->tgl?->format('Y-m-d'), 'tinggi' => $plant->tinggi, 'dia' => $plant->dia, 'blok' => $plant->blok, 'st' => $plant->st] as $label => $value)
                <p><b>{{ ucfirst($label) }}:</b> {{ $value }}</p>
            @endforeach
        </div>
        <form method="POST" action="{{ route('plants.destroy', $plant) }}">
            @csrf
            @method('DELETE')
            <button class="btn" type="submit">Delete</button>
        </form>
    </section>
@endsection
