@extends('layouts.app')

@section('title', 'Inventory · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Inventory</h1></div>
        <x-table :rows="$items" :columns="['id' => 'ID', 'nama' => 'Item', 'jumlah' => 'Qty', 'satuan' => 'Unit', 'keterangan' => 'Note']" />
    </section>
@endsection
