<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    use HasFactory;

    protected $fillable = [
        'tgl',
        'tinggi',
        'dia',
        'blok',
        'st',
        'lng',
        'lat',
    ];

    protected function casts(): array
    {
        return [
            'tgl' => 'date',
            'tinggi' => 'float',
            'dia' => 'float',
            'blok' => 'integer',
            'lng' => 'float',
            'lat' => 'float',
        ];
    }

    public function scopeLiving($query)
    {
        return $query->where('st', '!=', 'Dead');
    }

    public function scopeInBlock($query, int $block)
    {
        return $query->where('blok', $block);
    }
}
