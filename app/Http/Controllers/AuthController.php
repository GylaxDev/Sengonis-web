<?php

namespace App\Http\Controllers;

use App\Models\Tanaman;
use App\Models\BlokPeta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function loginForm()
    {
        return view('auth.login', ['jumlahHidup' => Tanaman::where('status_pertumbuhan', '!=', 'Dead')->count(), 'jumlahBlok' => BlokPeta::count()]);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['username' => ['required', 'string'], 'password' => ['required', 'string']]);
        if (! Auth::attempt([...$data, 'status_aktif' => true])) {
            throw ValidationException::withMessages(['username' => 'Username/password tidak sesuai atau akun nonaktif.']);
        }
        $request->session()->regenerate();
        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}
