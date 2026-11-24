<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function index()
    {
        return view('weather.index');
    }

    public function current(Request $request, WeatherService $service): JsonResponse
    {
        return response()->json(
            $service->current(
                $request->input('location', '-95.34,5.59'),
                $request->boolean('force'),
            ),
        );
    }
}
