<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlantRequest;
use App\Http\Requests\UpdatePlantRequest;
use App\Models\Plant;

class PlantController extends Controller
{
    public function index()
    {
        return view('plants.index', ['plants' => Plant::latest()->get()]);
    }

    public function create()
    {
        return view('plants.create');
    }

    public function store(StorePlantRequest $request)
    {
        Plant::create($request->validated());

        return redirect()->route('plants.index')->with('status', 'Plant added.');
    }

    public function show(Plant $plant)
    {
        return view('plants.show', compact('plant'));
    }

    public function edit(Plant $plant)
    {
        return view('plants.edit', compact('plant'));
    }

    public function update(UpdatePlantRequest $request, Plant $plant)
    {
        $plant->update($request->validated());

        return redirect()->route('plants.show', $plant)->with('status', 'Plant updated.');
    }

    public function destroy(Plant $plant)
    {
        $plant->delete();

        return redirect()->route('plants.index')->with('status', 'Plant deleted.');
    }
}
