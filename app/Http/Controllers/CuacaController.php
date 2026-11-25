<?php

namespace App\Http\Controllers;

use App\Models\BlokPeta;
use App\Services\GeometriPeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class CuacaController extends Controller
{
    public function index(GeometriPeta $geo): JsonResponse
    {
        $blocks = BlokPeta::query()->get()->map(fn ($b) => ['koordinat' => $b->koordinat])->all();
        [$lon, $lat] = $geo->pusat($blocks);
        $lat = round($lat, 4);
        $lon = round($lon, 4);
        $key = 'sengonis:cuaca:'.sprintf('%.4f:%.4f', $lat, $lon);

        try {
            $result = Cache::remember($key, now()->addMinutes(15), function () use ($lat, $lon) {
                $response = Http::acceptJson()->timeout(10)->get('https://api.open-meteo.com/v1/forecast', [
                    'latitude' => $lat,
                    'longitude' => $lon,
                    'current' => 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day',
                    'daily' => 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
                    'timezone' => 'Asia/Jakarta',
                    'forecast_days' => 4,
                ]);
                $response->throw();
                $payload = $response->json();
                if (!is_array($payload['current'] ?? null) || !is_array($payload['daily'] ?? null)) {
                    throw new \RuntimeException('Format data cuaca tidak sesuai.');
                }
                return ['current' => $payload['current'], 'daily' => $payload['daily'], 'fetched_at' => now()->toIso8601String()];
            });
            return response()->json([
                ...$result, 'lokasi' => ['latitude' => $lat, 'longitude' => $lon],
                'peringatan' => $this->peringatan($result), 'sumber' => 'Open-Meteo',
            ]);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Cuaca tidak dapat dimuat. Periksa koneksi server ke Open-Meteo.'], 503);
        }
    }

    private function peringatan(array $w): array
    {
        $c = $w['current']; $d = $w['daily'];
        $code = (int) ($c['weather_code'] ?? 0);
        $wind = (float) ($c['wind_speed_10m'] ?? 0);
        $rain = array_sum(array_slice($d['precipitation_sum'] ?? [], 0, 3));
        $hottest = max([0, ...array_slice($d['temperature_2m_max'] ?? [], 0, 3)]);
        if ($code >= 95 || $wind >= 40) {
            return ['tingkat' => 2, 'pesan' => 'Risiko badai atau angin kencang. Hindari kerja lapangan saat kondisi berbahaya.'];
        }
        if (($d['precipitation_sum'][0] ?? 0) >= config('sengonis.ambang_hujan_mm') / 2 || $rain >= config('sengonis.ambang_hujan_mm')) {
            return ['tingkat' => 1, 'pesan' => 'Hujan lebat diperkirakan. Periksa drainase blok rendah dan risiko genangan.'];
        }
        if ($rain < 3 && $hottest >= config('sengonis.ambang_panas_c')) {
            return ['tingkat' => 1, 'pesan' => 'Cuaca panas dan kering. Perhatikan kebutuhan air bibit sengon.'];
        }
        return ['tingkat' => 0, 'pesan' => 'Perkiraan cuaca cukup baik untuk kegiatan kebun. Tetap pantau kondisi setempat.'];
    }
}
