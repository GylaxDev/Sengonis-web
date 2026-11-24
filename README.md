# Sengonis · Plantation manager (V2)

Versi ini adalah **migrasi bertahap** dari SPA statis ke Laravel + Blade. SPA
tetap berjalan utuh; sisi Laravel (routing, controller, model, service, request,
migration, seeder, dan view Blade) ditambahkan di atasnya tanpa menghapus fitur.

## Struktur singkat

```text
app/
├── Http/
│   ├── Controllers/     # Auth, Dashboard, Page, Plant, Weather, Map, Finance,
│   │                    # Inventory, Report, User, Settings
│   ├── Middleware/      # EnsureOwner
│   └── Requests/        # StorePlantRequest, UpdatePlantRequest, ...
├── Models/              # User, Plant, Weather, Finance, Inventory, Report, MapBlock
└── Services/            # WeatherService, ForecastService, ReportService
bootstrap/
config/
database/
├── migrations/
├── seeders/
└── factories/
public/
├── assets/
│   ├── forest.jpg
│   ├── css -> ../../resources/css   # symlink
│   └── js  -> ../../resources/js    # symlink
├── index.html            # entri SPA statis
└── index.php             # entri Laravel
resources/
├── css/app.css
├── js/
│   ├── app.js
│   ├── core/             # config, utils, icons, devtools
│   ├── modules/          # auth, store, actions/, router, map, weather, ...
│   └── views/            # layout, components, pages, table, theme, ...
└── views/
    ├── layouts/app.blade.php
    ├── components/       # sidebar, navbar, table, alert
    ├── auth/login.blade.php
    ├── dashboard/        # index, profile
    ├── plants/           # index, create, edit, show
    ├── weather/ map/ finance/ inventory/ reports/ users/ settings/
    └── home.blade.php
routes/
├── web.php
└── api.php
tests/
vercel.json
```

## Menjalankan SPA statis

Tidak perlu PHP. Jalankan server dengan fallback ke `public/index.html`:

```bash
npx serve -s public
# atau server lokal yang sudah dipakai saat debugging:
node /tmp/opencode/serve-spa.mjs   # root = .../V2/public
```

Buka `http://localhost:3000`. Deep link seperti `/settings?section=appearance`
tetap bekerja karena `public/index.html` menghitung `<base>` secara sinkron.

## Menjalankan Laravel

PHP dan Composer tidak terinstall di mesin ini, jadi gunakan image Docker
`composer:2` (sudah berisi PHP 8.5):

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app composer:2 \
  php artisan migrate:fresh --seed --force

docker run --rm --network host -u $(id -u):$(id -g) -v "$PWD":/app -w /app composer:2 \
  php artisan serve --host 127.0.0.1 --port 8000
```

Jika PHP/Composer sudah tersedia lokal, perintahnya biasa:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

Buka `http://127.0.0.1:8000`. Akun demo: `owner` / `owner123` dan
`officer` / `officer123`.

## Blade + UTS

Potongan yang diminta UTS sudah tersedia:

- `routes/web.php` berisi route web dan grup `owner`.
- `app/Http/Controllers/PageController.php` untuk halaman Blade sederhana.
- `resources/views/layouts/app.blade.php` memakai `@yield`, `@include`, dan
  komponen `<x-sidebar />`, `<x-navbar />`.
- View `dashboard/index`, `dashboard/profile`, `plants/*`, `home`, `settings`
  memakai `@extends`, `@section`, dan `@foreach`.
- `DashboardController@index` dan `@profile` menerima `username` dari
  `Request` (`/?username=andi`, `/profile?username=andi`).

Contoh rute Blade tanpa login: `/pages/home`, `/pages/dashboard?username=andi`,
`/pages/profile?username=andi`, `/pages/settings`.

## Pengujian

```bash
# Laravel (PHPUnit)
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app composer:2 \
  php artisan test

# SPA (Butuh Chrome + CDP di port 9222)
node /tmp/opencode/full-audit.mjs     # 58 checks
node /tmp/opencode/crud-audit.mjs     # 14 checks
```

Status terakhir: Laravel 9 test passed, SPA 58/58 + CRUD 14/14 passed.
