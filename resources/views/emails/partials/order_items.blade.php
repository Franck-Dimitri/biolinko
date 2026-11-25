@php
    $money = fn ($n) => number_format((float) $n, 0, ',', ' ').' FCFA';
    $fees = (float) $order->saas_margin + (float) $order->api_fee;
    $isPaid = $order->payment_status === 'paid';
    $line = 'padding: 6px 0; font-size: 14px;';
@endphp
{{-- Articles commandés et totaux, mêmes montants que la facture --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 18px 0 4px; border-top: 1px solid #ECEAE4;">
    @foreach ($order->items as $item)
        <tr>
            <td style="padding: 12px 12px 12px 0; border-bottom: 1px solid #ECEAE4; vertical-align: top;">
                <div style="font-weight: 600;">{{ $item->product_title }}</div>
                @if ($item->variant_label)<div style="font-size: 13px; color: #6B6A64;">{{ $item->variant_label }}</div>@endif
                @foreach (($item->customizations ?? []) as $c)<div style="font-size: 13px; color: #6B6A64;">{{ $c['label'] }} : {{ $c['value'] }}</div>@endforeach
                <div style="font-size: 13px; color: #6B6A64;">Quantité : {{ $item->quantity }} × {{ $money($item->unit_price_vendor) }}</div>
            </td>
            <td align="right" style="padding: 12px 0; border-bottom: 1px solid #ECEAE4; vertical-align: top; white-space: nowrap; font-weight: 600;">{{ $money($item->total_price_vendor) }}</td>
        </tr>
    @endforeach
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 6px;">
    <tr><td style="{{ $line }} color: #6B6A64;">Sous-total</td><td align="right" style="{{ $line }}">{{ $money($order->subtotal ?? $order->price_vendor) }}</td></tr>
    @if ((float) $order->discount_amount > 0)
        <tr><td style="{{ $line }} color: #6B6A64;">Remise{{ $order->promo_code ? ' (code '.$order->promo_code.')' : '' }}</td><td align="right" style="{{ $line }}">−{{ $money($order->discount_amount) }}</td></tr>
    @endif
    @if ((float) $order->delivery_fee > 0)
        <tr><td style="{{ $line }} color: #6B6A64;">Livraison</td><td align="right" style="{{ $line }}">{{ $money($order->delivery_fee) }}</td></tr>
    @endif
    @if (($showFees ?? true) && $fees > 0)
        <tr><td style="{{ $line }} color: #6B6A64;">Frais de paiement</td><td align="right" style="{{ $line }}">{{ $money($fees) }}</td></tr>
    @endif
    <tr>
        <td style="padding: 10px 0 0; font-size: 15px; font-weight: 700; border-top: 1px solid #ECEAE4;">{{ (float) $order->balance_due > 0 ? ($isPaid ? 'Acompte payé' : 'Acompte à payer') : ($isPaid ? 'Total payé' : 'Total') }}</td>
        <td align="right" style="padding: 10px 0 0; font-size: 15px; font-weight: 700; border-top: 1px solid #ECEAE4;">{{ $money($order->total_client) }}</td>
    </tr>
    @if ((float) $order->balance_due > 0)
        <tr><td style="{{ $line }} color: #6B6A64;">Solde à régler à la livraison</td><td align="right" style="{{ $line }}">{{ $money($order->balance_due) }}</td></tr>
    @endif
</table>
