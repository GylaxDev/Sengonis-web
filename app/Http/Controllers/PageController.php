<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Simple Blade page controller kept for the UTS-style Laravel requirements:
 * @extends / @section / @yield / @include and <x-component> usage.
 */
class PageController extends Controller
{
    public function home()
    {
        return view('home');
    }

    public function dashboard(Request $request)
    {
        return view('dashboard.index', [
            'username' => $request->input('username', 'owner'),
            'plants' => 0,
            'living' => 0,
            'income' => 0,
            'pending' => 0,
        ]);
    }

    public function profile(Request $request)
    {
        return view('dashboard.profile', [
            'username' => $request->input('username', 'owner'),
            'user' => null,
        ]);
    }

    public function settings()
    {
        return view('settings.index', ['section' => 'general']);
    }
}
