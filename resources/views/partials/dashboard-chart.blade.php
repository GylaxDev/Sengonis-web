@php
    $values = $dataBulan->map(fn($month) => $metric === 'rupiah' ? $month['pendapatan'] - $month['pengeluaran'] : $month['mati'])->values()->all();
    $minimum = min(0, ...$values);
    $maximum = max(1, ...$values);
    $span = max(1, $maximum - $minimum);
    $count = max(1, count($values));
    $space = 480 / $count;
    $barWidth = min(38, $space * .55);
    $y = fn($n) => 16 + ($maximum - $n) / $span * 142;
    $axis = function ($n) use ($metric) {
        if ($metric !== 'rupiah') return number_format($n, 0, ',', '.');
        if (abs($n) >= 1000000) return 'Rp'.number_format($n / 1000000, 1, ',', '.').' jt';
        if (abs($n) >= 1000) return 'Rp'.number_format($n / 1000, 0, ',', '.').' rb';
        return 'Rp'.number_format($n, 0, ',', '.');
    };
    $ticks = [$maximum, ($maximum + $minimum) / 2, $minimum];
@endphp
<div class="chart-metric" role="group" aria-label="{{ $metric === 'rupiah' ? 'Grafik arus kas bersih dalam rupiah' : 'Grafik jumlah pohon mati' }}">
    <div class="chart-metric-title"><strong>{{ $metric === 'rupiah' ? 'Arus kas bersih (Rp)' : 'Pohon mati (pohon)' }}</strong></div>
    <svg class="dashboard-chart" viewBox="0 0 560 195" role="img" aria-label="Grafik {{ $metric === 'rupiah' ? 'arus kas bersih' : 'pohon mati' }} per bulan">
        @foreach($ticks as $tick)
        <line x1="67" y1="{{ $y($tick) }}" x2="550" y2="{{ $y($tick) }}" stroke="var(--line)" stroke-dasharray="3 5"/>
        <text x="57" y="{{ $y($tick) + 4 }}" text-anchor="end">{{ $axis($tick) }}</text>
        @endforeach
        <line x1="67" y1="{{ $y(0) }}" x2="550" y2="{{ $y(0) }}" stroke="var(--mut)" stroke-opacity="0.4"/>
        @foreach($dataBulan as $index => $month)
            @php
                $value = $values[$index];
                $x = 68 + $space * $index + ($space - $barWidth)/2;
                $top = min($y($value), $y(0));
                $height = max(2, abs($y(0) - $y($value)));
                $detail = $metric === 'rupiah' ? 'Rp'.number_format($value, 0, ',', '.') : number_format($value, 0, ',', '.').' pohon';
            @endphp
            <rect x="{{ $x }}" y="{{ $top }}" width="{{ $barWidth }}" height="{{ $height }}" rx="4" fill="{{ $value < 0 ? 'var(--bad)' : 'var(--acc)' }}"><title>{{ $month['label'] }}: {{ $detail }}</title></rect>
            <text x="{{ $x + $barWidth/2 }}" y="181" text-anchor="middle">{{ $month['label'] }}</text>
        @endforeach
    </svg>
</div>
