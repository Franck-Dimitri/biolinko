<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PilotApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Suivi des candidatures au programme pilote : liste, filtre par statut, changement de statut. */
class AdminPilotController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        return Inertia::render('Admin/Pilot/Index', [
            'applications' => PilotApplication::query()
                ->when(array_key_exists((string) $status, PilotApplication::STATUSES), fn ($q) => $q->where('status', $status))
                ->latest()->paginate(30)->withQueryString(),
            'counts' => PilotApplication::selectRaw('status, COUNT(*) as n')->groupBy('status')->pluck('n', 'status'),
            'statuses' => PilotApplication::STATUSES,
            'filter' => $status,
        ]);
    }

    public function update(Request $request, PilotApplication $application): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(array_keys(PilotApplication::STATUSES))]]);
        $application->update($data);

        return back()->with('success', 'Statut mis à jour.');
    }
}
