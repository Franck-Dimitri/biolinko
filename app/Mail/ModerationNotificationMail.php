<?php

namespace App\Mail;

use App\Models\User;
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
            'product_deleted' => 'Notification de Modération : Suppression de produit sur BIOLINKO',
            'store_deleted' => 'Notification de Modération : Suppression définitive de vitrine sur BIOLINKO',
            'store_suspended' => 'Notification de Modération : Suspension de vitrine sur BIOLINKO',
            'account_banned' => 'Avis Important : Suspension de votre compte vendeur BIOLINKO',
            'account_unbanned' => 'Bonne nouvelle : Votre compte vendeur BIOLINKO a été réactivé',
            default => 'Notification de supervision BIOLINKO',
        };

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.moderation_notification',
        );
    }
}
