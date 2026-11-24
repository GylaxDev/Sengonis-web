@extends('layouts.app')

@section('title', 'Home · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Sengonis</h1><p>Plantation manager · Blade page demo.</p></div>
        <div class="gs">
            @foreach (['Plants', 'Map', 'Finance', 'Reports'] as $card)
                <div class="stat">{{ $card }}</div>
            @endforeach
        </div>
    </section>
@endsection
