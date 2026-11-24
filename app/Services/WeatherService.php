<?php

namespace App\Services;

use App\Models\Weather;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    /**
     * Return Open-Meteo data for a "lat,lon" location, cached for 15 minutes.
     */
    public function current(string $location = '-95.34,5.59', bool $force = false): array
    {
        $cached = Weather::where('lokasi', $location)->first();

        if (! $force && $cached?->isFresh()) {
            return $cached->payload ?? [];
        }

        $coordinates = array_map('trim', explode(',', $location));
        if (count($coordinates) !== 2) {
            return $cached?->payload ?? [];
        }

        try {
            $payload = Http::timeout(8)
                ->get('https://api.open-meteo.com/v1/forecast', [
                    'latitude' => $coordinates[0],
                    'longitude' => $coordinates[1],
                    'current' => 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
                    'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum',
                    'timezone' => 'auto',
                    'forecast_days' => 7,
                ])
                ->throw()
                ->json();

            Weather::updateOrCreate(
                ['lokasi' => $location],
                ['payload' => $payload, 'fetched_at' => now()],
            );

            return $payload ?? [];
        } catch (\Throwable) {
            return $cached?->payload ?? [];
        }
    }
}
