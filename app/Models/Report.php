<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'jenis',
        'periode',
        'tgl',
        'masuk',
        'keluar',
        'jumlah',
        'penyebab',
        'status',
        'arsip',
    ];

    protected function casts(): array
    {
        return [
            'tgl' => 'date',
            'masuk' => 'integer',
            'keluar' => 'integer',
            'jumlah' => 'integer',
            'arsip' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('arsip', false);
    }
}
