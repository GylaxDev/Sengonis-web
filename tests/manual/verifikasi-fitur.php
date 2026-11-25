<?php
/** Jalan tanpa Composer: php tests/manual/verifikasi-fitur.php */
require __DIR__.'/../../app/Services/GeometriPeta.php';
require __DIR__.'/../../app/Services/RandomForestRegressor.php';

use App\Services\GeometriPeta;
use App\Services\RandomForestRegressor;

function check(bool $value, string $message): void {
    if (!$value) throw new RuntimeException('GAGAL: '.$message);
    echo "OK: {$message}\n";
}

$geo = new GeometriPeta();
$blocks = $geo->blokAwal(-8.14, 113.718);
check(count($blocks) === 4, '4 poligon blok demo terbuat');
foreach ($blocks as $block) {
    $ring = $geo->validateRing($block['koordinat']);
    $center = [array_sum(array_column($ring, 0)) / 4, array_sum(array_column($ring, 1)) / 4];
    check($geo->diDalam($center, $ring), 'pusat berada dalam blok '.$block['nomor_blok']);
}
$from = [113.718, -8.14]; $to = [110.7, -7.6];
$moved = $geo->translasi($from, $from, $to);
check(abs($moved[0] - $to[0]) < 0.00000001 && abs($moved[1] - $to[1]) < 0.00000001, 'relokasi pusat kebun konsisten');
try {
    $geo->validateRing([[0,0],[2,2],[0,2],[2,0]]);
    throw new RuntimeException('GAGAL: poligon bersilangan diterima');
} catch (InvalidArgumentException $e) {
    echo "OK: poligon saling berpotongan ditolak\n";
}

// Data uji sintetik: dua rezim tingkat risiko. Harus bisa dipelajari dan konsisten.
$x=[];$y=[];
for ($i=0;$i<60;$i++) {
    $risk=$i%2;
    $x[]=[(float) ($risk * 5), (float) (1 + $risk * 10), (float) (1 + (1-$risk) * 3), (float) ($risk * 4)];
    $y[]=$risk ? 9000000 : 300000;
}
$rf=new RandomForestRegressor(50,5,2,7);
$low=$rf->predict($x,$y,[0,1,4,0]);
$high=$rf->predict($x,$y,[5,11,1,4]);
check($high>$low+5000000, 'Random Forest belajar pola risiko dan memberi nilai berbeda');
check($high === $rf->predict($x,$y,[5,11,1,4]), 'hasil model deterministik dengan seed tetap');
check($low >= 0, 'prediksi risiko tidak negatif');
echo 'SEMUA PEMERIKSAAN DASAR LULUS'.PHP_EOL;
