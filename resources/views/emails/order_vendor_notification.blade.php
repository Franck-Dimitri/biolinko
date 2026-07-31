<x-mail::message>
# Félicitations ! Nouvelle Vente Encaissée

Bonjour **{{ $order->store->user->name ?? 'Vendeur' }}**,

Une nouvelle commande vient d'être validée et payée par Mobile Money sur votre boutique **{{ $order->store->name ?? 'BIOLINKO' }}** !

<x-mail::panel>
**Commande :** #{{ $order->tracking_code }}<br>
**Client :** {{ $order->customer_name }} ({{ $order->customer_phone }})<br>
**Montant Vendeur Crédité :** **{{ number_format((float) ($order->price_vendor ?? 0), 0, ',', ' ') }} FCFA**
</x-mail::panel>

### Articles de la commande :
@if($order->items && count($order->items) > 0)
@foreach($order->items as $item)
- **{{ $item->product_name }}** x {{ $item->quantity }} ({{ number_format((float) ($item->unit_price ?? 0), 0, ',', ' ') }} FCFA)
@endforeach
@else
- **Article Commandé** ({{ number_format((float) ($order->total_client ?? 0), 0, ',', ' ') }} FCFA)
@endif

**La facture officielle PDF est rattachée en pièce jointe à cet e-mail.**

<x-mail::button :url="route('orders.index')">
Consulter mes Commandes
</x-mail::button>

Merci de votre confiance,<br>
**L'Équipe BIOLINKO 🇨🇲**
</x-mail::message>

