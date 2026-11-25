<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tanaman', function (Blueprint $table) {
            $table->increments('id_tanaman');
            $table->unsignedInteger('FK_pengguna');
            $table->date('tanggal_tanam');
            $table->decimal('tinggi_pohon', 10, 2)->default(0);
            $table->decimal('diameter_pohon', 10, 2)->default(0);
            $table->unsignedInteger('lokasi_blok');
            $table->string('status_pertumbuhan', 20)->default('Seedling');
            // Pelengkap untuk fitur peta dari versi HTML asli (opsional).
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreign('FK_pengguna')->references('id_pengguna')->on('pengguna')->restrictOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('tanaman'); }
};
