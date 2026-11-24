<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weather extends Model
{
    use HasFactory;

    protected $fillable = ['lokasi', 'payload', 'fetched_at'];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'fetched_at' => 'datetime',
        ];
    }

    public function isFresh(int $minutes = 15): bool
    {
        return $this->fetched_at && $this->fetched_at->copy()->addMinutes($minutes)->isFuture();
    }
}
