<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plants', function (Blueprint $table) {
            $table->id();
            $table->date('tgl');
            $table->decimal('tinggi', 8, 2)->default(0);
            $table->decimal('dia', 8, 2)->default(0);
            $table->unsignedInteger('blok')->default(1);
            $table->string('st')->default('Seedling');
            $table->decimal('lng', 10, 7)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->timestamps();
            $table->index(['blok', 'st']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plants');
    }
};
