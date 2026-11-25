<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prediksi', function (Blueprint $table) {
            $table->increments('id_prediksi');
            $table->date('tanggal_prediksi');
            $table->text('hasil_prediksi')->nullable();
        });
    }
    public function down(): void { Schema::dropIfExists('prediksi'); }
};
