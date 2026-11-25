<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#ffffff">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') · Sengonis</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&family=Google+Sans+Flex:wght@400..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/blade.css') }}">
    @stack('styles')
    <script>
    try {
        const options=JSON.parse(localStorage.getItem('sengonis_appearance')||'{}');
        for(const key of ['theme','accent','density','fs']) if(options[key] && options[key]!=='system') document.documentElement.dataset[key]=options[key];
    }catch(e){}
    </script>
</head>
<body>
@php
    $owner = auth()->user()->isOwner();
    $profile = auth()->user();
    $initials = mb_strtoupper(mb_substr($profile->nama_pengguna, 0, 1));
    $waiting = $shellSummary['keuangan'] + $shellSummary['laporan'] + $shellSummary['kematian'];
@endphp
<div class="shell" id="app-shell">
    <aside class="sb" aria-label="Navigasi utama">
        <div class="sbtop">
            <button type="button" class="ibtn plain" data-menu-toggle aria-label="Ubah ukuran sidebar" aria-expanded="true"><i data-lucide="menu"></i></button>
            <a class="brand" href="{{ route('dashboard') }}"><span class="logo"><i data-lucide="trees"></i></span><span class="wm">sengonis</span></a>
        </div>
        <div class="create pw">
            <button type="button" class="btn" data-pop-toggle="menu-create" aria-expanded="false"><i data-lucide="plus"></i><span class="lbl">Tambah</span></button>
            <div id="menu-create" class="pop createmenu l" hidden>
                <a class="pi" href="{{ route('tanaman.create') }}" data-modal-url="{{ route('tanaman.create') }}"><span class="dot"><i data-lucide="sprout"></i></span><span><b>Tambah tanaman</b><small>Catat pohon baru</small></span></a>
                @if($owner)
                <a class="pi" href="{{ route('pengguna.create') }}"><span class="dot"><i data-lucide="user-plus"></i></span><span><b>Tambah petugas</b><small>Buat akun baru</small></span></a>
                <a class="pi" href="{{ route('peta.index', ['mode'=>'add-block']) }}"><span class="dot"><i data-lucide="map"></i></span><span><b>Tambah blok</b><small>Gambar batas di peta</small></span></a>
                @else
                <a class="pi" href="{{ route('keuangan.create') }}"><span class="dot"><i data-lucide="receipt"></i></span><span><b>Tambah transaksi</b><small>Catat pemasukan atau biaya</small></span></a>
                <a class="pi" href="{{ route('laporan-keuangan.create') }}"><span class="dot"><i data-lucide="file-text"></i></span><span><b>Laporan keuangan</b><small>Catatan bulanan</small></span></a>
                <a class="pi" href="{{ route('laporan-kematian.create') }}"><span class="dot"><i data-lucide="triangle-alert"></i></span><span><b>Laporan kematian</b><small>Catat pohon mati</small></span></a>
                @endif
            </div>
        </div>
        <nav class="nav">
            <a href="{{ route('dashboard') }}" @if(request()->routeIs('dashboard')) aria-current="page" @endif title="Dashboard"><i data-lucide="house"></i><span class="lbl">Dashboard</span></a>
            <a href="{{ route('tanaman.index') }}" @if(request()->routeIs('tanaman.*')) aria-current="page" @endif title="Tanaman"><i data-lucide="sprout"></i><span class="lbl">Tanaman</span></a>
            <a href="{{ route('peta.index') }}" @if(request()->routeIs('peta.*')) aria-current="page" @endif title="Peta"><i data-lucide="map"></i><span class="lbl">Peta</span></a>
            <a href="{{ route('keuangan.index') }}" @if(request()->routeIs('keuangan.*')) aria-current="page" @endif title="Keuangan"><i data-lucide="wallet"></i><span class="lbl">Keuangan</span>@if($owner && $shellSummary['keuangan'])<span class="cnt">{{ $shellSummary['keuangan'] }}</span>@endif</a>
            <a href="{{ route('laporan-keuangan.index') }}" @if(request()->routeIs('laporan-keuangan.*')) aria-current="page" @endif title="Laporan Keuangan"><i data-lucide="file-text"></i><span class="lbl">Laporan Keuangan</span>@if($owner && $shellSummary['laporan'])<span class="cnt">{{ $shellSummary['laporan'] }}</span>@endif</a>
            <a href="{{ route('laporan-kematian.index') }}" @if(request()->routeIs('laporan-kematian.*')) aria-current="page" @endif title="Laporan Kematian"><i data-lucide="triangle-alert"></i><span class="lbl">Laporan Kematian</span>@if($owner && $shellSummary['kematian'])<span class="cnt">{{ $shellSummary['kematian'] }}</span>@endif</a>
            <a href="{{ route('prediksi.index') }}" @if(request()->routeIs('prediksi.*')) aria-current="page" @endif title="Prediksi"><i data-lucide="trending-up"></i><span class="lbl">Prediksi</span></a>
            @if($owner)
            <a href="{{ route('pengguna.index') }}" @if(request()->routeIs('pengguna.*')) aria-current="page" @endif title="Pengguna"><i data-lucide="users"></i><span class="lbl">Pengguna</span></a>
            @endif
            <hr>
            <a href="{{ route('profil.index') }}" @if(request()->routeIs('profil.*')) aria-current="page" @endif title="Pengaturan"><i data-lucide="settings"></i><span class="lbl">Pengaturan</span></a>
        </nav>
        <div class="sbfoot"><b>Sengonis Plantation</b><span>{{ $shellSummary['hidup'] }} pohon hidup · {{ $shellSummary['blok'] }} blok</span></div>
    </aside>
    <div class="scrim" data-menu-toggle></div>
    <div class="body">
        <header class="topbar">
            <button class="ibtn plain menubtn" type="button" data-menu-toggle aria-label="Buka menu"><i data-lucide="menu"></i></button>
            <form class="spill" action="{{ route('tanaman.index') }}" method="GET" role="search">
                <i data-lucide="search"></i><input name="q" placeholder="Cari tanaman atau blok" aria-label="Cari tanaman" autocomplete="off"><kbd>Enter</kbd>
            </form>
            <div class="sp"></div>
            <button class="ibtn tm" id="theme-toggle" type="button" aria-label="Ubah tema"><i data-lucide="moon"></i></button>
            <div class="pw" id="bell">
                <button class="ibtn" type="button" data-pop-toggle="menu-notification" aria-label="Notifikasi" aria-expanded="false"><i data-lucide="bell"></i>@if($waiting)<span class="badge">{{ $waiting }}</span>@endif</button>
                <div class="pop" id="menu-notification" hidden>
                    <h4>NOTIFIKASI</h4>
                    @if($shellSummary['keuangan'])<a class="pi" href="{{ route('keuangan.index', ['status'=>'Pending validation']) }}"><span class="dot"><i data-lucide="receipt"></i></span><span><b>{{ $shellSummary['keuangan'] }} transaksi</b><small>{{ $owner ? 'Perlu divalidasi' : 'Menunggu validasi' }}</small></span></a>@endif
                    @if($shellSummary['laporan'])<a class="pi" href="{{ route('laporan-keuangan.index') }}"><span class="dot"><i data-lucide="file-text"></i></span><span><b>{{ $shellSummary['laporan'] }} laporan keuangan</b><small>{{ $owner ? 'Perlu diverifikasi' : 'Menunggu verifikasi' }}</small></span></a>@endif
                    @if($shellSummary['kematian'])<a class="pi" href="{{ route('laporan-kematian.index') }}"><span class="dot"><i data-lucide="triangle-alert"></i></span><span><b>{{ $shellSummary['kematian'] }} laporan kematian</b><small>{{ $owner ? 'Perlu diverifikasi' : 'Menunggu verifikasi' }}</small></span></a>@endif
                    @unless($waiting)<div class="empty">Belum ada notifikasi.</div>@endunless
                </div>
            </div>
            <div class="pw">
                <button class="avbtn" type="button" data-pop-toggle="menu-account" aria-label="Akun {{ $profile->nama_pengguna }}" aria-expanded="false">
                    @if($profile->foto_profil)<img src="{{ $profile->foto_profil }}" alt="Foto profil">@else{{ $initials }}@endif
                </button>
                <div class="pop" id="menu-account" hidden>
                    <div class="who"><span class="av">@if($profile->foto_profil)<img src="{{ $profile->foto_profil }}" alt="">@else{{ $initials }}@endif</span><div><b>{{ $profile->nama_pengguna }}</b><small>{{ $profile->role }}</small></div></div>
                    <hr>
                    <a class="pi" href="{{ route('profil.index') }}"><i data-lucide="settings"></i><span>Pengaturan</span></a>
                    <form method="POST" action="{{ route('logout') }}">@csrf<button type="submit" class="pi"><i data-lucide="log-out"></i><span>Keluar</span></button></form>
                </div>
            </div>
        </header>
        <main class="main"><div class="wrap">
            @if(session('success'))<div class="alert success" role="status"><i data-lucide="circle-check"></i><span>{{ session('success') }}</span></div>@endif
            @if(session('error'))<div class="alert error" role="alert"><i data-lucide="circle-alert"></i><span>{{ session('error') }}</span></div>@endif
            @if($errors->any())<div class="alert error" role="alert"><i data-lucide="circle-alert"></i><div><b>Periksa kembali input:</b><ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div></div>@endif
            @yield('content')
        </div></main>
    </div>
</div>
<div id="sengonis-modal" aria-live="polite"></div>
<script src="https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<script src="{{ asset('js/blade.js') }}"></script>
@stack('scripts')
</body>
</html>
