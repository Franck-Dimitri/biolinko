<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Vérification d'identité d'un vendeur : pièce d'identité + selfie, contrôlés par l'équipe Biolinko.
 * Les fichiers sont sur le disque privé « local » et ne sont lisibles que par un administrateur.
 */
class SellerVerification extends Model
{
    public const ID_TYPES = [
        'cni' => 'Carte nationale d’identité',
        'passport' => 'Passeport',
        'residence' => 'Carte de séjour',
        'driving' => 'Permis de conduire',
    ];

    /** Pièces avec un verso à photographier. */
    public const TWO_SIDED = ['cni', 'residence', 'driving'];

    public const DISK = 'local';

    protected $fillable = [
        'user_id', 'full_name', 'id_type', 'id_number', 'id_front_path', 'id_back_path', 'selfie_path',
        'status', 'rejection_reason', 'submitted_at', 'reviewed_at', 'reviewed_by',
    ];

    protected $casts = ['submitted_at' => 'datetime', 'reviewed_at' => 'datetime'];

    protected $hidden = ['id_front_path', 'id_back_path', 'selfie_path'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /** Supprime les fichiers d'identité (refus, nouvel envoi ou suppression du compte). */
    public function deleteFiles(): void
    {
        Storage::disk(self::DISK)->delete(array_filter([$this->id_front_path, $this->id_back_path, $this->selfie_path]));
    }
}
