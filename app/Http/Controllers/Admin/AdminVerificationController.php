<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Contrôle des pièces d'identité des vendeurs. */
class AdminVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $status = in_array($request->query('status'), ['pending', 'approved', 'rejected'], true) ? $request->query('status') : 'pending';

        $items = SellerVerification::with(['user:id,name,email,phone_whatsapp,payout_name,payout_phone', 'user.store:id,user_id,name,slug'])
            ->where('status', $status)
            ->orderBy($status === 'pending' ? 'submitted_at' : 'reviewed_at', $status === 'pending' ? 'asc' : 'desc')
            ->paginate(20)->withQueryString();

        return Inertia::render('Admin/Verifications/Index', [
            'items' => $items->through(fn (SellerVerification $v) => [
                'id' => $v->id,
                'full_name' => $v->full_name,
                'id_type' => SellerVerification::ID_TYPES[$v->id_type] ?? $v->id_type,
                'id_number' => $v->id_number,
                'has_back' => (bool) $v->id_back_path,
                'status' => $v->status,
                'rejection_reason' => $v->rejection_reason,
                'submitted_at' => $v->submitted_at?->toIso8601String(),
                'reviewed_at' => $v->reviewed_at?->toIso8601String(),
                'user' => $v->user,
            ]),
            'status' => $status,
            'counts' => SellerVerification::selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status'),
        ]);
    }

    /** Fichier d'identité, lisible uniquement par un administrateur, jamais mis en cache. */
    public function file(SellerVerification $verification, string $kind): StreamedResponse
    {
        $path = ['front' => $verification->id_front_path, 'back' => $verification->id_back_path, 'selfie' => $verification->selfie_path][$kind] ?? null;
        abort_unless($path && Storage::disk(SellerVerification::DISK)->exists($path), 404);

        return Storage::disk(SellerVerification::DISK)->response($path, null, [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function approve(Request $request, SellerVerification $verification): RedirectResponse
    {
        $verification->update(['status' => 'approved', 'rejection_reason' => null, 'reviewed_at' => now(), 'reviewed_by' => $request->user()->id]);

        return back()->with('message', "Identité de {$verification->full_name} validée.");
    }

    public function reject(Request $request, SellerVerification $verification): RedirectResponse
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        // Les documents refusés ne sont pas conservés
        $verification->deleteFiles();
        $verification->update([
            'status' => 'rejected', 'rejection_reason' => $validated['reason'], 'reviewed_at' => now(), 'reviewed_by' => $request->user()->id,
            'id_front_path' => '', 'id_back_path' => null, 'selfie_path' => '',
        ]);

        return back()->with('message', 'Vérification refusée : le vendeur peut envoyer de nouveaux documents.');
    }
}
