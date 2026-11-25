<?php

namespace App\Mail;

use App\Models\User;
use App\Support\MailTheme;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ModerationNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;

    public string $type;

    public string $itemName;

    public string $reason;

    public function __construct(User $user, string $type, string $itemName, string $reason)
    {
        $this->user = $user;
        $this->type = $type;
        $this->itemName = $itemName;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        $subject = match ($this->type) {
            'product_deleted' => 'Un produit a été retiré de votre boutique',
            'store_deleted' => 'Votre boutique a été supprimée',
            'store_suspended' => 'Votre boutique a été mise hors ligne',
            'account_banned' => 'Votre compte Biolinko est suspendu',
            'account_unbanned' => 'Votre compte Biolinko est de nouveau actif',
            default => 'Information sur votre compte Biolinko',
        };

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.moderation_notification', with: ['theme' => MailTheme::for(null)]);
    }
}
