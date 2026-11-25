<?php

namespace App\Providers;

use App\Models\BlokPeta;
use App\Models\Keuangan;
use App\Models\LaporanKematian;
use App\Models\LaporanKeuangan;
use App\Models\Tanaman;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        View::composer('layouts.app', function ($view) {
            if (! auth()->check()) return;
            $view->with('shellSummary', [
                'keuangan' => Keuangan::where('status_validasi', 'Pending validation')->count(),
                'laporan' => LaporanKeuangan::where('status_verifikasi', 'Draft')->where('status_arsip', false)->count(),
                'kematian' => LaporanKematian::where('status_verifikasi', 'Draft')->where('status_arsip', false)->count(),
                'hidup' => Tanaman::where('status_pertumbuhan', '!=', 'Dead')->count(),
                'blok' => BlokPeta::count(),
            ]);
        });
    }
}
