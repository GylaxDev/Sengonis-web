@extends('layouts.app')

@section('title', 'Edit user · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Edit user #{{ $user->id }}</h1></div>
        <form method="POST" action="{{ route('users.update', $user) }}" class="card">
            @csrf
            @method('PUT')
            <label class="fld">Name <input name="nama" value="{{ old('nama', $user->nama) }}" required></label>
            <label class="fld">Username <input name="username" value="{{ old('username', $user->username) }}" required></label>
            <label class="fld">Password <input name="password" type="password" placeholder="Leave blank to keep"></label>
            <label class="fld">Role <select name="role"><option @selected($user->role === 'Officer')>Officer</option><option @selected($user->role === 'Owner')>Owner</option></select></label>
            <button class="btn" type="submit">Save</button>
        </form>
    </section>
@endsection
