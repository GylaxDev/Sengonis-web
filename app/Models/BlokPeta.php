<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlokPeta extends Model
{
    protected $table = 'blok_peta';
    protected $primaryKey = 'nomor_blok';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'int';
    protected $fillable = ['nomor_blok', 'koordinat'];

    protected function casts(): array
    {
        return ['nomor_blok' => 'integer', 'koordinat' => 'array'];
    }
}
