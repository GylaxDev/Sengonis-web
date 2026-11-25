<?php

namespace App\Services;

use InvalidArgumentException;

class GeometriPeta
{
    /** Empat blok demo dari prototipe: 90 x 70 m dengan jalan setapak 8 m. */
    public function blokAwal(float $latitude, float $longitude): array
    {
        $result = [];
        for ($i = 0; $i < 4; $i++) {
            $x0 = $i % 2 ? 4.0 : -94.0;
            $y0 = $i >= 2 ? -74.0 : 4.0;
            $ring = [
                $this->geser([$longitude, $latitude], $x0, $y0 + 70),
                $this->geser([$longitude, $latitude], $x0 + 90, $y0 + 70),
                $this->geser([$longitude, $latitude], $x0 + 90, $y0),
                $this->geser([$longitude, $latitude], $x0, $y0),
            ];
            $result[] = ['nomor_blok' => $i + 1, 'koordinat' => $ring];
        }
        return $result;
    }

    public function geser(array $point, float $meterX, float $meterY): array
    {
        $meterPerLongitude = max(1, 111320 * cos(deg2rad((float) $point[1])));
        return [
            round((float) $point[0] + $meterX / $meterPerLongitude, 7),
            round((float) $point[1] + $meterY / 110574, 7),
        ];
    }

    /** Mengubah koordinat relatif pusat lama ke pusat baru. */
    public function translasi(array $point, array $pusatLama, array $pusatBaru): array
    {
        $meterX = ((float) $point[0] - (float) $pusatLama[0]) * 111320 * cos(deg2rad((float) $pusatLama[1]));
        $meterY = ((float) $point[1] - (float) $pusatLama[1]) * 110574;
        return $this->geser($pusatBaru, $meterX, $meterY);
    }

    public function pusat(array $blocks): array
    {
        $points = [];
        foreach ($blocks as $block) {
            foreach ($block['koordinat'] ?? [] as $point) {
                $points[] = $point;
            }
        }
        if ($points === []) {
            return [(float) config('sengonis.center_lng'), (float) config('sengonis.center_lat')];
        }
        return [array_sum(array_column($points, 0)) / count($points), array_sum(array_column($points, 1)) / count($points)];
    }

    /** Algoritma ray-casting, cocok untuk titik tanaman di blok poligon sederhana. */
    public function diDalam(array $point, array $ring): bool
    {
        $inside = false;
        $n = count($ring);
        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $a = $ring[$i];
            $b = $ring[$j];
            if (($a[1] > $point[1]) !== ($b[1] > $point[1])) {
                $x = ($b[0] - $a[0]) * ($point[1] - $a[1]) / ($b[1] - $a[1]) + $a[0];
                if ($point[0] < $x) {
                    $inside = ! $inside;
                }
            }
        }
        return $inside;
    }

    public function validateRing(mixed $ring): array
    {
        if (! is_array($ring) || count($ring) < 3 || count($ring) > 100) {
            throw new InvalidArgumentException('Poligon harus memiliki 3–100 titik.');
        }
        $clean = [];
        foreach ($ring as $point) {
            if (! is_array($point) || count($point) !== 2 || !is_numeric($point[0] ?? null) || !is_numeric($point[1] ?? null)) {
                throw new InvalidArgumentException('Setiap titik harus berupa [longitude, latitude].');
            }
            $lng = (float) $point[0];
            $lat = (float) $point[1];
            if (!is_finite($lng) || !is_finite($lat) || abs($lng) > 180 || abs($lat) > 90) {
                throw new InvalidArgumentException('Koordinat di luar rentang yang valid.');
            }
            $clean[] = [round($lng, 7), round($lat, 7)];
        }
        if ($clean[0] === end($clean)) array_pop($clean);
        if (count($clean) < 3 || count(array_unique(array_map('json_encode', $clean))) < 3) {
            throw new InvalidArgumentException('Blok harus mempunyai minimal tiga titik berbeda.');
        }
        // Cegah poligon degenerate dengan luas proyeksi mendekati nol.
        $area = 0;
        $origin = $clean[0];
        for ($i = 0; $i < count($clean); $i++) {
            $a = $clean[$i]; $b = $clean[($i + 1) % count($clean)];
            $area += ($a[0] - $origin[0]) * ($b[1] - $origin[1]) - ($b[0] - $origin[0]) * ($a[1] - $origin[1]);
        }
        if (abs($area) < 1e-12) throw new InvalidArgumentException('Poligon tidak memiliki luas yang memadai.');
        // Cegah segmen berpotongan sendiri (bow-tie polygon).
        $n = count($clean);
        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 2; $j < $n; $j++) {
                if ($i === 0 && $j === $n - 1) continue;
                if ($this->intersects($clean[$i], $clean[($i + 1) % $n], $clean[$j], $clean[($j + 1) % $n])) {
                    throw new InvalidArgumentException('Garis batas blok tidak boleh saling berpotongan.');
                }
            }
        }
        return $clean;
    }

    private function intersects(array $a, array $b, array $c, array $d): bool
    {
        $cross = static fn ($p, $q, $r) => ($q[0] - $p[0]) * ($r[1] - $p[1]) - ($q[1] - $p[1]) * ($r[0] - $p[0]);
        $u = $cross($a, $b, $c);
        $v = $cross($a, $b, $d);
        $w = $cross($c, $d, $a);
        $x = $cross($c, $d, $b);
        return (($u > 0 && $v < 0) || ($u < 0 && $v > 0)) && (($w > 0 && $x < 0) || ($w < 0 && $x > 0));
    }
}
