<x-mail::message>
# Notification Officielle de Modération BIOLINKO

Bonjour **{{ $user->name }}**,

@if ($type === 'product_deleted')
Nous vous informons qu'un produit publié sur votre vitrine a été **retiré et supprimé** par l'équipe de supervision de la plateforme :

**Article concerné :** {{ $itemName }}

@elseif ($type === 'store_deleted')
Nous vous informons que votre vitrine e-commerce **{{ $itemName }}** a été **définitivement supprimée** par l'équipe de modération de la plateforme :

@elseif ($type === 'store_suspended')
Nous vous informons que votre vitrine e-commerce **{{ $itemName }}** a été **suspendue et repassée en mode brouillon** par l'équipe de modération de la plateforme.

@elseif ($type === 'account_banned')
Nous vous informons que l'accès à votre compte vendeur **{{ $user->name }}** ({{ $user->email }}) a été **temporairement restreint / suspendu** par l'équipe de sécurité et conformité.

@elseif ($type === 'account_unbanned')
Votre compte vendeur a été réexaminé et **réactivé avec succès**. Vous pouvez de nouveau vous connecter et reprendre vos activités commerciales.
@endif

<x-mail::panel>
### Motif communiqué par l'équipe de supervision :
_{{ $reason }}_
</x-mail::panel>

### Que faire maintenant ?
Si vous estimez qu'il s'agit d'une erreur ou si vous avez mis votre vitrine et vos produits en conformité avec nos conditions générales d'utilisation, vous pouvez contacter notre support officiel :

- ✉️ **Email du support :** support@biolinko.app
- 🌐 **Centre d'assistance :** [https://biolinko.mrdims.dev](https://biolinko.mrdims.dev)

Cordialement,<br>
**L'Équipe de Conformité &amp; Modération BIOLINKO 🇨🇲**
</x-mail::message>
