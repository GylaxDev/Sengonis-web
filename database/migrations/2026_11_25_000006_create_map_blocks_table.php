<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('map_blocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('nomor')->unique();
            $table->json('ring');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('map_blocks');
    }
};
