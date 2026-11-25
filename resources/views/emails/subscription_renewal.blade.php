@php
    $money = fn ($v) => number_format((float) $v, 0, ',', ' ').' FCFA';
    $plan = ucfirst($user->plan);
    $date = $user->subscription_expires_at?->locale('fr')->isoFormat('D MMMM YYYY');
    $heading = match ($type) { 'renewed' => 'Abonnement renouvelé', 'failed' => 'Renouvellement impossible', default => 'Votre abonnement arrive à échéance' };
    $p = 'margin: 0 0 12px;';
@endphp
@extends('emails.layout')

@section('content')
<p style="{{ $p }}">Bonjour {{ $user->name }},</p>

@if ($type === 'upcoming')
    <p style="{{ $p }}">Votre abonnement <strong>{{ $plan }}</strong> arrive à échéance le <strong>{{ $date }}</strong>{{ $daysLeft ? ', dans '.$daysLeft.' jours' : '' }}.</p>
    @if ($user->auto_renew)
        <p style="{{ $p }}">Ce jour-là, <strong>{{ $money($amount) }}</strong> seront prélevés sur le solde de votre portefeuille Biolinko pour le renouveler d’un mois. Solde disponible aujourd’hui : <strong>{{ $money($balance) }}</strong>.</p>
        @if ($balance < $amount)
            <p style="{{ $p }}">Votre solde ne suffit pas pour le moment : vos prochaines ventes le compléteront, ou vous pouvez payer dès maintenant par Mobile Money.</p>
        @endif
        <p style="{{ $p }}">Vous préférez payer vous-même ? Désactivez le prélèvement automatique et payez par Mobile Money ou avec votre solde, depuis la page Abonnement.</p>
    @else
        <p style="{{ $p }}">Le prélèvement automatique est désactivé : pensez à renouveler votre abonnement, par Mobile Money ou avec votre solde ({{ $money($balance) }} disponibles), pour garder vos avantages.</p>
    @endif
@elseif ($type === 'renewed')
    <p style="{{ $p }}">Votre abonnement <strong>{{ $plan }}</strong> est renouvelé jusqu’au <strong>{{ $date }}</strong>. {{ $money($amount) }} ont été prélevés sur votre portefeuille. Solde restant : {{ $money($balance) }}.</p>
    <p style="{{ $p }}">Pour payer vous-même la prochaine fois, désactivez le prélèvement automatique depuis la page Abonnement.</p>
@else
    <p style="{{ $p }}">Nous n’avons pas pu renouveler votre abonnement <strong>{{ $plan }}</strong> : votre solde disponible ({{ $money($balance) }}) ne couvre pas les {{ $money($amount) }} du mois.</p>
    <p style="{{ $p }}">Nous réessaierons pendant {{ \App\Payments\SubscriptionRenewals::RETRY_DAYS }} jours. Pour garder vos avantages, renouvelez dès maintenant par Mobile Money.</p>
@endif

@include('emails.partials.button', ['url' => route('seller.subscriptions.index'), 'label' => 'Gérer mon abonnement'])
@endsection
