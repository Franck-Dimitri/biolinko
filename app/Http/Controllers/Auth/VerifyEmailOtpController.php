<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VendorOtpVerificationMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            return back()->withErrors(['otp' => 'Le code OTP saisi est incorrect ou a expiré. Veuillez réessayez.']);
        }

        return redirect()->route('dashboard')->with('success', 'Votre adresse e-mail a été vérifiée avec succès !');
    }

    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        $otp = $user->generateEmailOtp();

        try {
            Mail::to($user->email)->send(new VendorOtpVerificationMail($user, $otp));
        } catch (\Exception $e) {
            Log::warning('Failed to resend vendor OTP email', ['user_id' => $user->id, 'err' => $e->getMessage()]);
        }

        return back()->with('status', 'Un nouveau code de vérification à 6 chiffres a été envoyé à votre adresse e-mail.');
    }
}
