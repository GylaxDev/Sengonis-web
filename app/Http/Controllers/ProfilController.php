<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfilController extends Controller
{
    public function index() { return view('profil.index', ['item' => auth()->user()]); }

    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'nama_pengguna' => ['required', 'string', 'max:50'],
            'no_telepon' => ['nullable', 'string', 'max:15'],
            'password_lama' => ['required_with:password_baru', 'nullable', 'string'],
            'password_baru' => ['nullable', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);
        if (! empty($data['password_baru'])) {
            if (! Hash::check($data['password_lama'] ?? '', $user->password)) {
                throw ValidationException::withMessages(['password_lama' => 'Password lama tidak cocok.']);
            }
            $user->password = $data['password_baru'];
        }
        $user->fill(collect($data)->only(['nama_pengguna', 'no_telepon'])->all());
        $user->save();
        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function foto(Request $request)
    {
        $data = $request->validate(['foto_profil' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:2048']]);
        $file = $data['foto_profil'];
        $user = $request->user();
        $user->foto_profil = 'data:'.$file->getMimeType().';base64,'.base64_encode(file_get_contents($file->getRealPath()));
        $user->save();
        return back()->with('success', 'Foto profil diperbarui.');
    }

    public function hapusFoto(Request $request)
    {
        $user = $request->user();
        $user->foto_profil = null;
        $user->save();
        return back()->with('success', 'Foto profil dihapus.');
    }
}
