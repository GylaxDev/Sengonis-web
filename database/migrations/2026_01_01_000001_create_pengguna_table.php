<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pengguna', function (Blueprint $table) {
            $table->increments('id_pengguna');
            $table->string('role', 30)->default('Field Officer');
            $table->string('nama_pengguna', 50);
            $table->string('username', 100)->unique();
            $table->string('password', 255);
            $table->string('no_telepon', 15)->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->rememberToken();
        });
    }
    public function down(): void { Schema::dropIfExists('pengguna'); }
};
