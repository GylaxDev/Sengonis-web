<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;

Route::get('/pages/home', [PageController::class, 'home'])->name('pages.home');
Route::get('/pages/dashboard', [PageController::class, 'dashboard'])->name('pages.dashboard');
Route::get('/pages/profile', [PageController::class, 'profile'])->name('pages.profile');
Route::get('/pages/settings', [PageController::class, 'settings'])->name('pages.settings');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/home', [DashboardController::class, 'index'])->name('home');
    Route::get('/profile', [DashboardController::class, 'profile'])->name('profile');

    Route::resource('plants', PlantController::class);

    Route::get('/weather', [WeatherController::class, 'index'])->name('weather.index');
    Route::get('/map', [MapController::class, 'index'])->name('map.index');

    Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance', [FinanceController::class, 'store'])->name('finance.store');
    Route::patch('/finance/{finance}', [FinanceController::class, 'update'])->name('finance.update');
    Route::delete('/finance/{finance}', [FinanceController::class, 'destroy'])->name('finance.destroy');

    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::patch('/inventory/{inventory}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{inventory}', [InventoryController::class, 'destroy'])->name('inventory.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');
    Route::patch('/reports/{report}/verify', [ReportController::class, 'verify'])
        ->middleware('owner')->name('reports.verify');
    Route::patch('/reports/{report}/archive', [ReportController::class, 'archive'])
        ->middleware('owner')->name('reports.archive');
    Route::delete('/reports/{report}', [ReportController::class, 'destroy'])
        ->middleware('owner')->name('reports.destroy');

    Route::middleware('owner')->group(function () {
        Route::resource('users', UserController::class)->except(['show']);
    });

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
});
