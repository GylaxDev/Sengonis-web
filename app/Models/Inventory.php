<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = ['nama', 'jumlah', 'satuan', 'keterangan'];

    protected function casts(): array
    {
        return ['jumlah' => 'integer'];
    }
}
