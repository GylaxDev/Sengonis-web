@extends('layouts.app')

@section('title', 'Finance · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Finance</h1><p>Officer drafts are validated by the owner.</p></div>
        <div class="gs">
            <div class="stat"><span class="l">Forecast income</span><b>{{ number_format($forecast['forecast']['income'] ?? 0) }}</b></div>
            <div class="stat"><span class="l">Forecast expenses</span><b>{{ number_format($forecast['forecast']['expenses'] ?? 0) }}</b></div>
        </div>
        <x-table :rows="$finances" :columns="['id' => 'ID', 'tgl' => 'Date', 'jenis' => 'Type', 'nominal' => 'Amount', 'status' => 'Status']" />
    </section>
@endsection
