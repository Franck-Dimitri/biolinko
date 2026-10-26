<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerifyEmailOtpController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/VerifyEmailOtp', [
            'email' => $user->email,
            'status' => session('status'),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        if (!$user->verifyEmailOtp($request->otp)) {
            return back()->withErrors(['otp' => 'Le code OTP saisi est incorrect ou a expiré. Veuillez réessayer.']);
        }

        return redirect()->route('dashboard')->with('success', 'Votre adresse e-mail a été vérifiée avec succès !');
    }

    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        $user->sendEmailVerificationNotification();

        return back()->with('status', 'Un nouveau code de vérification à 6 chiffres a été envoyé à votre adresse e-mail.');
    }
}
