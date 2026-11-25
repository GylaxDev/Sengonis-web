<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('laporan_kematian', function (Blueprint $table) {
            $table->increments('id_laporan_kematian');
            $table->unsignedInteger('FK_pengguna');
            $table->unsignedInteger('FK_tanaman');
            $table->date('tanggal_kematian');
            $table->unsignedInteger('jumlah_mati');
            $table->string('status_verifikasi', 20)->default('Draft');
            $table->boolean('status_arsip')->default(false);
            $table->text('penyebab_kematian');
            $table->foreign('FK_pengguna')->references('id_pengguna')->on('pengguna')->restrictOnDelete();
            $table->foreign('FK_tanaman')->references('id_tanaman')->on('tanaman')->restrictOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('laporan_kematian'); }
};
