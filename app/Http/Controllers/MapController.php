<?php

namespace App\Http\Controllers;

use App\Models\MapBlock;

class MapController extends Controller
{
    public function index()
    {
        return view('map.index', [
            'blocks' => MapBlock::orderBy('nomor')->get(),
        ]);
    }
}
