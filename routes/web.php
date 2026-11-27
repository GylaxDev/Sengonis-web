<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CuacaController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\LaporanKeuanganController;
use App\Http\Controllers\LaporanKematianController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\PetaController;
use App\Http\Controllers\PrediksiController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\TanamanController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route(auth()->check() ? 'dashboard' : 'login'));
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'loginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.process');
});

Route::middleware(['auth', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/export/{jenis}', [ExportController::class, 'download'])->name('export')->whereIn('jenis', ['tanaman', 'keuangan', 'laporan-keuangan', 'laporan-kematian']);
    Route::get('/peta', [PetaController::class, 'index'])->name('peta.index');
    Route::get('/cuaca', [CuacaController::class, 'index'])->name('cuaca.index')->middleware('throttle:30,1');
    Route::resource('tanaman', TanamanController::class)->except(['show']);
    Route::resource('keuangan', KeuanganController::class)->except(['show']);
    Route::resource('laporan-keuangan', LaporanKeuanganController::class)->except(['show', 'destroy']);
    Route::resource('laporan-kematian', LaporanKematianController::class)->except(['show', 'destroy']);
    Route::get('/prediksi', fn () => to_route('dashboard', request()->only('page'))->withFragment('prediksi'))->name('prediksi.index');
    Route::get('/profil', [ProfilController::class, 'index'])->name('profil.index');
    Route::put('/profil', [ProfilController::class, 'update'])->name('profil.update');
    Route::post('/profil/foto', [ProfilController::class, 'foto'])->name('profil.foto');
    Route::delete('/profil/foto', [ProfilController::class, 'hapusFoto'])->name('profil.foto.delete');

    Route::middleware('owner')->group(function () {
        Route::post('/peta/blok', [PetaController::class, 'simpanBlok'])->name('peta.blok.save');
        Route::delete('/peta/blok/{blok}', [PetaController::class, 'hapusBlok'])->name('peta.blok.delete');
        Route::post('/peta/pindah', [PetaController::class, 'pindah'])->name('peta.pindah');
        Route::post('/keuangan/{keuangan}/review', [KeuanganController::class, 'review'])->name('keuangan.review');
        Route::post('/laporan-keuangan/{laporan_keuangan}/review', [LaporanKeuanganController::class, 'review'])->name('laporan-keuangan.review');
        Route::post('/laporan-keuangan/{laporan_keuangan}/arsip', [LaporanKeuanganController::class, 'archive'])->name('laporan-keuangan.archive');
        Route::post('/laporan-kematian/{laporan_kematian}/review', [LaporanKematianController::class, 'review'])->name('laporan-kematian.review');
        Route::post('/laporan-kematian/{laporan_kematian}/arsip', [LaporanKematianController::class, 'archive'])->name('laporan-kematian.archive');
        Route::post('/prediksi', [PrediksiController::class, 'store'])->name('prediksi.store');
        Route::resource('pengguna', PenggunaController::class)->except(['show', 'destroy']);
        Route::post('/pengguna/{pengguna}/toggle', [PenggunaController::class, 'toggle'])->name('pengguna.toggle');
    });
});
