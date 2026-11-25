<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Keuangan extends Model
{
    protected $table = 'keuangan';
    protected $primaryKey = 'id_keuangan';
    public $timestamps = false;
    protected $fillable = ['FK_pengguna', 'tanggal_transaksi', 'jenis_transaksi', 'nominal', 'status_pembayaran', 'status_validasi'];
    protected function casts(): array { return ['FK_pengguna' => 'integer', 'tanggal_transaksi' => 'date', 'nominal' => 'decimal:2']; }
    public function pengguna(): BelongsTo { return $this->belongsTo(Pengguna::class, 'FK_pengguna', 'id_pengguna'); }
    public function laporanKeuangan(): HasMany { return $this->hasMany(LaporanKeuangan::class, 'FK_keuangan', 'id_keuangan'); }
}
