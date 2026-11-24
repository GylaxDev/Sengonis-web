@extends('layouts.app')

@section('title', 'Sign in · Sengonis')

@section('content')
    <section class="auth">
        <h1>Sign in to Sengonis</h1>
        <p class="sub">Use the demo accounts: owner / owner123 or officer / officer123.</p>
        <form method="POST" action="{{ route('login.submit') }}">
            @csrf
            <label class="fld">Username <input name="u" value="{{ old('u') }}" required autofocus></label>
            <label class="fld">Password <input name="p" type="password" required></label>
            <label><input type="checkbox" name="remember" value="1"> Remember me</label>
            <button class="btn" type="submit">Sign in</button>
        </form>
    </section>
@endsection
