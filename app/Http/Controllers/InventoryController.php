<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return view('inventory.index', ['items' => Inventory::latest()->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'jumlah' => ['required', 'integer', 'min:0'],
            'satuan' => ['required', 'string', 'max:20'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);
        Inventory::create($data);

        return redirect()->route('inventory.index')->with('status', 'Item added.');
    }

    public function update(Request $request, Inventory $inventory)
    {
        $data = $request->validate([
            'nama' => ['sometimes', 'string', 'max:100'],
            'jumlah' => ['sometimes', 'integer', 'min:0'],
            'satuan' => ['sometimes', 'string', 'max:20'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);
        $inventory->update($data);

        return redirect()->route('inventory.index')->with('status', 'Item updated.');
    }

    public function destroy(Inventory $inventory)
    {
        $inventory->delete();

        return redirect()->route('inventory.index')->with('status', 'Item deleted.');
    }
}
