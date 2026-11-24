<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('jenis');
            $table->string('periode')->nullable();
            $table->date('tgl')->nullable();
            $table->bigInteger('masuk')->default(0);
            $table->bigInteger('keluar')->default(0);
            $table->integer('jumlah')->nullable();
            $table->string('penyebab')->nullable();
            $table->string('status')->default('Pending validation');
            $table->boolean('arsip')->default(false);
            $table->timestamps();
            $table->index(['jenis', 'arsip']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
