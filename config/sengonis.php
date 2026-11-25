<?php

return [
    // Koordinat awal sama dengan prototipe HTML. Atur melalui .env sesuai lokasi kebun.
    'center_lat' => (float) env('KEBUN_LATITUDE', -8.14),
    'center_lng' => (float) env('KEBUN_LONGITUDE', 113.718),
    'biaya_pohon_mati' => (int) env('BIAYA_POHON_MATI', 45000),
    'ambang_hujan_mm' => (float) env('AMBANG_HUJAN_MM', 60),
    'ambang_panas_c' => (float) env('AMBANG_PANAS_C', 33),
];
