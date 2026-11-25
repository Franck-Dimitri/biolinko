<?php

namespace App\Mail;

use App\Models\User;
use App\Support\MailTheme;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VendorOtpVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;

    public string $otp;

    public function __construct(User $user, string $otp)
    {
        $this->user = $user;
        $this->otp = $otp;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre code Biolinko : '.$this->otp,
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.vendor_otp_verification', with: ['theme' => MailTheme::for(null)]);
    }
}
