@extends('layouts.app')

@section('title', 'Settings · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Settings</h1><p>Current section: {{ $section }}.</p></div>
        <div class="gs">
            @foreach (['general', 'appearance', 'plantation', 'account'] as $item)
                <a class="stat" href="{{ route('settings.index', ['section' => $item]) }}">{{ ucfirst($item) }}</a>
            @endforeach
        </div>
    </section>
@endsection
