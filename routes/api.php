<?php

use App\Http\Controllers\WeatherController;
use App\Services\ForecastService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/weather', [WeatherController::class, 'current']);

Route::get('/forecast', function (Request $request, ForecastService $service) {
    return response()->json($service->monthly((int) $request->input('months', 6)));
});
