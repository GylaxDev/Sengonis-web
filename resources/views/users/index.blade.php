@extends('layouts.app')

@section('title', 'Users · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Users</h1><p><a class="btn" href="{{ route('users.create') }}">Add field officer</a></p></div>
        <x-table :rows="$users" :columns="['id' => 'ID', 'nama' => 'Name', 'username' => 'Username', 'role' => 'Role', 'aktif' => 'Active']" />
    </section>
@endsection
