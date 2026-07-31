<x-mail::message>
# Merci pour votre commande !

Bonjour **{{ $order->customer_name }}**,

Votre commande **#{{ $order->tracking_code }}** effectuée auprès de la boutique **{{ $order->store->name ?? 'BIOLINKO' }}** a bien été confirmée et réglée par Mobile Money 🇨🇲.

<x-mail::panel>
**Code de Suivi :** `#{{ $order->tracking_code }}`<br>
**Montant Réglé :** **{{ number_format($order->total_client, 0, ',', ' ') }} FCFA**<br>
**Statut :** Payé & En cours de préparation
</x-mail::panel>

**Votre facture d'achat officielle PDF avec QR Code est disponible en pièce jointe.**

<x-mail::button :url="route('order.track', $order->tracking_code)">
Suivre ma Livraison en Direct
</x-mail::button>

En cas de question sur votre livraison, vous pouvez contacter directement le vendeur sur WhatsApp au **{{ $order->store->user->phone_whatsapp ?? '' }}**.

Merci d'avoir acheté sur **BIOLINKO** !

<div style="text-align: center; margin-top: 25px; padding: 12px; background-color: #fffbe6; border: 1px dashed #fef08a; border-radius: 12px; font-size: 11px; color: #92400e; font-weight: bold; letter-spacing: 1px;">
    ⚡ FILIGRANE SÉCURISÉ BIOLINKO — REÇU OFFICIEL DE PAIEMENT 🇨🇲
</div>
</x-mail::message>

