<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PenggunaController extends Controller
{
    public function index()
    {
        return view('pengguna.index', ['items' => Pengguna::orderByDesc('id_pengguna')->paginate(12)]);
    }
    public function create() { return view('pengguna.form', ['item' => new Pengguna]); }
    public function edit(Pengguna $pengguna) { return view('pengguna.form', ['item' => $pengguna]); }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_pengguna' => ['required', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:pengguna,username'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'no_telepon' => ['nullable', 'string', 'max:15'],
        ]);
        Pengguna::create([...$data, 'role' => 'Field Officer', 'status_aktif' => true]);
        return redirect()->route('pengguna.index')->with('success', 'Petugas lapangan baru berhasil dibuat.');
    }

    public function update(Request $request, Pengguna $pengguna)
    {
        $data = $request->validate([
            'nama_pengguna' => ['required', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('pengguna', 'username')->ignore($pengguna->id_pengguna, 'id_pengguna')],
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
            'no_telepon' => ['nullable', 'string', 'max:15'],
        ]);
        if (blank($data['password'] ?? null)) unset($data['password']);
        $pengguna->update($data);
        return redirect()->route('pengguna.index')->with('success', 'Akun pengguna diperbarui.');
    }

    public function toggle(Request $request, Pengguna $pengguna)
    {
        abort_if($pengguna->id_pengguna === $request->user()->id_pengguna, 422, 'Tidak bisa menonaktifkan akun sendiri.');
        abort_if($pengguna->role === 'Owner', 403, 'Akun Owner tidak dapat dinonaktifkan melalui halaman ini.');
        $pengguna->update(['status_aktif' => ! $pengguna->status_aktif]);
        return back()->with('success', 'Status akun berhasil diubah.');
    }
}
