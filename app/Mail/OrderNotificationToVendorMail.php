<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderNotificationToVendorMail extends Mailable
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
        return new Envelope(
            subject: '🎉 Nouvelle Vente sur BIOLINKO ! Commande #' . $this->order->tracking_code,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order_vendor_notification',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfData, 'Facture_' . $this->order->tracking_code . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
