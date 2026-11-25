<?php

namespace App\Mail;

use App\Models\Order;
use App\Support\MailTheme;
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
            subject: 'Nouvelle commande '.$this->order->tracking_code.' : '.number_format((float) $this->order->total_client, 0, ',', ' ').' FCFA',
        );
    }

    public function content(): Content
    {
        // Aux couleurs de sa boutique ; le pied de l'e-mail mentionne déjà Biolinko
        return new Content(
            view: 'emails.order_vendor_notification',
            with: ['theme' => ['show_biolinko' => false] + MailTheme::for($this->order->store)],
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
