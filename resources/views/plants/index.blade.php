@extends('layouts.app')

@section('title', 'Plants · Sengonis')

@section('content')
    <section class="page">
        <div class="ph">
            <h1>Plants</h1>
            <p><a class="btn" href="{{ route('plants.create') }}">Add plant</a></p>
        </div>
        <x-table :rows="$plants" :columns="['id' => 'ID', 'tgl' => 'Planted', 'tinggi' => 'Height', 'dia' => 'Diameter', 'blok' => 'Block', 'st' => 'Status']" />
    </section>
@endsection
