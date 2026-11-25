<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prediksi extends Model
{
    protected $table = 'prediksi';
    protected $primaryKey = 'id_prediksi';
    public $timestamps = false;
    protected $fillable = ['tanggal_prediksi', 'hasil_prediksi'];
    protected function casts(): array { return ['tanggal_prediksi' => 'date']; }
}
