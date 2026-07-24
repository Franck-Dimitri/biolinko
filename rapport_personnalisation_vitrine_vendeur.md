# 🛠️ Plan d'Évolution & Rapport des Variables de Vitrine — BIOLINKO SaaS

Ce rapport identifie précisément **ce qui est actuellement en place et fonctionnel**, puis détaille **les nouvelles variables et fonctionnalités manquantes** à intégrer dans le Dashboard Vendeur pour lui offrir un contrôle total et personnalisé sur chaque section de sa vitrine.

---

## 🟢 PARTIE 1 : Ce qui est Déjà Opérationnel dans la BD & le Code

Les variables ci-dessous sont déjà gérées en base de données (`stores` & `products`) et s'affichent dynamiquement sur la vitrine :

| Section Vitrine              | Variable Existante                    | Champ Base de Données         | Statut           |
| :--------------------------- | :------------------------------------ | :----------------------------- | :--------------- |
| **Header & Footer**    | Nom de la boutique                    | `Store.name`                 | 🟢 Opérationnel |
| **Header & Footer**    | Slug & URL unique                     | `Store.slug`                 | 🟢 Opérationnel |
| **Header & Footer**    | Logo Officiel                         | `Store.logo_url`             | 🟢 Opérationnel |
| **Section À propos**  | Histoire / Présentation              | `Store.about_text`           | 🟢 Opérationnel |
| **Section À propos**  | Numéro Téléphone & WhatsApp        | `Store.phone_whatsapp`       | 🟢 Opérationnel |
| **Réseaux Sociaux**   | Liens Insta, TikTok, FB               | `Store.instagram_link`, etc. | 🟢 Opérationnel |
| **Top Bar Header**     | Message d'Annonce                     | `Store.announcement_header`  | 🟢 Opérationnel |
| **Catalogue & Soldes** | Produits, Prix, Photos, Stock, Promos | Table`products`              | 🟢 Opérationnel |

---

## 🔴 PARTIE 2 : Les Variables Manquantes à Ajouter (Contrôle 100% Vendeur)

Pour permettre au vendeur de personnaliser l'intégralité de sa boutique sans aucune valeur codée en dur, voici la liste des variables manquantes à ajouter au Dashboard :

### 1. 🚀 Personnalisation de la Section Hero (Bannière d'Accueil)

Permettre au vendeur d'adapter le message d'accroche selon ses campagnes marketing :

- **Titre Principal Hero** (`hero_title`) : ex: *"Découvrez nos Produits d'Exception pour Votre Style"*
- **Sous-titre / Description Hero** (`hero_subtitle`) : ex: *"Articles de qualité supérieure expédiés sous 24h à 48h."*
- **Badge Supérieur Hero** (`hero_badge_text`) : ex: *"PROMOTIONS DU MOMENT"* ou *"NOUVELLE COLLECTION 2026"*
- **Texte du Bouton d'Action (CTA)** (`hero_cta_text`) : ex: *"Acheter Maintenant"* ou *"Explorer le Catalogue"*

---

### 2. 🛡️ Personnalisation de la Barre d'Avantages & Stats (4 Bloce)

Actuellement, les 4 engagements (Livraison Express, MoMo, Satisfait/Remboursé, WhatsApp) sont fixes. Il faut permettre au vendeur de configurer ses 4 propres arguments de vente :

- **Avantage #1** (`benefit_1_title` & `benefit_1_subtitle`) : Titre & Sous-titre (ex: *"Livraison Gratuit à Cotonou"* / *"Dès 25 000 FCFA"*).
- **Avantage #2** (`benefit_2_title` & `benefit_2_subtitle`) : Titre & Sous-titre (ex: *"Paiement MoMo & Wave"* / *"100% Sécurisé USSD"*).
- **Avantage #3** (`benefit_3_title` & `benefit_3_subtitle`) : Titre & Sous-titre (ex: *"Garantie 14 Jours"* / *"Satisfait ou Remboursé"*).
- **Avantage #4** (`benefit_4_title` & `benefit_4_subtitle`) : Titre & Sous-titre (ex: *"Service Client 7j/7"* / *"Réponse en 5 mins sur WhatsApp"*).

---

### 3. ⭐ Gestion Dynamique des Avis Clients (Table `store_reviews`)

Actuellement, les 3 avis clients sont statiques. Il faut ajouter un module dans le Dashboard vendeur pour :

- **Ajouter / Créer des Avis Clients** :
  - Nom du client (`customer_name`)
  - Ville du client (`customer_city`)
  - Note attribuée (`rating`: 1 à 5 étoiles)
  - Commentaire / Témoignage (`comment`)
  - Statut *"Achat Vérifié"* (`is_verified`)
- **Sélectionner max 3 avis vedettes** (`is_featured`) à afficher en vitrine.

---

### 4. 🏢 Personnalisation Avancée de la Section À Propos & Localisation



Donner le contrôle sur toutes les informations légales et géographiques de la boutique :

- **Ville & Quartier Précis** (`location_address`) : ex: *"Cotonou, Haie Vive - Rue 12.054"*
- **Heures & Jours d'Ouverture** (`opening_hours`) : ex: *"Lundi au Samedi : 08h00 - 20h00"*
- **Email de Contact Support** (`support_email`) : ex: *"contact@fletcher-steele.com"*
- **Engagements Vendeur Custom** (`seller_tagline`) : ex: *"Confection artisanale & produits 100% originaux"*.

---

### 5. 🎨 Sélecteur de Thème Couleur pour la Vitrine

Permettre au vendeur de choisir la couleur dominante de sa vitrine en 1 clic dans l'onglet Apparence :

- **Palette de Thèmes Pré-configurés** (`theme_color`) :
  1. 🟡 **Jaune BIOLINKO** (`#FFCC00` - Par défaut)
  2. 🖤 **Noir Luxe / Ardoise** (`#0F172A`)
  3. 🔴 **Rose / Rouge Tendance** (`#E11D48`)
  4. 💚 **Vert Émeraude** (`#059669`)
  5. 💙 **Bleu Saphir** (`#2563EB`)
  6. 🎨 **Code Hexadécimal Personnalisé** (`custom_hex_color`).

---

## 🗄️ PARTIE 3 : Plan de Migration Base de Données (Champs à Ajouter)

### 1. Nouveaux Champs sur la Table `stores` :

```php
Schema::table('stores', function (Blueprint $table) {
    // Section Hero
    $table->string('hero_badge_text')->nullable()->default('PROMOTIONS DU MOMENT');
    $table->string('hero_title')->nullable()->default('Découvrez nos Produits d\'Exception');
    $table->text('hero_subtitle')->nullable();
    $table->string('hero_cta_text')->nullable()->default('Acheter Maintenant');

    // Barre d'Avantages (4 Bloce)
    $table->json('benefits_json')->nullable(); // Contient les 4 titres et sous-titres

    // Infos Complémentaires À Propos
    $table->string('location_address')->nullable();
    $table->string('support_email')->nullable();

    // Thème Visuel
    $table->string('theme_color')->default('#FFCC00');
});
```

### 2. Nouvelle Table `store_reviews` :

```php
Schema::create('store_reviews', function (Blueprint $table) {
    $table->id();
    $table->foreignId('store_id')->constrained()->cascadeOnDelete();
    $table->string('customer_name');
    $table->string('customer_city')->nullable();
    $table->integer('rating')->default(5);
    $table->text('comment');
    $table->boolean('is_verified')->default(true);
    $table->boolean('is_featured')->default(false); // Max 3 affichés en vitrine
    $table->timestamps();
});
```
