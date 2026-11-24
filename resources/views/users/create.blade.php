@extends('layouts.app')

@section('title', 'Add user · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Add field officer</h1></div>
        <form method="POST" action="{{ route('users.store') }}" class="card">
            @csrf
            <label class="fld">Name <input name="nama" value="{{ old('nama') }}" required></label>
            <label class="fld">Username <input name="username" value="{{ old('username') }}" required></label>
            <label class="fld">Password <input name="password" type="password" required></label>
            <label class="fld">Role <select name="role"><option>Officer</option><option>Owner</option></select></label>
            <button class="btn" type="submit">Save</button>
        </form>
    </section>
@endsection
