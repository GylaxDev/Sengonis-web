<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('blok_peta', function (Blueprint $table) {
            $table->unsignedInteger('nomor_blok')->primary();
            $table->json('koordinat'); // Array titik [longitude, latitude], tidak ditutup dua kali.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blok_peta');
    }
};
