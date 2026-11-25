<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>Masuk · Sengonis</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Google+Sans+Flex:wght@400..700&display=swap" rel="stylesheet">
    <link href="{{ asset('css/style.css') }}" rel="stylesheet">
    <link href="{{ asset('css/blade.css') }}" rel="stylesheet">
    <script>
        try {const a=JSON.parse(localStorage.getItem('sengonis_appearance')||'{}');for(const k of ['theme','accent','density','fs']) if(a[k]&&a[k]!=='system')document.documentElement.dataset[k]=a[k];}catch(e){}
    </script>
</head>
<body>
<div class="lg">
    <header class="lgh"><a class="brand" href="{{ route('login') }}"><span class="logo"><i data-lucide="trees"></i></span><span class="wm">sengonis</span></a><button type="button" class="ibtn" id="theme-toggle" aria-label="Ubah tema"><i data-lucide="moon"></i></button></header>
    <div class="lgb">
        <div class="lgt"><p class="eye">Sengonis is for Forest Keepers</p><h1>Menumbuhkan masa depan, satu pohon sengon setiap langkah</h1><p class="sub">Pantau tanaman, transaksi, laporan kematian, dan risiko perkebunan.</p></div>
        <div class="lgart">
            <form class="card lform" method="POST" action="{{ route('login.process') }}">@csrf
                <h2>Masuk</h2>
                <label class="fld">Username<input name="username" value="{{ old('username') }}" required autocomplete="username" autofocus></label>
                <label class="fld">Password<span class="pwf"><input name="password" id="password" type="password" required autocomplete="current-password"><button type="button" data-password-toggle="password" aria-label="Tampilkan password"><i data-lucide="eye"></i></button></span></label>
                @if($errors->any())<p class="err" role="alert">{{ $errors->first() }}</p>@endif
                <button class="btn" type="submit" style="width:100%;padding-block:13px">Masuk <i data-lucide="arrow-right"></i></button>
                <div class="demo"><span class="mut" style="font-size:.82rem;align-self:center">Demo:</span><button type="button" class="chip" data-demo-user="owner"><i data-lucide="shield-check"></i>Owner</button><button type="button" class="chip" data-demo-user="officer"><i data-lucide="hard-hat"></i>Petugas</button></div>
            </form>
            <div class="lfloat"><div class="top"><span class="pill ok">Live</span><span>Sengonis Plantation</span></div><b>{{ $jumlahHidup }} pohon hidup tercatat</b><small class="mut">{{ $jumlahBlok }} blok · Peta 3D · Cuaca</small></div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<script src="{{ asset('js/blade.js') }}"></script>
</body>
</html>
