<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('sengonis:info', function () {
    $this->info('Sengonis Laravel Blade — jalankan migrasi dan seeder sebelum login.');
});
