@extends('layouts.app')

@section('title', 'Profile · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Profile</h1><p>Signed in as {{ $username }}.</p></div>
        <div class="card">
            @foreach (['nama' => $user?->nama, 'username' => $user?->username, 'role' => $user?->role] as $label => $value)
                <p><b>{{ ucfirst($label) }}:</b> {{ $value ?? $username }}</p>
            @endforeach
        </div>
    </section>
@endsection
