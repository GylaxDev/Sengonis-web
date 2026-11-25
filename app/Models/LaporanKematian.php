<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanKematian extends Model
{
    protected $table = 'laporan_kematian';
    protected $primaryKey = 'id_laporan_kematian';
    public $timestamps = false;
    protected $fillable = ['FK_pengguna', 'FK_tanaman', 'tanggal_kematian', 'jumlah_mati', 'status_verifikasi', 'status_arsip', 'penyebab_kematian'];
    protected function casts(): array { return ['FK_pengguna' => 'integer', 'FK_tanaman' => 'integer', 'tanggal_kematian' => 'date', 'jumlah_mati' => 'integer', 'status_arsip' => 'boolean']; }
    public function pengguna(): BelongsTo { return $this->belongsTo(Pengguna::class, 'FK_pengguna', 'id_pengguna'); }
    public function tanaman(): BelongsTo { return $this->belongsTo(Tanaman::class, 'FK_tanaman', 'id_tanaman'); }
}
