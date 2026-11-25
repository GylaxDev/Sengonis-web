<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('keuangan', function (Blueprint $table) {
            $table->increments('id_keuangan');
            $table->unsignedInteger('FK_pengguna');
            $table->date('tanggal_transaksi');
            $table->string('jenis_transaksi', 40);
            $table->decimal('nominal', 15, 2);
            $table->string('status_pembayaran', 15)->default('Paid');
            // Kolom tambahan untuk proses validasi transaksi pada website asli.
            $table->string('status_validasi', 25)->default('Pending validation');
            $table->foreign('FK_pengguna')->references('id_pengguna')->on('pengguna')->restrictOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('keuangan'); }
};
