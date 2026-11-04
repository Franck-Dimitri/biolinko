<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** upcoming : prélèvement à venir · renewed : abonnement renouvelé · failed : solde insuffisant */
class SubscriptionRenewalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $type, public float $amount, public float $balance)
    {
    }

    public function envelope(): Envelope
    {
        $plan = ucfirst($this->user->plan);

        return new Envelope(subject: match ($this->type) {
            'renewed' => "Votre abonnement {$plan} est renouvelé",
            'failed' => "Action requise : renouvelez votre abonnement {$plan}",
            default => "Votre abonnement {$plan} se renouvelle bientôt",
        });
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.subscription_renewal');
    }
}
