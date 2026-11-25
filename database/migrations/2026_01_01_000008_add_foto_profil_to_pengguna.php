<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->longText('foto_profil')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pengguna', fn (Blueprint $table) => $table->dropColumn('foto_profil'));
    }
};
