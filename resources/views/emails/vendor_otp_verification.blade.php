<x-mail::message>
# Bienvenue sur BIOLINKO

Bonjour **{{ $user->name }}**,

Merci de votre inscription comme vendeur sur **BIOLINKO**. Pour valider la création de votre boutique e-commerce, veuillez saisir le code de vérification à 6 chiffres ci-dessous :

<x-mail::panel>
<h1 style="text-align: center; letter-spacing: 6px; color: #0f172a; font-size: 32px; margin: 0;">{{ $otp }}</h1>
</x-mail::panel>

*Ce code expire dans 15 minutes.*

Si vous n'avez pas demandé la création de ce compte, aucune action n'est requise.

Cordialement,<br>
**L'Équipe BIOLINKO 🇨🇲**
</x-mail::message>

