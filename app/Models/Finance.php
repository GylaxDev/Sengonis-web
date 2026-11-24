<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Finance extends Model
{
    use HasFactory;

    protected $fillable = ['tgl', 'jenis', 'nominal', 'bayar', 'status'];

    protected function casts(): array
    {
        return ['tgl' => 'date', 'nominal' => 'integer'];
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'Validated');
    }
}
