<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pengguna extends Authenticatable
{
    use Notifiable;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';
    public $timestamps = false;
    protected $fillable = ['role', 'nama_pengguna', 'username', 'password', 'no_telepon', 'status_aktif', 'foto_profil'];
    protected $hidden = ['password', 'remember_token'];
    protected function casts(): array { return ['status_aktif' => 'boolean', 'password' => 'hashed']; }

    public function tanaman(): HasMany { return $this->hasMany(Tanaman::class, 'FK_pengguna', 'id_pengguna'); }
    public function keuangan(): HasMany { return $this->hasMany(Keuangan::class, 'FK_pengguna', 'id_pengguna'); }
    public function laporanKeuangan(): HasMany { return $this->hasMany(LaporanKeuangan::class, 'FK_pengguna', 'id_pengguna'); }
    public function laporanKematian(): HasMany { return $this->hasMany(LaporanKematian::class, 'FK_pengguna', 'id_pengguna'); }
    public function isOwner(): bool { return $this->role === 'Owner'; }
}
