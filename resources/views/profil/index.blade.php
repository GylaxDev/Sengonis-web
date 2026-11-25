@extends('layouts.app')
@section('title', 'Pengaturan')
@section('content')
@php
    $tab = in_array(request('tab'), ['profile','appearance','prefs','security','data','about']) ? request('tab') : 'profile';
    $initial = mb_strtoupper(mb_substr($item->nama_pengguna, 0, 1));
    $sections = [
        ['profile','Profil','user'],
        ['appearance','Tampilan','palette'],
        ['prefs','Preferensi','sliders-horizontal'],
        ['security','Keamanan','lock'],
        ['data','Ekspor data','database'],
        ['about','Tentang','info'],
    ];
@endphp
<div class="ph"><div><h1><i data-lucide="settings"></i>Pengaturan</h1><p>Kelola profil, tampilan, dan preferensi aplikasi.</p></div></div>
<div class="setgrid">
    <nav class="setnav" aria-label="Bagian pengaturan">
        @foreach($sections as [$id, $label, $icon])
        <button type="button" data-settings-tab="{{ $id }}" aria-current="{{ $tab === $id ? 'true' : 'false' }}"><i data-lucide="{{ $icon }}"></i>{{ $label }}</button>
        @endforeach
    </nav>
    <div class="sgrp">
        <div data-settings-pane="profile" @if($tab !== 'profile') hidden @endif>
            <section class="card">
                <div class="ch-h"><h2>Profil</h2></div>
                <div class="prof">
                    <span class="av">@if($item->foto_profil)<img src="{{ $item->foto_profil }}" alt="Foto profil">@else{{ $initial }}@endif</span>
                    <div class="row">
                        <form action="{{ route('profil.foto') }}" method="POST" enctype="multipart/form-data" class="row" id="profile-photo-form">@csrf
                            <label class="btn sm ghost" for="profile-photo"><i data-lucide="camera"></i>{{ $item->foto_profil ? 'Ganti foto' : 'Tambah foto' }}</label>
                            <input id="profile-photo" type="file" name="foto_profil" accept="image/jpeg,image/png,image/webp" hidden data-auto-submit="profile-photo-form">
                        </form>
                        @if($item->foto_profil)<form method="POST" action="{{ route('profil.foto.delete') }}">@csrf @method('DELETE')<button type="submit" class="btn ghost sm"><i data-lucide="trash-2"></i>Hapus foto</button></form>@endif
                    </div>
                </div>
                <form method="POST" action="{{ route('profil.update') }}" class="col" style="margin-top:20px">@csrf @method('PUT')
                    <div class="fgrid">
                        <label class="fld">Nama lengkap<input name="nama_pengguna" required maxlength="50" value="{{ old('nama_pengguna', $item->nama_pengguna) }}"></label>
                        <label class="fld">Nomor telepon<input name="no_telepon" maxlength="15" value="{{ old('no_telepon', $item->no_telepon) }}"></label>
                        <label class="fld">Username<input value="{{ $item->username }}" disabled><small>Username diubah oleh Owner.</small></label>
                        <label class="fld">Role<input value="{{ $item->role }}" disabled></label>
                    </div>
                    <div class="row"><button type="submit" class="btn"><i data-lucide="save"></i>Simpan profil</button></div>
                </form>
            </section>
        </div>
        <div data-settings-pane="appearance" @if($tab !== 'appearance') hidden @endif>
            <section class="card">
                <div class="ch-h"><h2>Tampilan</h2></div>
                <p class="mut" style="margin-bottom:16px">Perubahan langsung diterapkan di perangkat ini.</p>
                <div class="themes" role="group" aria-label="Tema">
                    <button type="button" class="theme" data-cfg="theme:light" aria-pressed="false"><span class="tp" style="--a:#202124;--b:#20212455"><i style="background:#faf6ef"></i><i style="background:#fff"><b></b><b></b></i></span><span>Terang</span></button>
                    <button type="button" class="theme" data-cfg="theme:dark" aria-pressed="false"><span class="tp" style="--a:#f2efe8;--b:#f2efe855"><i style="background:#201e1a"></i><i style="background:#131312"><b></b><b></b></i></span><span>Gelap</span></button>
                    <button type="button" class="theme" data-cfg="theme:system" aria-pressed="false"><span class="tp" style="--a:#888;--b:#bbb"><i style="background:linear-gradient(90deg,#faf6ef 50%,#201e1a 50%)"></i><i style="background:linear-gradient(90deg,#fff 50%,#131312 50%)"><b></b><b></b></i></span><span>Ikuti sistem</span></button>
                </div>
                <div class="srow"><div><b>Warna aksen</b><small>Tombol, grafik, dan penanda.</small></div><div class="sctl sws">
                    @foreach(['yellow'=>'#fbc315','green'=>'#3fa564','blue'=>'#4a90b8','rose'=>'#d4568b'] as $key=>$hex)<button type="button" data-cfg="accent:{{ $key }}" style="background:{{ $hex }}" aria-label="Warna {{ $key }}" aria-pressed="false"><i data-lucide="check"></i></button>@endforeach
                </div></div>
                <div class="srow"><div><b>Kepadatan</b><small>Lebih rapat untuk menampilkan lebih banyak data.</small></div><div class="sctl seg"><button type="button" data-cfg="density:comfortable" aria-pressed="false">Normal</button><button type="button" data-cfg="density:compact" aria-pressed="false">Ringkas</button></div></div>
                <div class="srow"><div><b>Ukuran teks</b></div><div class="sctl seg"><button type="button" data-cfg="fs:sm" aria-pressed="false">Kecil</button><button type="button" data-cfg="fs:md" aria-pressed="false">Normal</button><button type="button" data-cfg="fs:lg" aria-pressed="false">Besar</button></div></div>
                <div class="srow"><div><b>Sidebar</b><small>Bisa juga diubah melalui tombol menu di kiri atas.</small></div><div class="sctl seg"><button type="button" data-cfg="sidebar:full" aria-pressed="false">Penuh</button><button type="button" data-cfg="sidebar:mini" aria-pressed="false">Ikon saja</button></div></div>
                <div class="srow"><div><b>Animasi</b></div><div class="sctl"><label class="sw"><input type="checkbox" data-setting-value="motion" checked><span></span></label></div></div>
            </section>
        </div>
        <div data-settings-pane="prefs" @if($tab !== 'prefs') hidden @endif>
            <section class="card"><div class="ch-h"><h2>Preferensi</h2></div>
                <div class="srow"><div><b>Periode tren dashboard</b><small>Pilih rentang untuk grafik.</small></div><div class="sctl"><a class="btn ghost sm" href="{{ route('dashboard',['periode'=>3]) }}">3 bulan</a><a class="btn ghost sm" href="{{ route('dashboard',['periode'=>6]) }}">6 bulan</a><a class="btn ghost sm" href="{{ route('dashboard',['periode'=>12]) }}">12 bulan</a></div></div>
                <div class="srow"><div><b>Navigasi</b><small>Gunakan sidebar untuk mengakses halaman.</small></div><div class="sctl"><button type="button" class="btn ghost sm" data-cfg="sidebar:mini">Ikon saja</button><button type="button" class="btn ghost sm" data-cfg="sidebar:full">Diperluas</button></div></div>
            </section>
        </div>
        <div data-settings-pane="security" @if($tab !== 'security') hidden @endif>
            <section class="card"><div class="ch-h"><h2>Ganti password</h2></div>
                <form method="POST" action="{{ route('profil.update') }}" class="col">@csrf @method('PUT')
                    <input type="hidden" name="nama_pengguna" value="{{ $item->nama_pengguna }}">
                    <div class="fgrid">
                        <label class="fld">Password lama<input type="password" name="password_lama" required autocomplete="current-password"></label>
                        <label class="fld">Password baru<input type="password" name="password_baru" required minlength="8" autocomplete="new-password"></label>
                        <label class="fld">Konfirmasi password<input type="password" name="password_baru_confirmation" required minlength="8" autocomplete="new-password"></label>
                    </div><div class="row"><button type="submit" class="btn"><i data-lucide="lock"></i>Perbarui password</button></div>
                </form>
            </section>
        </div>
        <div data-settings-pane="data" @if($tab !== 'data') hidden @endif>
            <section class="card"><div class="ch-h"><h2>Ekspor data CSV</h2></div>
                <div class="row">
                    <a class="btn ghost" href="{{ route('export','tanaman') }}"><i data-lucide="download"></i>Tanaman</a>
                    <a class="btn ghost" href="{{ route('export','keuangan') }}"><i data-lucide="download"></i>Keuangan</a>
                    <a class="btn ghost" href="{{ route('export','laporan-keuangan') }}"><i data-lucide="download"></i>Laporan keuangan</a>
                    <a class="btn ghost" href="{{ route('export','laporan-kematian') }}"><i data-lucide="download"></i>Laporan kematian</a>
                </div>
            </section>
        </div>
        <div data-settings-pane="about" @if($tab !== 'about') hidden @endif>
            <section class="card"><div class="ch-h"><h2>Tentang Sengonis</h2></div>
                <dl class="kv"><dt>Aplikasi</dt><dd>Sengonis Plantation Manager</dd><dt>Peta</dt><dd>MapLibre · OpenFreeMap · OpenStreetMap</dd><dt>Cuaca</dt><dd>Open-Meteo</dd><dt>Prediksi</dt><dd>Random Forest Regression</dd></dl>
            </section>
        </div>
    </div>
</div>
@endsection
