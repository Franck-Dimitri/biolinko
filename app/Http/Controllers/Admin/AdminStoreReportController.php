<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Signalements de boutiques envoyés par les visiteurs. */
class AdminStoreReportController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status') === 'closed' ? 'closed' : 'open';

        return Inertia::render('Admin/StoreReports/Index', [
            'reports' => StoreReport::with('store:id,name,slug,user_id,is_published')
                ->where('status', $status)->latest()->paginate(30)->withQueryString(),
            'status' => $status,
            'counts' => ['open' => StoreReport::where('status', 'open')->count(), 'closed' => StoreReport::where('status', 'closed')->count()],
        ]);
    }

    public function close(StoreReport $report): RedirectResponse
    {
        $report->update(['status' => 'closed', 'closed_at' => now()]);

        return back()->with('message', 'Signalement clos.');
    }
}
