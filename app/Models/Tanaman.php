<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tanaman extends Model
{
    protected $table = 'tanaman';
    protected $primaryKey = 'id_tanaman';
    public $timestamps = false;
    protected $fillable = ['FK_pengguna', 'tanggal_tanam', 'tinggi_pohon', 'diameter_pohon', 'lokasi_blok', 'status_pertumbuhan', 'latitude', 'longitude'];
    protected function casts(): array { return ['FK_pengguna' => 'integer', 'lokasi_blok' => 'integer', 'tanggal_tanam' => 'date', 'tinggi_pohon' => 'decimal:2', 'diameter_pohon' => 'decimal:2', 'latitude' => 'decimal:7', 'longitude' => 'decimal:7']; }
    public function pengguna(): BelongsTo { return $this->belongsTo(Pengguna::class, 'FK_pengguna', 'id_pengguna'); }
    public function laporanKematian(): HasMany { return $this->hasMany(LaporanKematian::class, 'FK_tanaman', 'id_tanaman'); }
}
