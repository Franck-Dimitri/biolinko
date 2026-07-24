<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;

        return Inertia::render('Appearance/Index', [
            'store' => $store,
            'appUrl' => config('app.url', 'http://localhost:8000'),
        ]);
    }
}
