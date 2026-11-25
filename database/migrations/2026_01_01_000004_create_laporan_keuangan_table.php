<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('laporan_keuangan', function (Blueprint $table) {
            $table->increments('id_laporan_keuangan');
            $table->unsignedInteger('FK_pengguna');
            $table->unsignedInteger('FK_keuangan')->nullable();
            $table->decimal('total_pendapatan', 15, 2)->default(0);
            $table->decimal('total_pengeluaran', 15, 2)->default(0);
            $table->boolean('status_arsip')->default(false);
            // Kolom tambahan untuk laporan per bulan dan verifikasi Owner.
            $table->string('periode', 7);
            $table->string('status_verifikasi', 20)->default('Draft');
            $table->foreign('FK_pengguna')->references('id_pengguna')->on('pengguna')->restrictOnDelete();
            $table->foreign('FK_keuangan')->references('id_keuangan')->on('keuangan')->nullOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('laporan_keuangan'); }
};
