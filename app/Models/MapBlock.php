<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MapBlock extends Model
{
    use HasFactory;

    protected $fillable = ['nomor', 'ring'];

    protected function casts(): array
    {
        return ['ring' => 'array', 'nomor' => 'integer'];
    }
}
