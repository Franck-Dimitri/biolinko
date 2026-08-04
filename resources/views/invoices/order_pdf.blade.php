<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $order->tracking_code }}</title>
    @php
        $themeColor = $order->store->theme_color ?? '#FFCC00';
        $user = optional($order->store)->user;
        $hasGrowth = $user ? $user->hasPlan('growth') : false;
        $watermarkText = $hasGrowth ? strtoupper($order->store->name ?? 'BOUTIQUE') : 'BIOLINKO';
    @endphp
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }
        .watermark {
            position: fixed;
            top: 35%;
            left: 5%;
            transform: rotate(-30deg);
            font-size: 80px;
            font-weight: 900;
            color: rgba(15, 23, 42, 0.04);
            z-index: -1000;
            text-transform: uppercase;
            letter-spacing: 10px;
            font-family: Arial, sans-serif;
            pointer-events: none;
            text-align: center;
            width: 90%;
        }
        .header {
            width: 100%;
            border-bottom: 2px solid {{ $themeColor }};
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header-table {
            width: 100%;
        }
        .logo-box {
            background-color: {{ $themeColor }};
            color: #0f172a;
            font-size: 18px;
            font-weight: bold;
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            margin: 0;
            font-size: 22px;
            color: #0f172a;
            text-transform: uppercase;
        }
        .invoice-title p {
            margin: 4px 0 0 0;
            color: #64748b;
            font-size: 11px;
        }
        .details-table {
            width: 100%;
            margin-bottom: 25px;
        }
        .details-box {
            width: 48%;
            vertical-align: top;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
        }
        .details-box h3 {
            margin: 0 0 8px 0;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
        }
        .details-box p {
            margin: 2px 0;
            font-size: 11px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .items-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 11px;
            text-transform: uppercase;
            padding: 10px;
            text-align: left;
            border-top: 3px solid {{ $themeColor }};
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
        }
        .totals-table {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 6px 10px;
            font-size: 11px;
        }
        .totals-table .grand-total {
            font-size: 13px;
            font-weight: bold;
            background-color: {{ $themeColor }};
            color: #0f172a;
        }
        .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
        .qr-section {
            float: left;
            width: 50%;
            text-align: left;
        }
        .clear {
            clear: both;
        }
        .badge-paid {
            background-color: #dcfce7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
            display: inline-block;
        }
        .badge-pending {
            background-color: #fef3c7;
            color: #92400e;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
            display: inline-block;
        }
        .badge-cancelled {
            background-color: #ffe4e6;
            color: #9f1239;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="watermark">{{ $watermarkText }}</div>

    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="logo-box">{{ $order->store->name ?? 'Boutique' }}</div>
                    <p style="margin: 6px 0 0 0; font-weight: bold; color: #0f172a;">{{ $order->store->name ?? 'Boutique' }}</p>
                </td>
                <td class="invoice-title">
                    <h1>FACTURE</h1>
                    <p>Réf: <strong>{{ $order->tracking_code }}</strong></p>
                    <p>Date: {{ $order->created_at ? $order->created_at->format('d/m/Y H:i') : date('d/m/Y') }}</p>
                    <p style="margin-top: 4px;">
                        @if(in_array($order->status, ['paid', 'in_delivery', 'delivered']))
                            <span class="badge-paid">REÇU / FACTURE PAYÉE</span>
                        @elseif(in_array($order->status, ['cancelled', 'failed']))
                            <span class="badge-cancelled">FACTURE ANNULÉE</span>
                        @else
                            <span class="badge-pending">EN ATTENTE DE RÈGLEMENT</span>
                        @endif
                    </p>
                </td>
            </tr>
        </table>
    </div>

    <table class="details-table">
        <tr>
            <td class="details-box">
                <h3>Vendeur / Émetteur</h3>
                <p><strong>{{ $order->store->name ?? 'Boutique' }}</strong></p>
                <p>WhatsApp: {{ $order->store->user->phone_whatsapp ?? 'N/A' }}</p>
                <p>Email: {{ $order->store->user->email ?? 'N/A' }}</p>
                <p>Vitrine: biolinko.app/{{ $order->store->slug ?? '' }}</p>
            </td>
            <td style="width: 4%;"></td>
            <td class="details-box">
                <h3>Client / Destinataire</h3>
                <p><strong>{{ $order->customer_name }}</strong></p>
                <p>Téléphone: {{ $order->customer_phone }}</p>
                @if($order->customer_email)
                    <p>Email: {{ $order->customer_email }}</p>
                @endif
                @if($order->delivery_city || $order->delivery_address)
                    <p>Livraison: {{ $order->delivery_city }} - {{ $order->delivery_address }}</p>
                @endif
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>Article / Prestation</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix Unitaire</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @if($order->items && count($order->items) > 0)
                @foreach($order->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product_title ?? $item->product_name ?? 'Produit' }}</strong>
                            @if(!empty($item->variant_label))
                                <br><small style="color: #64748b;">Option: {{ $item->variant_label }}</small>
                            @endif
                        </td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right;">{{ number_format((float) ($item->unit_price_vendor ?? $item->price ?? 0), 0, ',', ' ') }} FCFA</td>
                        <td style="text-align: right;">{{ number_format((float) (($item->unit_price_vendor ?? $item->price ?? 0) * ($item->quantity ?? 1)), 0, ',', ' ') }} FCFA</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td><strong>Article Commandé</strong></td>
                    <td style="text-align: center;">{{ $order->quantity ?? 1 }}</td>
                    <td style="text-align: right;">{{ number_format((float) ($order->price_vendor ?? 0), 0, ',', ' ') }} FCFA</td>
                    <td style="text-align: right;">{{ number_format((float) ($order->price_vendor ?? 0), 0, ',', ' ') }} FCFA</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div>
        <div class="qr-section">
            <p style="font-size: 10px; color: #64748b; margin-bottom: 6px;">Scannez pour la validation & le suivi :</p>
            @if(isset($qrCodeBase64))
                <img src="{{ $qrCodeBase64 }}" width="85" height="85" alt="QR Code">
            @endif
        </div>

        <table class="totals-table">
            <tr>
                <td>Sous-Total Vendeur :</td>
                <td style="text-align: right; font-weight: bold;">{{ number_format($order->price_vendor, 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr class="grand-total">
                <td>TOTAL GÉNÉRAL :</td>
                <td style="text-align: right;">{{ number_format($order->total_client ?? $order->price_vendor, 0, ',', ' ') }} FCFA</td>
            </tr>
        </table>
        <div class="clear"></div>
    </div>

    <div class="footer">
        <p>Merci pour votre confiance en la boutique <strong>{{ $order->store->name ?? '' }}</strong> !</p>
        @if(!$hasGrowth)
            <p>Document généré via BIOLINKO SaaS · E-commerce & Paiements Mobile Money</p>
        @endif
    </div>

</body>
</html>
