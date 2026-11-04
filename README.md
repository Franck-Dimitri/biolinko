# Biolinko

**La boutique en ligne payée en Mobile Money, pour les vendeurs qui vendent sur WhatsApp, Instagram et TikTok.**

Domaine : [biolinko.link](https://biolinko.link) · Interface 100 % en français · Montants en FCFA.

Un vendeur crée sa boutique en quelques minutes, partage un lien unique, et ses clients paient par **MTN MoMo** ou **Orange Money** sans carte bancaire. L'argent arrive sur son portefeuille Biolinko, d'où il le retire vers son Mobile Money.

---

## Sommaire

1. [Fonctionnalités](#1-fonctionnalités)
2. [Modèle économique](#2-modèle-économique)
3. [Stack technique](#3-stack-technique)
4. [Installation locale](#4-installation-locale)
5. [Configuration (.env)](#5-configuration-env)
6. [Paiements Mobile Money](#6-paiements-mobile-money)
7. [Circuit de l'argent](#7-circuit-de-largent)
8. [WhatsApp et e-mails](#8-whatsapp-et-e-mails)
9. [Référencement (SEO)](#9-référencement-seo)
10. [Tâches planifiées](#10-tâches-planifiées)
11. [Architecture du code](#11-architecture-du-code)
12. [Routes principales](#12-routes-principales)
13. [Tests](#13-tests)
14. [Mise en production](#14-mise-en-production)
15. [Sécurité](#15-sécurité)
16. [Limites connues et pistes](#16-limites-connues-et-pistes)

---

## 1. Fonctionnalités

### Vitrine publique (côté client)
- **Boutique** à l'adresse `biolinko.link/{slug}` : bannière, présentation, catégories, recherche, best-sellers, promotions, packs, avis, à propos et contact WhatsApp.
- **Personnalisation** : couleur de la boutique (le texte s'adapte automatiquement pour rester lisible), sections activables et réordonnables, réseaux sociaux, horaires, ville.
- **Page produit** `/{slug}/p/{produit}` : galerie photos, variantes (taille, couleur, prix et stock propres), stock affiché, promotion avec prix barré, partage, produits similaires.
- **Catégories** : filtre dans la vitrine et lien direct `/{slug}?categorie=Robes`.
- **Avis par produit** : note moyenne, liste, formulaire. Le badge **« Achat vérifié »** n'est donné qu'avec le numéro d'une commande **payée** contenant ce produit.
- **Panier et paiement en une page** :
  - numéro Mobile Money, opérateur détecté automatiquement ;
  - **numéro WhatsApp** (le même par défaut, ou un autre) ;
  - ville de livraison avec son prix ;
  - **code promo** ;
  - **acompte** (si le vendeur le propose) ;
  - récapitulatif détaillé.
- **Paiement** : demande envoyée sur le téléphone du client (USSD push), suivi en direct, puis redirection vers le suivi de commande.
- **Suivi de commande** `/track/{code}` :
  - avancement en étapes ;
  - **facture PDF réelle** à imprimer ;
  - nouvel essai de paiement si la tentative précédente a échoué (pendant 7 jours) ;
  - signalement d'un problème pendant le délai de sécurité ;
  - contact WhatsApp du vendeur.
- **Packs (liens de paiement)** `/pay/{code}` : plusieurs produits à un prix remisé, partageables en un lien.
- Pixels **Meta, TikTok et Google Analytics** du vendeur (plan Pro et plus).

### Espace vendeur (`/seller/...`)
- **Accueil** : chiffre d'affaires, net après commission, montant en attente du délai de sécurité, graphiques, actions conseillées.
- **Produits** :
  - photos (compression côté navigateur), variantes, stock, quantité minimum, promotions (Pro) ;
  - catégorie avec suggestions ;
  - **titre et description Google** avec aperçu du résultat.
- **Commandes** :
  - filtres et détail ;
  - commission, livraison, remise, acompte et solde à encaisser ;
  - statuts : payée, en livraison, livrée ;
  - message WhatsApp prérempli avec le lien de suivi ;
  - **remboursement** total ou partiel ;
  - réponse aux signalements ;
  - export comptable CSV et Excel (Business).
- **Clients** :
  - fichier client et clients fidèles ;
  - **paniers à relancer** en 1 clic : non payés ou paiement échoué, relances datées, paniers récupérés comptés sur le mois ;
  - **campagnes WhatsApp en 1 clic**, avec un quota mensuel selon le plan.
- **Factures** : numérotées F-AAAA-0001, PDF, factures manuelles (vente en magasin ou par WhatsApp), relance par WhatsApp ou par e-mail, marquage payé.
- **Liens de paiement** (packs) : prix du pack, date d'expiration, limite d'utilisations, vues et ventes. Nombre de liens actifs limité par plan.
- **Livraison & promos** :
  - **Livraison** : zones (ville et prix), tarif pour les autres villes ou pas de livraison ailleurs, livraison offerte dès un montant.
  - **Acompte** : de 20 à 90 % payés en ligne, le solde en espèces au livreur.
  - **Codes promo** : en pourcentage ou en montant fixe, achat minimum, limite d'utilisations, date de fin, statistiques par code. Nombre de codes actifs limité par plan.
- **Portefeuille** : solde disponible, en attente et en cours de retrait ; relevé (ventes, retraits, abonnements) ; demande de retrait vers MTN ou Orange.
- **Marketing** : indicateurs sur 30 jours, actions recommandées, partage de la boutique, pixels publicitaires, **carte Référencement Google** (titre et description de la boutique, liste de 5 bonnes pratiques).
- **Apparence** : éditeur de la vitrine, publication et dépublication, modération des avis.
- **Abonnement** :
  - comparaison des 4 plans, paiement par **Mobile Money** ou **avec le solde** ;
  - remise de 15 % sur 1 an et de 20 % sur 2 ans ;
  - jours restants convertis en cas de changement de plan ;
  - **prélèvement automatique** désactivable.
- **Outils**, **Profil** (numéro WhatsApp obligatoire).

### Administration (`/admin/...`)
- **Tableau de bord** : revenus Biolinko, éléments à traiter (retraits, signalements, boutiques à contrôler), graphiques.
- **Utilisateurs** : fiche détaillée, attribution d'un plan, bannissement, suspension de boutique.
- **Boutiques** : filtres par statut, signalements, modération (suspension uniquement, pas de suppression).
- **Produits** : modération.
- **Abonnements**.
- **Transactions** : toutes les commandes, **remboursement en arbitrage de litige**.
- **Retraits** : virer automatiquement, marquer payé, rejeter.
- **Portefeuille Biolinko** : revenus réels (commissions, frais, abonnements) moins les coûts de l'agrégateur.
- **Réglages** (lecture seule) : paiements, WhatsApp et modèles de messages Meta, système.

---

## 2. Modèle économique

Tous les taux sont dans `config/payments.php`.

| Élément | Valeur |
|---|---|
| Frais de service payés par le client | **3,5 %** du montant payé en ligne (livraison comprise) |
| Commission Biolinko sur chaque vente | Starter **10 %** · Pro **7 %** · Growth **5 %** · Business **3 %** (seule rémunération, hors livraison) |
| Assiette de la commission | Articles après remise. **Jamais sur la livraison** |
| Frais de retrait vendeur | **Gratuit** (le virement Mercy Pay de 2 % est couvert par la commission), retrait minimum 1 000 FCFA |
| Commande minimum payée en ligne | **1 000 FCFA** (équivalent fixé par pays) |
| Délai de sécurité avant retrait | **4 jours**, puis **2 jours** après 10 ventes livrées |
| Vente signalée par le client | Gelée jusqu'à résolution |

**Plans** (prix mensuels dans `User::PLAN_PRICES`, limites dans `User::PLAN_LIMITS`) :

| Plan | Prix / mois | Produits | Stock | Photos / produit | Liens de paiement actifs | Codes promo actifs |
|---|---|---|---|---|---|---|
| Starter | 0 | 5 | 50 | 2 | 2 | 1 |
| Pro | 2 500 FCFA | 30 | 300 | 5 | 10 | 5 |
| Growth | 7 000 FCFA | 100 | 1 500 | 8 | illimité | illimité |
| Business | 12 000 FCFA | illimité | illimité | 10 | illimité | illimité |

Réservé au plan Pro et plus : promotions produit, plus d'une variante par produit, pixels publicitaires, packs dans les campagnes WhatsApp. Réservé au plan Business : export comptable.

---

## 3. Stack technique

| Couche | Technologie |
|---|---|
| Serveur | PHP 8.3+ · **Laravel 13** · Sanctum · DomPDF (factures) · Simple QrCode |
| Pont front-back | **Inertia.js 2** · Ziggy (routes Laravel côté JavaScript) |
| Interface | **React 19** · Tailwind CSS 3 · framer-motion · lucide-react · sonner (notifications) · Headless UI |
| Build | Vite 6, avec rendu serveur Inertia (`resources/js/ssr.jsx`) |
| Base de données | SQLite en local, MySQL ou MariaDB conseillé en production |
| Tests | **Pest 4** |
| Paiement | Mercy Pay (principal), pawaPay, HR-Skills (historique) |
| Messagerie | E-mail (Laravel Mail) · API officielle WhatsApp Cloud de Meta (en veille) |

Les conventions de design et d'animation sont décrites dans `.claude/skills/biolinko-design` et `.claude/skills/biolinko-motion`.

---

## 4. Installation locale

Prérequis : PHP 8.3+ avec les extensions `pdo_sqlite`, `gd`, `mbstring` et `intl` ; Composer ; Node 20+.

```bash
git clone <dépôt> biolinko && cd biolinko
composer install
npm install

cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan db:seed                  # crée le compte admin (admin@biolinko.app)
php artisan storage:link             # photos des produits servies depuis /storage

composer run dev                     # serveur, file d'attente, logs et Vite en parallèle
# ou séparément : php artisan serve  +  npm run dev
```

Après le seed, **changez le mot de passe de l'admin** (défini dans `database/seeders/AdminUserSeeder.php`).

Pour tester les paiements sans argent réel en local :
- `PAYMENT_DRIVER=pawapay` avec `PAWAPAY_ENV=sandbox` et un jeton sandbox, **ou** une clé Mercy Pay `mp_sandbox_…` ;
- `SUBSCRIPTION_PAYMENT_MODE=simulation` pour simuler le paiement des abonnements ;
- `MAIL_MAILER=log` : les e-mails partent dans `storage/logs/laravel.log` ;
- `WHATSAPP_DRIVER=off`.

---

## 5. Configuration (.env)

| Variable | Rôle |
|---|---|
| `APP_URL` | **Adresse publique** (`https://biolinko.link` en production). Sert aux adresses canoniques, au plan du site, aux aperçus de partage et aux liens envoyés |
| `APP_LOCALE` | `fr` |
| `DB_*` | Base de données |
| `MAIL_*` | Envoi des e-mails : OTP d'inscription, factures, notifications, rappels d'abonnement |
| `PAYMENT_DRIVER` | Agrégateur des nouveaux paiements : `mercypay`, `pawapay` ou `hrskills` |
| `PAYOUT_DRIVER` | Agrégateur des virements (retraits et remboursements). Par défaut, celui de `PAYMENT_DRIVER` |
| `MERCYPAY_API_KEY` | `mp_sandbox_…` ou `mp_live_…` |
| `MERCYPAY_WEBHOOK_SECRET` | Secret de signature des webhooks Mercy Pay |
| `MERCYPAY_BASE_URL` | `https://mercy-pay.com` par défaut |
| `PAWAPAY_ENV`, `PAWAPAY_API_TOKEN` | pawaPay : `sandbox` ou `production` |
| `HRSKILLS_PAY_*` | Ancien agrégateur, conservé pour suivre les opérations passées |
| `SUBSCRIPTION_PAYMENT_MODE` | `live` ou `simulation` (abonnements simulés, rien n'est débité) |
| `WHATSAPP_DRIVER` | `off` (envois en 1 clic depuis le téléphone du vendeur) ou `cloud` (envois automatiques par l'API Meta) |
| `WHATSAPP_CLOUD_*` | Jeton, ID du numéro, ID du compte WhatsApp Business, secret d'application, jeton de vérification du webhook, version de l'API, URL publique |
| `GOOGLE_SITE_VERIFICATION` | Valeur de la balise de validation Google Search Console |
| `INERTIA_SSR_ENABLED` | Rendu serveur Inertia (facultatif ; le référencement fonctionne sans) |

**Ne jamais commiter `.env` ni écrire une clé dans le code.** Toutes les clés vont uniquement dans `.env`.

---

## 6. Paiements Mobile Money

### Abstraction
- `App\Payments\PaymentGateway` est le contrat commun : `deposit`, `depositStatus`, `payout`, `payoutStatus`.
- Les drivers se trouvent dans `app/Payments/Gateways` : `MercyPayGateway`, `PawapayGateway`, `HrSkillsGateway`.
- `PaymentManager::driver($name)` choisit l'agrégateur. Une opération déjà lancée est **toujours suivie chez l'agrégateur qui l'a traitée**.
- Les services métier :
  - `OrderPayments` : paiement d'une commande ;
  - `SubscriptionPayments` : paiement d'un abonnement ;
  - `SubscriptionRenewals` : paiement avec le solde et renouvellement automatique ;
  - `OrderRefunds` : remboursement d'une commande.

### Garanties
- **Idempotence** : la référence Biolinko (UUID) est enregistrée **avant** l'appel à l'agrégateur, et envoyée comme `Idempotency-Key` chez Mercy Pay ou comme `depositId` chez pawaPay. Si la réponse se perd, le paiement reste retrouvable.
- **Webhooks** :
  - Mercy Pay : signature HMAC-SHA256 (`X-MercyPay-Signature`) vérifiée sur le corps brut, puis déduplication par identifiant d'événement ;
  - pawaPay et Mercy Pay : **le statut est toujours redemandé à l'agrégateur** avant d'agir.
- **Filet de sécurité** : `payments:sync` interroge l'agrégateur pour toute opération restée en attente.
- **Opérations sensibles sous verrou de base de données et exécutées une seule fois** : `Order::markAsPaid`, `Order::releaseFunds`, `Withdrawal::settle`, `Subscription::activate`, `Refund::settle`.

### Pays (`config/payments.php` › `countries`)
- **11 pays Mercy Pay** sont configurés : Cameroun, Congo, Bénin, Côte d'Ivoire, Sénégal, RD Congo, Rwanda, Sierra Leone, Ouganda, Zambie, Ghana.
- Pour chacun : indicatif, devise, nombre de décimales, longueur des numéros, opérateurs, préfixes de détection d'opérateur et minimum de commande.
- **Seul le Cameroun est activé** (`enabled`).
- `App\Payments\Countries` gère le formatage des numéros, la détection d'opérateur, le minimum par pays et la conversion en unités mineures (devises à 2 décimales).

### Spécificités
- **Mercy Pay** :
  - les virements n'existent qu'en live (clé `mp_live_` et KYC approuvé) ;
  - 2 % sont retenus sur chaque virement : Biolinko demande donc le montant net divisé par 0,98 ;
  - **il n'y a pas d'API de remboursement** : un remboursement est un virement vers le numéro qui a payé.
- **pawaPay** : M-Pesa (RD Congo) refuse les décimales, les montants entiers sont donc envoyés sans virgule.

---

## 7. Circuit de l'argent

1. **Commande** (`CheckoutController::process`) :
   - montant des articles, ou prix du pack ;
   - moins le **code promo** ;
   - plus la **livraison**, ce qui donne `price_vendor`, le montant du vendeur ;
   - plus **3,5 %** de frais client, ce qui donne `total_client`, le montant payé en ligne.
   - Avec l'**acompte**, seule une part est payée en ligne (`balance_due` correspond au solde dû au livreur).
2. **Paiement confirmé** (`Order::markAsPaid`) :
   - la commission est figée selon le plan, sur les articles uniquement ;
   - le stock est décrémenté ;
   - le compteur du code promo et celui du pack sont incrémentés ;
   - la fiche client est mise à jour ;
   - le net du vendeur part sur `balance_held` (en attente) ;
   - la facture est numérotée et envoyée par e-mail.
3. **Délai de sécurité** (`funds:release`) : à son terme, la vente passe sur `balance_available`. Une vente signalée reste gelée.
4. **Retrait** : 3 % de frais. Virement automatique par l'admin, ou marquage manuel.
5. **Remboursement** (`OrderRefunds`) :
   - le montant maximum est la part payée en ligne pour le vendeur ;
   - la commission est rendue au prorata ;
   - le vendeur est débité, d'abord sur l'argent en attente, sinon sur le disponible ;
   - en cas d'échec du virement, tout est restauré.
6. **Abonnement payé avec le solde** : prélevé sur `balance_available`, sous verrou.

**Une seule définition du chiffre d'affaires** : `Order::scopePaid()`, c'est-à-dire `payment_status = 'paid'`.

---

## 8. WhatsApp et e-mails

- **Mode actuel (`WHATSAPP_DRIVER=off`)** :
  - tous les messages WhatsApp partent **en 1 clic depuis le téléphone du vendeur**, par des liens `wa.me` préremplis : commande, suivi, relance de panier, rappel de facture, campagnes ;
  - les notifications automatiques passent par **e-mail**.
- **Mode `cloud`** : envois automatiques par l'API officielle Meta, avec des modèles de messages approuvés (`php artisan whatsapp:sync-templates`, suffixe `_v2`). Tout passe par `WhatsappGatewayService::automatic()`. Ce mode est bloqué tant que le portefeuille Business Meta n'est pas vérifié.
- **Numéros WhatsApp collectés** :
  - **vendeur** : obligatoire à l'inscription, enregistré au format `+237…`. Un bandeau le demande aux comptes plus anciens ;
  - **client** : demandé à chaque achat (le même que le Mobile Money par défaut), enregistré sur la commande et sur la fiche client.
- **E-mails envoyés** :
  - OTP d'inscription ;
  - confirmation client avec facture ;
  - notification au vendeur ;
  - modération ;
  - rappels d'abonnement à **J-7, J-4 et J-2**, puis renouvellement confirmé ou solde insuffisant.

---

## 9. Référencement (SEO)

Google, WhatsApp, Facebook et TikTok lisent le **HTML brut**. Toutes les balises sont donc **générées côté serveur** par `App\Support\Seo`, puis rendues par `resources/views/partials/seo.blade.php`.

- **Pour chaque page publique** :
  - `<title>` et meta description uniques, générés automatiquement ou personnalisés par le vendeur ;
  - adresse canonique ;
  - Open Graph et Twitter, prix produit (`product:price:*`) ;
  - langue `fr`.
- **Données structurées JSON-LD** :
  - **Product** avec Offer (prix, devise, disponibilité), AggregateRating et Review ;
  - **BreadcrumbList** ;
  - **OnlineStore** et **ItemList** des produits ;
  - **Organization** et **WebSite** sur l'accueil.
- **Indexation** :
  - **noindex par défaut** pour tout ce qui n'est pas public : espace vendeur et admin, suivi, panier, boutiques non publiées, packs, erreurs ;
  - **`/sitemap.xml`** dynamique, avec images, mis en cache 1 h : uniquement les boutiques publiées de vendeurs non suspendus et leurs produits actifs ;
  - **`/robots.txt`** dynamique : bloque les espaces privés et indique le plan du site.
- **Image de partage par défaut** : `public/images/brand/og-biolinko.jpg` (1200 × 630), utilisée quand une boutique n'a pas de bannière.
- **Côté vendeur** : champs SEO par produit et par boutique, aperçu du résultat Google, liste de bonnes pratiques dans Marketing.

---

## 10. Tâches planifiées

Elles sont définies dans `routes/console.php`. **Le cron est obligatoire en production :**

```cron
* * * * * cd /chemin/vers/biolinko && php artisan schedule:run >> /dev/null 2>&1
```

| Commande | Fréquence | Rôle |
|---|---|---|
| `payments:sync` | 5 min | Met à jour les paiements, virements et remboursements restés en attente |
| `funds:release` | 15 min | Libère les ventes dont le délai de sécurité est passé |
| `orders:remind-unpaid` | 15 min | Relance automatique des commandes non payées (uniquement en mode WhatsApp `cloud`) |
| `orders:expire-unpaid` | 1 h | Annule les commandes non payées depuis 24 h. Elles restent relançables 7 jours |
| `subscriptions:renew` | 1 h | Rappels à J-7, J-4 et J-2 ; prélèvement sur le solde le jour J, avec de nouveaux essais pendant 3 jours |
| `whatsapp:sync-templates` | manuel | Soumet ou synchronise les modèles de messages Meta |

Une file d'attente (`php artisan queue:work`) est conseillée en production pour les e-mails.

---

## 11. Architecture du code

```
app/
  Console/Commands/      Tâches planifiées (voir §10)
  Http/Controllers/      Vitrine, tunnel d'achat, espace vendeur ; Admin/ pour l'administration
  Http/Middleware/       Rôles (role:seller, role:admin), plan minimum (plan:pro…), props Inertia partagées
  Mail/                  E-mails (OTP, commandes, modération, renouvellement)
  Models/                User, Store, Product, ProductVariant, Order, OrderItem, Customer, Wallet,
                         Withdrawal, Subscription, SmartLink, PromoCode, Refund, StoreReview,
                         OrderReport, WhatsappCampaign
  Payments/              Abstraction des paiements (voir §6)
  Services/              Factures PDF, export des ventes, WhatsApp
  Support/Seo.php        Référencement
config/payments.php      Frais, commissions, minimums, pays, agrégateurs
resources/js/
  Pages/                 Pages Inertia (Storefront, SmartLink, OrderTracking, Seller, Admin, Auth…)
  Components/Dashboard/  Kit d'interface des espaces vendeur et admin (UI.jsx, RefundBox…)
  Components/Storefront/ Vitrine, panier, tunnel d'achat (CheckoutForm, OrderSummary), avis produit
  Layouts/               AuthenticatedLayout (vendeur et admin), StorefrontLayout
resources/views/         app.blade.php, partials/seo, e-mails, facture PDF
routes/web.php           Toutes les routes (les routes de boutique /{slug} sont en dernier)
tests/Feature/           Tests Pest
```

**Règles de conception à respecter :**
- **Slugs réservés** (`User::RESERVED_SLUGS`) : aucune boutique ne peut prendre le nom d'une route de l'application.
- **Une boutique et un portefeuille par vendeur**, créés dès l'inscription (`User::ensureStore()`).
- **Un nouveau statut d'argent passe toujours par une méthode verrouillée du modèle**, jamais par une mise à jour directe.

---

## 12. Routes principales

| Public | |
|---|---|
| `/` | Accueil |
| `/{slug}` | Boutique |
| `/{slug}/p/{produit}` | Page produit |
| `/pay/{code}` | Pack, ou lien de paiement |
| `/track/{code}` · `/track/{code}/facture` | Suivi de commande · facture PDF |
| `POST /checkout` · `POST /checkout/promo` | Paiement · vérification d'un code promo |
| `/sitemap.xml` · `/robots.txt` | Référencement |
| `/conditions-generales`, `/politique-de-confidentialite`, `/politique-des-cookies` | Pages légales |

| Webhooks | |
|---|---|
| `POST /api/webhooks/mercypay` | Mercy Pay (paiements et virements) |
| `POST /api/webhooks/pawapay/{deposits,payouts,refunds}` | pawaPay |
| `/api/webhooks/whatsapp-cloud` | Meta WhatsApp |

Espaces connectés : `/seller/*` (rôle vendeur) et `/admin/*` (rôle admin). La liste complète s'obtient avec `php artisan route:list`.

---

## 13. Tests

```bash
php artisan test            # ou : vendor/bin/pest
php artisan test --filter=Refund
```

Plus de 220 tests couvrent notamment :
- l'intégrité des paiements et les webhooks ;
- le délai de sécurité ;
- les commissions et les frais ;
- les pays ;
- la livraison, les codes promo et l'acompte ;
- les remboursements ;
- le renouvellement des abonnements ;
- les paniers à relancer ;
- le référencement (balises, JSON-LD, plan du site) ;
- les avis ;
- les actions admin ;
- le parcours d'un nouveau vendeur et l'accès aux comptes.

`tests/Pest.php` bloque toute requête HTTP non simulée (`Http::preventStrayRequests`) et simule les e-mails. `phpunit.xml` force l'environnement de test : SSR désactivé, pawaPay de test, WhatsApp sans jeton.

---

## 14. Mise en production

1. **Serveur** : PHP 8.3+, MySQL ou MariaDB, HTTPS, domaine `biolinko.link`.
2. **Déploiement** :
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci && npm run build
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   ```
3. **`.env` de production** :
   - `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://biolinko.link`, `APP_LOCALE=fr` ;
   - `PAYMENT_DRIVER=mercypay` avec la clé `mp_live_…` et le `MERCYPAY_WEBHOOK_SECRET` ;
   - `SUBSCRIPTION_PAYMENT_MODE=live` ;
   - un vrai serveur d'e-mails, avec un expéditeur `@biolinko.link`.
4. **Webhook Mercy Pay** : déclarer `https://biolinko.link/api/webhooks/mercypay` dans le tableau de bord Mercy Pay.
5. **Cron** `schedule:run` (voir §10) et **file d'attente** `queue:work`, gérée par un superviseur.
6. **Compte admin** : changer le mot de passe créé par le seed.
7. **Google Search Console** : valider le domaine (`GOOGLE_SITE_VERIFICATION`), soumettre `https://biolinko.link/sitemap.xml`, puis tester une page produit dans le « Test des résultats enrichis ».
8. **Premier test réel** : un petit paiement, puis un **petit retrait** et un **petit remboursement**. Les virements en live n'ont pas encore été testés.

---

## 15. Sécurité

- **Secrets** : uniquement dans `.env`, jamais dans le code ni dans le dépôt.
- **Webhooks** : signatures vérifiées, statut toujours redemandé à l'agrégateur, déduplication des événements.
- **Montants** : toujours recalculés côté serveur (le panier envoyé par le navigateur n'est jamais cru).
- **Limitation du nombre de requêtes** : paiement, codes promo, avis, signalements, remboursements.
- **Accès** :
  - chaque action vendeur vérifie que la commande, le code ou le produit appartient à **sa** boutique ;
  - les routes admin passent par `role:admin`.
- **Données publiques** : la boutique n'expose ni l'e-mail ni le compte du vendeur (`Store::forPublic()`). La recherche de client au paiement est limitée au numéro exact et à la boutique concernée.
- **CGU** : acceptation obligatoire et horodatée à l'inscription.

---

## 16. Limites connues et pistes

- **Virements en live** (retraits et remboursements) : jamais testés avec de l'argent réel.
- **Soldes Mercy Pay séparés par opérateur** : un virement Orange nécessite du solde Orange.
- **WhatsApp automatique** : en attente de la vérification du portefeuille Business Meta.
- **Autres pays** : configurés mais désactivés. Il manque le choix du pays, l'affichage des devises, le choix de l'opérateur au paiement et l'anglais.
- **Renouvellement automatique** : toujours d'un mois. Les durées de 1 ou 2 ans se paient manuellement.
- **Pistes** :
  - produits numériques (livraison automatique d'un lien) ;
  - domaine personnalisé pour le plan Business ;
  - comptes équipe ;
  - statistiques de visites par produit.
