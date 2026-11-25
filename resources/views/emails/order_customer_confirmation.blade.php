@php
    $money = fn ($n) => number_format((float) $n, 0, ',', ' ').' FCFA';
    $first = trim(explode(' ', (string) $order->customer_name)[0]) ?: 'et bienvenue';
    $operator = ['MTN' => 'MTN Mobile Money', 'ORANGE' => 'Orange Money'][strtoupper((string) $order->payment_operator)] ?? 'Mobile Money';
    $paidNow = (float) $order->balance_due > 0 ? 'l’acompte de '.$money($order->total_client) : $money($order->total_client);
    $heading = 'Merci pour votre commande, '.$first;
    $preheader = 'Paiement reçu. '.$theme['name'].' prépare votre commande '.$order->tracking_code.'.';
@endphp
@extends('emails.layout')

@section('content')
<p style="margin: 0 0 12px;">Nous avons bien reçu {{ $paidNow }} par {{ $operator }}. {{ $theme['name'] }} prépare votre commande.</p>
<p style="margin: 0; font-size: 14px; color: #6B6A64;">Commande <strong style="color: {{ \App\Support\MailTheme::INK }};">{{ $order->tracking_code }}</strong> · {{ ($order->paid_at ?? $order->created_at)?->locale('fr')->isoFormat('D MMMM YYYY') }}</p>

@include('emails.partials.order_items', ['order' => $order])

@if ($order->city || $order->address_details || $order->desired_date)
    <p style="margin: 18px 0 0; font-size: 14px;">
        <strong>Livraison</strong><br>
        @if ($order->address_details || $order->city){{ collect([$order->address_details, $order->city])->filter()->implode(', ') }}<br>@endif
        @if ($order->desired_date)Date souhaitée : {{ \Illuminate\Support\Carbon::parse($order->desired_date)->locale('fr')->isoFormat('dddd D MMMM') }}{{ $order->desired_slot ? ', '.$order->desired_slot : '' }}@endif
    </p>
@endif

@include('emails.partials.button', ['url' => \App\Support\StoreUrl::track($order), 'label' => 'Suivre ma commande'])

<p style="margin: 14px 0 0; font-size: 14px; color: #5F5E58;">
    Votre facture est jointe à cet e-mail.
    @if ($theme['whatsapp'])Pour toute question sur la livraison, écrivez à {{ $theme['name'] }} sur WhatsApp au {{ $theme['whatsapp'] }}.@endif
</p>
@if ($theme['show_biolinko'])
    <p style="margin: 14px 0 0; font-size: 13px; color: #8B8A83;">Votre paiement est protégé : il n’est versé à la boutique qu’une fois la commande reçue.</p>
@endif
@endsection
