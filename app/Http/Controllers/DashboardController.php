<?php

namespace App\Http\Controllers;

use App\Models\Finance;
use App\Models\Plant;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        return view('dashboard.index', [
            'username' => $request->input('username', Auth::user()?->username ?? 'owner'),
            'plants' => Plant::count(),
            'living' => Plant::living()->count(),
            'income' => (int) Finance::validated()->where('jenis', 'Sale')->sum('nominal'),
            'pending' => Report::where('status', 'Pending validation')->count(),
        ]);
    }

    public function profile(Request $request)
    {
        return view('dashboard.profile', [
            'username' => $request->input('username', Auth::user()?->username ?? 'owner'),
            'user' => Auth::user(),
        ]);
    }
}
