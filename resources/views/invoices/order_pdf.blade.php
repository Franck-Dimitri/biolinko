@php
    $store = $order->store;
    $seller = $store?->user;
    $accent = $store->theme_color ?? '#141412';
    $number = $order->invoice_number ?: $order->tracking_code;
    $issued = $order->invoice_issued_at ?? $order->paid_at ?? $order->created_at;
    $isPaid = $order->payment_status === 'paid' || in_array($order->status, ['paid', 'in_delivery', 'delivered'], true);
    $isCancelled = in_array($order->status, ['cancelled', 'failed'], true);
    $fees = (float) $order->saas_margin + (float) $order->api_fee;
    $money = fn ($n) => number_format((float) $n, 0, ',', ' ').' FCFA';
    // Les plans payants émettent des factures 100 % à leur marque
    $showBiolinko = ! ($seller && $seller->hasPlan('pro'));

    // Logo de la boutique : seuls PNG / JPEG sont rendus fiablement par le moteur PDF
    $logoPath = null;
    if ($store?->logo_url) {
        $candidate = public_path(ltrim(parse_url($store->logo_url, PHP_URL_PATH) ?? '', '/'));
        if (is_file($candidate) && preg_match('/\.(png|jpe?g)$/i', $candidate)) {
            $logoPath = $candidate;
        }
    }
    $operator = ['MTN' => 'MTN Mobile Money', 'ORANGE' => 'Orange Money'][strtoupper((string) $order->payment_operator)] ?? 'Mobile Money';
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $number }}</title>
    <style>
        @page { margin: 42px 46px 60px 46px; }
        * { box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10.5px; color: #141412; line-height: 1.5; margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        td, th { vertical-align: top; padding: 0; }
        .muted { color: #6B6A64; }
        .small { font-size: 9px; }
        .accent-bar { height: 4px; background: {{ $accent }}; margin-bottom: 26px; }
        .brand-name { font-size: 17px; font-weight: bold; }
        .logo { width: 54px; height: 54px; object-fit: cover; }
        .logo-fallback { width: 54px; height: 54px; background: {{ $accent }}; color: #fff; font-size: 22px; font-weight: bold; text-align: center; vertical-align: middle; }
        .doc-title { font-size: 26px; font-weight: bold; letter-spacing: 1px; text-align: right; }
        .meta td { padding: 2px 0; }
        .meta td.label { color: #6B6A64; padding-right: 14px; }
        .box-title { font-size: 9px; color: #6B6A64; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .party { padding: 14px 16px; border: 1px solid #E7E5DF; }
        .items th { font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; color: #6B6A64; text-align: left; padding: 9px 10px; border-bottom: 1.5px solid #141412; }
        .items td { padding: 10px; border-bottom: 1px solid #ECEAE4; }
        .num { text-align: right; white-space: nowrap; }
        .totals td { padding: 5px 10px; }
        .totals .grand td { font-size: 13px; font-weight: bold; border-top: 1.5px solid #141412; padding-top: 9px; }
        .status { display: inline-block; padding: 4px 10px; font-size: 9.5px; font-weight: bold; letter-spacing: 0.6px; text-transform: uppercase; }
        .status.paid { background: #DCFCE7; color: #15803D; }
        .status.pending { background: #FFF3C4; color: #7A5B00; }
        .status.cancelled { background: #FEE2E2; color: #B91C1C; }
        .signature { font-family: 'DejaVu Serif', serif; font-style: italic; font-size: 15px; }
        .footer { position: fixed; bottom: -36px; left: 0; right: 0; text-align: center; font-size: 8.5px; color: #8B8A83; }
    </style>
</head>
<body>
    <div class="accent-bar"></div>

    {{-- En-tête : vendeur à gauche, document à droite --}}
    <table>
        <tr>
            <td style="width: 58%;">
                <table>
                    <tr>
                        <td style="width: 66px;">
                            @if ($logoPath)
                                <img src="{{ $logoPath }}" class="logo" alt="">
                            @else
                                <table><tr><td class="logo-fallback">{{ mb_strtoupper(mb_substr($store->name ?? 'B', 0, 1)) }}</td></tr></table>
                            @endif
                        </td>
                        <td>
                            <div class="brand-name">{{ $store->name ?? 'Boutique' }}</div>
                            @if ($store?->city_location)<div class="muted">{{ $store->city_location }}</div>@endif
                            @if ($seller?->phone_whatsapp)<div class="muted">Tél. {{ $seller->phone_whatsapp }}</div>@endif
                            @if ($seller?->email)<div class="muted">{{ $seller->email }}</div>@endif
                            <div class="muted">biolinko.link/{{ $store->slug ?? '' }}</div>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="width: 42%;">
                <div class="doc-title">FACTURE</div>
                <table class="meta" style="margin-top: 8px;">
                    <tr><td class="label" style="text-align: right; width: 55%;">N°</td><td style="text-align: right; font-weight: bold;">{{ $number }}</td></tr>
                    <tr><td class="label" style="text-align: right;">Date d’émission</td><td style="text-align: right;">{{ \Illuminate\Support\Carbon::parse($issued)->format('d/m/Y') }}</td></tr>
                    @if ($order->invoice_due_at && ! $isPaid)
                        <tr><td class="label" style="text-align: right;">Échéance</td><td style="text-align: right;">{{ $order->invoice_due_at->format('d/m/Y') }}</td></tr>
                    @endif
                    <tr><td class="label" style="text-align: right;">Commande</td><td style="text-align: right;">{{ $order->tracking_code }}</td></tr>
                </table>
                <div style="text-align: right; margin-top: 10px;">
                    @if ($isCancelled)
                        <span class="status cancelled">Annulée</span>
                    @elseif ($isPaid)
                        <span class="status paid">Payée</span>
                    @else
                        <span class="status pending">À régler</span>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    {{-- Parties --}}
    <table style="margin-top: 28px;">
        <tr>
            <td style="width: 49%;" class="party">
                <div class="box-title">Facturé à</div>
                <div style="font-weight: bold; font-size: 12px;">{{ $order->customer_name }}</div>
                <div class="muted">{{ $order->customer_phone }}</div>
                @if ($order->customer_email)<div class="muted">{{ $order->customer_email }}</div>@endif
                @if ($order->city || $order->address_details)
                    <div class="muted">{{ collect([$order->address_details, $order->city])->filter()->unique()->implode(', ') }}</div>
                @endif
            </td>
            <td style="width: 2%;"></td>
            <td style="width: 49%;" class="party">
                <div class="box-title">Règlement</div>
                @if ($order->is_manual)
                    <div>Facture émise par le vendeur</div>
                    <div class="muted">{{ $isPaid ? 'Réglée'.($order->paid_at ? ' le '.$order->paid_at->format('d/m/Y') : '') : 'Paiement à effectuer auprès du vendeur' }}</div>
                @else
                    <div>{{ $operator }}</div>
                    @if ($order->payment_phone)<div class="muted">Payeur : {{ $order->payment_phone }}</div>@endif
                    @if ($order->paid_at)<div class="muted">Payé le {{ $order->paid_at->format('d/m/Y à H:i') }}</div>@endif
                    @if ($order->hrskills_reference)<div class="muted small">Réf. {{ $order->hrskills_reference }}</div>@endif
                @endif
            </td>
        </tr>
    </table>

    {{-- Lignes --}}
    <table class="items" style="margin-top: 26px;">
        <thead>
            <tr>
                <th style="width: 52%;">Désignation</th>
                <th class="num" style="width: 10%;">Qté</th>
                <th class="num" style="width: 19%;">Prix unitaire</th>
                <th class="num" style="width: 19%;">Montant</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>
                        {{ $item->product_title }}
                        @if ($item->variant_label)<div class="muted small">{{ $item->variant_label }}</div>@endif
                    </td>
                    <td class="num">{{ $item->quantity }}</td>
                    <td class="num">{{ $money($item->unit_price_vendor) }}</td>
                    <td class="num">{{ $money($item->total_price_vendor) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Totaux --}}
    <table style="margin-top: 14px;">
        <tr>
            <td style="width: 52%;">
                @if ($order->invoice_notes)
                    <div class="box-title">Notes</div>
                    <div class="muted">{!! nl2br(e($order->invoice_notes)) !!}</div>
                @endif
            </td>
            <td style="width: 48%;">
                <table class="totals">
                    <tr><td class="muted">Sous-total</td><td class="num">{{ $money($order->price_vendor) }}</td></tr>
                    @if ($fees > 0)
                        <tr><td class="muted">Frais de service</td><td class="num">{{ $money($fees) }}</td></tr>
                    @endif
                    <tr class="grand"><td>{{ $isPaid ? 'Total payé' : 'Total à payer' }}</td><td class="num">{{ $money($order->total_client) }}</td></tr>
                </table>
                <div class="muted small" style="text-align: right; margin-top: 4px; padding-right: 10px;">Montants en francs CFA (XAF).</div>
            </td>
        </tr>
    </table>

    {{-- Signature et vérification --}}
    <table style="margin-top: 38px;">
        <tr>
            <td style="width: 60%;">
                <div class="box-title">Pour {{ $store->name ?? 'la boutique' }}</div>
                <div class="signature">{{ $store->name ?? '' }}</div>
                <div style="border-top: 1px solid #D9D6CE; width: 220px; margin-top: 6px; padding-top: 4px;" class="muted small">
                    Document émis électroniquement le {{ \Illuminate\Support\Carbon::parse($issued)->format('d/m/Y') }}, valable sans signature manuscrite.
                </div>
            </td>
            <td style="width: 40%; text-align: right;">
                @if ($qrCodeBase64)
                    <img src="{{ $qrCodeBase64 }}" style="width: 78px; height: 78px;" alt="">
                    <div class="muted small">Scannez pour vérifier la commande</div>
                @endif
            </td>
        </tr>
    </table>

    <div class="footer">
        {{ $store->name ?? '' }} · Facture {{ $number }}
        @if ($showBiolinko) · Facture émise avec Biolinko — biolinko.link @endif
    </div>
</body>
</html>
