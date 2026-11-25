<<<<<<< HEAD
# Sengonis · Plantation manager (V2)

Static SPA dengan struktur Model–View–Controller berbasis ES modules. Tanpa build step.

## Menjalankan

```bash
npx serve -s .        # disarankan: fallback ke index.html untuk deep link
# atau
python3 -m http.server 8000   # hanya untuk /, deep link belum difallback
```

Buka `http://localhost:3000` (atau port yang dipakai).

## Struktur

```
index.html
css/style.css
js/
  main.js              entry point
  core/                config, utils, icons, devtools bridge
  model/               state + logic data (auth, store, plants, weather, ...)
  view/                markup/template per halaman dan komponen
  controller/          aksi, event, router, settings, map, session, ...
```

## Routing

Navigasi disinkronkan ke URL memakai History API:

- `/` atau `/home` → dashboard
- `/plants`, `/map`, `/inventory`, `/reports`, `/users`, `/settings`
- Query opsional: `?q=` (pencarian), `?section=` (settings), `?tab=` dan `?arch=1` (reports)

Deep link dan tombol back/forward didukung. `vercel.json` sudah meneruskan semua path ke `index.html`.

Data demo dan preferensi disimpan di `localStorage`; tidak ada backend/database.
=======
# Sengonis
>>>>>>> b10d52b (fix)
