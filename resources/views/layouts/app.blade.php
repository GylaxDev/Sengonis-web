<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#ffffff">
    <title>@yield('title', 'Sengonis')</title>
    <base href="{{ asset('/') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/app.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
    @stack('head')
</head>
<body>
    <div id="app">
        <div class="shell">
            <x-sidebar />
            <div class="body">
                <x-navbar :username="$username ?? null" />
                <main class="main" id="main">
                    <div class="wrap">
                        @include('components.alert')
                        @yield('content')
                    </div>
                </main>
            </div>
        </div>
    </div>
    <div id="m"></div>
    <div id="pal"></div>
    <div id="toasts" class="toasts" role="status" aria-live="polite"></div>
    <script type="module" src="{{ asset('assets/js/app.js') }}"></script>
    @stack('scripts')
</body>
</html>
