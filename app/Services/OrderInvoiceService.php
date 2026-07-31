<?php

namespace App\Services;

use App\Mail\OrderConfirmationToCustomerMail;
use App\Mail\OrderNotificationToVendorMail;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class OrderInvoiceService
{
    /**
     * Generate PDF invoice content for an order.
     */
    public function generateInvoicePdf(Order $order): string
    {
        $order->loadMissing(['store.user', 'items']);

        $trackUrl = route('order.track', $order->tracking_code);

        // Generate QR Code as base64 PNG/SVG for DomPDF embedding
        try {
            $qrSvg = QrCode::size(100)->margin(1)->generate($trackUrl);
            $qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode($qrSvg);
        } catch (\Exception $e) {
            $qrCodeBase64 = null;
        }

        $pdf = Pdf::loadView('invoices.order_pdf', [
            'order' => $order,
            'qrCodeBase64' => $qrCodeBase64,
        ]);

        return $pdf->output();
    }

    /**
     * Send email notifications with PDF invoice attachments to both Vendor and Customer.
     */
    public function sendOrderInvoiceEmails(Order $order): void
    {
        try {
            $pdfData = $this->generateInvoicePdf($order);

            // 1. Send Email to Vendor
            $vendorEmail = $order->store->user->email ?? null;
            if ($vendorEmail) {
                Mail::to($vendorEmail)->send(new OrderNotificationToVendorMail($order, $pdfData));
                Log::info('Order Vendor Email Sent', ['order_id' => $order->id, 'vendor_email' => $vendorEmail]);
            }

            // 2. Send Email to Customer (if customer email provided)
            $customerEmail = $order->customer_email ?? null;
            if ($customerEmail && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                Mail::to($customerEmail)->send(new OrderConfirmationToCustomerMail($order, $pdfData));
                Log::info('Order Customer Email Sent', ['order_id' => $order->id, 'customer_email' => $customerEmail]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send Order Invoice Emails', ['order_id' => $order->id, 'err' => $e->getMessage()]);
        }
    }
}
