<?php

namespace App\Mail;

use App\Models\Order;
use App\Support\MailTheme;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationToCustomerMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public string $pdfData;

    public function __construct(Order $order, string $pdfData)
    {
        $this->order = $order;
        $this->pdfData = $pdfData;
    }

    public function envelope(): Envelope
    {
        $store = $this->order->store;
        $seller = $store?->user;

        // Expéditeur affiché : la boutique ; une réponse arrive chez le vendeur
        return new Envelope(
            from: new Address((string) config('mail.from.address'), $store?->name ?: (string) config('mail.from.name')),
            replyTo: $seller?->email ? [new Address($seller->email, $store->name)] : [],
            subject: 'Votre commande chez '.($store?->name ?? 'Biolinko').' est confirmée',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_customer_confirmation',
            with: ['theme' => MailTheme::for($this->order->store)],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfData, 'Facture_'.$this->order->tracking_code.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
