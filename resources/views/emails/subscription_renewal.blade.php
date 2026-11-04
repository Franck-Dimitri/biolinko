@php
    $money = fn ($v) => number_format((float) $v, 0, ',', ' ').' FCFA';
    $plan = ucfirst($user->plan);
    $date = $user->subscription_expires_at?->locale('fr')->isoFormat('D MMMM YYYY');
@endphp
<x-mail::message>
Bonjour **{{ $user->name }}**,

@if ($type === 'upcoming')
Votre abonnement **{{ $plan }}** arrive à échéance le **{{ $date }}**.

@if ($user->auto_renew)
Ce jour-là, **{{ $money($amount) }}** seront prélevés automatiquement sur le solde de votre portefeuille Biolinko pour le renouveler d’un mois. Votre solde disponible aujourd’hui : **{{ $money($balance) }}**.

@if ($balance < $amount)
Votre solde est insuffisant pour le moment : il sera complété par vos prochaines ventes, ou vous pouvez payer dès maintenant par Mobile Money.
@endif

Vous préférez payer vous-même ? Vous pouvez **désactiver le prélèvement automatique** et payer manuellement, par **Mobile Money** ou avec **votre solde**, depuis la page Abonnement.
@else
Le prélèvement automatique est désactivé : pensez à renouveler votre abonnement, par **Mobile Money** ou avec **votre solde** ({{ $money($balance) }} disponibles), pour garder vos avantages.
@endif
@elseif ($type === 'renewed')
Votre abonnement **{{ $plan }}** est renouvelé jusqu’au **{{ $date }}**. **{{ $money($amount) }}** ont été prélevés sur votre portefeuille. Solde restant : **{{ $money($balance) }}**.

Pour payer vous-même la prochaine fois, désactivez le prélèvement automatique depuis la page Abonnement.
@else
Nous n’avons pas pu renouveler votre abonnement **{{ $plan }}** : votre solde disponible (**{{ $money($balance) }}**) ne couvre pas les **{{ $money($amount) }}** du mois.

Nous réessaierons pendant {{ \App\Payments\SubscriptionRenewals::RETRY_DAYS }} jours. Pour ne pas perdre vos avantages, renouvelez dès maintenant **par Mobile Money**.
@endif

<x-mail::button :url="route('seller.subscriptions.index')">
Gérer mon abonnement
</x-mail::button>

L’équipe Biolinko
</x-mail::message>
