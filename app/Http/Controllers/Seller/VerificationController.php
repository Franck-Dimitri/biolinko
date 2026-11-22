<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SellerVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Vérification d'identité du vendeur : pièce d'identité + selfie, contrôlés par l'équipe Biolinko.
 * Obligatoire avant le premier retrait, pour qu'une fausse boutique ne puisse jamais toucher l'argent des clients.
 */
class VerificationController extends Controller
{
    private const IMAGE = ['image', 'mimes:jpg,jpeg,png,webp', 'max:6144'];

    public function index(Request $request): Response
    {
        return Inertia::render('Seller/Verification/Index', [
            'verification' => WalletController::verificationStatus($request->user()),
            'details' => $request->user()->verification?->only(['full_name', 'id_type', 'id_number']),
            'idTypes' => SellerVerification::ID_TYPES,
            'twoSided' => SellerVerification::TWO_SIDED,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $current = $user->verification;
        if ($current?->isApproved()) {
            return back()->withErrors(['full_name' => 'Votre identité est déjà vérifiée.']);
        }

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'min:3', 'max:120'],
            'id_type' => ['required', 'in:'.implode(',', array_keys(SellerVerification::ID_TYPES))],
            'id_number' => ['nullable', 'string', 'max:60'],
            'id_front' => ['required', ...self::IMAGE],
            'id_back' => [in_array($request->input('id_type'), SellerVerification::TWO_SIDED, true) ? 'required' : 'nullable', ...self::IMAGE],
            'selfie' => ['required', ...self::IMAGE],
        ], [
            'id_front.required' => 'Ajoutez une photo du recto de votre pièce.',
            'id_back.required' => 'Ajoutez une photo du verso de votre pièce.',
            'selfie.required' => 'Ajoutez un selfie en tenant votre pièce.',
            '*.max' => 'Chaque photo doit faire moins de 6 Mo.',
            '*.mimes' => 'Formats acceptés : JPG, PNG ou WEBP.',
        ]);

        $dir = "kyc/{$user->id}";
        $disk = SellerVerification::DISK;
        $paths = [
            'id_front_path' => $request->file('id_front')->store($dir, $disk),
            'id_back_path' => $request->file('id_back')?->store($dir, $disk),
            'selfie_path' => $request->file('selfie')->store($dir, $disk),
        ];

        // Un nouvel envoi remplace le précédent (refusé ou en attente)
        $current?->deleteFiles();

        SellerVerification::updateOrCreate(['user_id' => $user->id], [
            'full_name' => trim($validated['full_name']),
            'id_type' => $validated['id_type'],
            'id_number' => ($validated['id_number'] ?? null) ?: null,
            ...$paths,
            'status' => 'pending',
            'rejection_reason' => null,
            'submitted_at' => now(),
            'reviewed_at' => null,
            'reviewed_by' => null,
        ]);

        return redirect()->route('seller.verification.index')->with('message', 'Documents envoyés : nous les vérifions sous 24 à 48 h.');
    }
}
