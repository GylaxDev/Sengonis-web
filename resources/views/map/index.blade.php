@extends('layouts.app')

@section('title', 'Map · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Map</h1><p>{{ $blocks->count() }} mapped blocks.</p></div>
        <div id="map" class="map"></div>
        <ul>
            @foreach ($blocks as $block)
                <li>Block {{ $block->nomor }}</li>
            @endforeach
        </ul>
    </section>
@endsection
