<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinanceRequest;
use App\Models\Finance;
use App\Services\ForecastService;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function index(ForecastService $forecast)
    {
        return view('finance.index', [
            'finances' => Finance::latest()->get(),
            'forecast' => $forecast->monthly(),
        ]);
    }

    public function store(StoreFinanceRequest $request)
    {
        Finance::create($request->validated() + ['status' => 'Pending validation']);

        return redirect()->route('finance.index')->with('status', 'Transaction saved as draft.');
    }

    public function update(Request $request, Finance $finance)
    {
        $data = $request->validate([
            'status' => ['required', 'in:Pending validation,Validated,Rejected'],
        ]);
        $finance->update($data);

        return redirect()->route('finance.index')->with('status', 'Transaction updated.');
    }

    public function destroy(Finance $finance)
    {
        $finance->delete();

        return redirect()->route('finance.index')->with('status', 'Transaction deleted.');
    }
}
