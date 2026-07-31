<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VendorOtpVerificationMail;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone_whatsapp' => 'nullable|string|max:50',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_whatsapp' => $request->phone_whatsapp,
            'role' => 'seller',
            'plan' => 'starter',
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        // Generate 6-digit OTP Code and send verification email
        $otp = $user->generateEmailOtp();
        try {
            Mail::to($user->email)->send(new VendorOtpVerificationMail($user, $otp));
        } catch (\Exception $e) {
            // Silently log email sending failure in local development if SMTP not configured
            \Illuminate\Support\Facades\Log::warning('Failed to send vendor OTP email', ['user_id' => $user->id, 'err' => $e->getMessage()]);
        }

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
