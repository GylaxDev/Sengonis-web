<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request, ReportService $service)
    {
        return view('reports.index', [
            'tab' => $request->input('tab', 'fin'),
            'financial' => Report::where('jenis', 'financial')
                ->when($request->boolean('arch'), fn ($query) => $query->where('arsip', true))
                ->unless($request->boolean('arch'), fn ($query) => $query->where('arsip', false))
                ->get(),
            'mortality' => Report::where('jenis', 'mortality')
                ->when($request->boolean('arch'), fn ($query) => $query->where('arsip', true))
                ->unless($request->boolean('arch'), fn ($query) => $query->where('arsip', false))
                ->get(),
            'summary' => $service->financialSummary(),
        ]);
    }

    public function store(StoreReportRequest $request)
    {
        Report::create($request->validated() + ['status' => 'Pending validation']);

        return redirect()->route('reports.index')->with('status', 'Report saved as draft.');
    }

    public function verify(Report $report)
    {
        $report->update(['status' => 'Verified']);

        return redirect()->route('reports.index')->with('status', 'Report verified.');
    }

    public function archive(Report $report)
    {
        $report->update(['arsip' => true]);

        return redirect()->route('reports.index')->with('status', 'Report archived.');
    }

    public function destroy(Report $report)
    {
        $report->delete();

        return redirect()->route('reports.index')->with('status', 'Report deleted.');
    }
}
