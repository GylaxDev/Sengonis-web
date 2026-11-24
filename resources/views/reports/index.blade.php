@extends('layouts.app')

@section('title', 'Reports · Sengonis')

@section('content')
    <section class="page">
        <div class="ph"><h1>Reports</h1><p>{{ $tab === 'dead' ? 'Mortality' : 'Financial' }} reports.</p></div>
        <div class="gs">
            <div class="stat"><span class="l">Income</span><b>{{ number_format($summary['income']) }}</b></div>
            <div class="stat"><span class="l">Expenses</span><b>{{ number_format($summary['expenses']) }}</b></div>
        </div>
        <x-table :rows="$tab === 'dead' ? $mortality : $financial" :columns="['id' => 'ID', 'periode' => 'Period', 'tgl' => 'Date', 'masuk' => 'Income', 'keluar' => 'Expenses', 'jumlah' => 'Dead', 'status' => 'Status']" />
    </section>
@endsection
