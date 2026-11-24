@extends('layouts.app')

@section('title', 'Dashboard · Sengonis')

@section('content')
    <section class="page">
        <div class="ph">
            <h1>Welcome, {{ $username }}</h1>
            <p>Here is the current state of your plantation.</p>
        </div>
        <div class="gs">
            <div class="stat"><span class="l">Plants</span><b>{{ $plants }}</b></div>
            <div class="stat"><span class="l">Living trees</span><b>{{ $living }}</b></div>
            <div class="stat"><span class="l">Validated income</span><b>{{ number_format($income) }}</b></div>
            <div class="stat"><span class="l">Pending reports</span><b>{{ $pending }}</b></div>
        </div>
        @include('components.alert')
    </section>
@endsection
