<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanKeuangan extends Model
{
    protected $table = 'laporan_keuangan';
    protected $primaryKey = 'id_laporan_keuangan';
    public $timestamps = false;
    protected $fillable = ['FK_pengguna', 'FK_keuangan', 'periode', 'total_pendapatan', 'total_pengeluaran', 'status_verifikasi', 'status_arsip'];
    protected function casts(): array { return ['FK_pengguna' => 'integer', 'FK_keuangan' => 'integer', 'total_pendapatan' => 'decimal:2', 'total_pengeluaran' => 'decimal:2', 'status_arsip' => 'boolean']; }
    public function pengguna(): BelongsTo { return $this->belongsTo(Pengguna::class, 'FK_pengguna', 'id_pengguna'); }
    public function keuangan(): BelongsTo { return $this->belongsTo(Keuangan::class, 'FK_keuangan', 'id_keuangan'); }
}
