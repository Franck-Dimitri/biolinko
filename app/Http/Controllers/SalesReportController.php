<?php

namespace App\Http\Controllers;

use App\Services\SalesReportExporter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesReportController extends Controller
{
    public function export(Request $request, SalesReportExporter $exporter): StreamedResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'scope' => ['nullable', 'in:sales,all'],
        ]);

        $store = $request->user()->store;
        abort_unless($store, 404, 'Boutique introuvable pour cet utilisateur.');

        // Par défaut : le mois en cours
        $from = isset($validated['from']) ? Carbon::parse($validated['from']) : now()->startOfMonth();
        $to = isset($validated['to']) ? Carbon::parse($validated['to']) : now();

        // Garde-fou : 1 an maximum par export
        if ($from->diffInDays($to) > 366) {
            $from = $to->copy()->subYear();
        }

        return $exporter->download($store, $from, $to, $validated['scope'] ?? 'sales');
    }
}
