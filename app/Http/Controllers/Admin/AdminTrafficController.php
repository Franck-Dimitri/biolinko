<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\TrafficStats;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Fréquentation de la plateforme : site Biolinko et boutiques. */
class AdminTrafficController extends Controller
{
    public function index(Request $request): Response
    {
        $days = in_array((int) $request->query('jours'), [7, 30, 90], true) ? (int) $request->query('jours') : 30;
        $scope = in_array($request->query('perimetre'), ['all', 'site'], true) ? $request->query('perimetre') : 'all';

        return Inertia::render('Admin/Traffic/Index', [
            'stats' => TrafficStats::summary($scope, $days),
            'filters' => ['jours' => $days, 'perimetre' => $scope],
        ]);
    }
}
