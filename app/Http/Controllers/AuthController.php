<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'u' => ['required', 'string'],
            'p' => ['required', 'string'],
        ]);

        if (Auth::attempt([
            'username' => $credentials['u'],
            'password' => $credentials['p'],
        ], $request->boolean('remember'))) {
            if (! Auth::user()->isActive()) {
                Auth::logout();

                return back()->withErrors(['u' => 'This account is inactive.'])->withInput();
            }

            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors(['u' => 'Invalid username or password.'])->withInput();
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
