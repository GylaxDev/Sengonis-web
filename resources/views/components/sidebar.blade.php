<aside class="sb" aria-label="Main navigation">
    <div class="sbtop">
        <button class="ibtn plain" data-a="nav" aria-label="Toggle sidebar">☰</button>
        <a class="brand" href="{{ route('home') }}"><span class="wm">sengonis</span></a>
    </div>
    <nav class="nav">
        @foreach ([['home', 'Home'], ['plants', 'Plants'], ['map', 'Map'], ['inventory', 'Inventory'], ['reports', 'Reports'], ['users', 'Users'], ['settings', 'Settings']] as [$view, $label])
            <button data-a="go" data-i="{{ $view }}" @class(['active' => request()->is($view)])>{{ $label }}</button>
        @endforeach
    </nav>
    <div class="sbfoot"><b>Sengonis</b><span>Plantation manager</span></div>
</aside>
