@php
    $money = fn ($n) => number_format((float) $n, 0, ',', ' ').' FCFA';
    $operator = ['MTN' => 'MTN Mobile Money', 'ORANGE' => 'Orange Money'][strtoupper((string) $order->payment_operator)] ?? 'Mobile Money';
    $heading = 'Nouvelle commande de '.$order->customer_name;
    $preheader = $order->customer_name.' a payé '.$money($order->total_client).' sur '.$theme['name'].'.';
    $phone = $order->customer_whatsapp ?: $order->customer_phone;
@endphp
@extends('emails.layout')

@section('content')
<p style="margin: 0 0 14px;">{{ $order->customer_name }} vient de payer {{ $money($order->total_client) }} par {{ $operator }} sur {{ $theme['name'] }}.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F6F5F1; border-radius: 10px;">
    <tr>
        <td style="padding: 14px 16px; font-size: 14px;">
            <div style="font-size: 13px; color: #6B6A64;">Pour vous, après la commission Biolinko</div>
            <div style="font-size: 20px; font-weight: 700;">{{ $money($order->sellerNet()) }}</div>
            <div style="font-size: 13px; color: #6B6A64;">Retirable une fois la commande reçue par le client.@if ((float) $order->balance_due > 0) Le client vous réglera aussi {{ $money($order->balance_due) }} à la livraison.@endif</div>
        </td>
    </tr>
</table>

<p style="margin: 20px 0 0; font-size: 14px; color: #6B6A64;">Commande <strong style="color: {{ \App\Support\MailTheme::INK }};">{{ $order->tracking_code }}</strong></p>
@include('emails.partials.order_items', ['order' => $order])

<p style="margin: 18px 0 0; font-size: 14px;">
    <strong>Client</strong><br>
    {{ $order->customer_name }}@if ($phone) · {{ $phone }}@endif<br>
    @if ($order->address_details || $order->city){{ collect([$order->address_details, $order->city])->filter()->implode(', ') }}<br>@endif
    @if ($order->desired_date)Date souhaitée : {{ \Illuminate\Support\Carbon::parse($order->desired_date)->locale('fr')->isoFormat('dddd D MMMM') }}{{ $order->desired_slot ? ', '.$order->desired_slot : '' }}@endif
</p>

@include('emails.partials.button', ['url' => route('orders.index'), 'label' => 'Voir la commande'])

<p style="margin: 14px 0 0; font-size: 14px; color: #5F5E58;">La facture est jointe à cet e-mail. Une fois la commande livrée, marquez-la « livrée » dans vos commandes.</p>
@endsection

@section('footer')
Vous recevez cet e-mail à chaque nouvelle commande sur {{ $theme['name'] }}. <a href="{{ \App\Support\Seo::url('/') }}" style="color: #8B8A83;">Biolinko</a>
@endsection
