<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finances', function (Blueprint $table) {
            $table->id();
            $table->date('tgl');
            $table->string('jenis');
            $table->bigInteger('nominal')->default(0);
            $table->string('bayar')->default('Paid');
            $table->string('status')->default('Pending validation');
            $table->timestamps();
            $table->index(['status', 'jenis']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finances');
    }
};
