@extends('layouts.app')

@section('title', 'Weather · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Weather</h1><p>Live data is loaded by the weather module.</p></div>
        <div id="weather-cards" class="gs"></div>
    </section>
@endsection
