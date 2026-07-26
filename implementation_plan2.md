# Plan d'Implémentation : Refonte Totale du Dashboard d'Apparence `/dashboard/appearance` & Personnalisation Intégrale de la Vitrine

Ce plan décrit les modifications backend et frontend nécessaires pour offrir au vendeur un **contrôle à 100% sur chaque section de sa vitrine** via la réécriture complète de la vue `/dashboard/appearance`.

---

## User Review Required

> [!IMPORTANT]
> **Refonte de la vue `/dashboard/appearance`** : La page actuelle sera entièrement remplacée par une interface moderne structurée en 5 onglets thématiques (Marque & Couleur, Section Hero, Engagements/Avantages, Gestion des Avis Clients, À Propos & Contact).
>
> **Données rétro-compatibles** : Des valeurs par défaut propres (ex: Jaune BIOLINKO `#FFCC00`, 4 engagements standards, 3 avis démo) seront appliquées automatiquement si le vendeur n'a pas encore saisi ses propres données.

---

## Open Questions

1. **Avis Clients** : Préférez-vous que le vendeur puisse créer/ajouter librement jusqu'à 10 avis clients dans son dashboard avec une case à cocher *"Afficher en vitrine (max 3)"* ?
2. **Couleurs de Thème** : Outre les 5 palettes prédéfinies (Jaune BIOLINKO, Ardoise Luxe, Rose Tendance, Vert Émeraude, Bleu Saphir), souhaitez-vous un sélecteur de couleur libre (Color Picker HTML5) ?

---

## Proposed Changes

### 1. Base de Données & Modèles Laravel

#### [NEW] [2026_07_24_000001_add_appearance_fields_to_stores_table.php](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/database/migrations/2026_07_24_000001_add_appearance_fields_to_stores_table.php)
- Ajouter les colonnes suivantes à la table `stores` :
  - `hero_badge_text` (string, default: "PROMOTIONS & TENDANCES")
  - `hero_title` (string, default: "Découvrez nos Produits d'Exception")
  - `hero_subtitle` (text, default: "Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct.")
  - `hero_cta_text` (string, default: "Acheter Maintenant")
  - `benefits_json` (json, nullable - pour les 4 engagements)
  - `location_address` (string, nullable)
  - `support_email` (string, nullable)

#### [NEW] [2026_07_24_000002_create_store_reviews_table.php](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/database/migrations/2026_07_24_000002_create_store_reviews_table.php)
- Créer la table `store_reviews` :
  - `store_id` (foreignKey cascade)
  - `customer_name` (string)
  - `customer_city` (string, nullable)
  - `rating` (integer, default: 5)
  - `comment` (text)
  - `is_verified` (boolean, default: true)
  - `is_featured` (boolean, default: false)

#### [MODIFY] [Store.php](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/app/Models/Store.php)
- Ajouter les nouveaux champs au `$fillable` et la relation `reviews()`.

#### [NEW] [StoreReview.php](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/app/Models/StoreReview.php)
- Définir le modèle Eloquent pour la gestion des avis clients.

---

### 2. Contrôleurs Laravel

#### [MODIFY] [AppearanceController.php](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/app/Http/Controllers/AppearanceController.php)
- Étendre `index` pour envoyer au composant React :
  - `$store` enrichi des données d'apparence,
  - `$reviews` (liste des avis du vendeur).
- Ajouter la méthode `update(Request $request)` pour traiter la sauvegarde de tous les onglets (Hero, Avantages, Coordonnées, Thème couleur).
- Ajouter les méthodes CRUD d'avis : `storeReview(Request $request)` et `destroyReview(StoreReview $review)`.

#### [MODIFY] [StorefrontController.php](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/app/Http/Controllers/StorefrontController.php)
- Charger la relation `reviews` (filtrés par `is_featured = true`) et transmettre les engagements et textes personnalisés au composant `Storefront/Show.jsx`.

#### [MODIFY] [web.php](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/routes/web.php)
- Ajouter les routes de mise à jour de l'apparence et de gestion des avis clients (`POST /dashboard/appearance`, `POST /dashboard/appearance/reviews`, `DELETE /dashboard/appearance/reviews/{review}`).

---

### 3. Vue Dashboard Vendeur (Réécriture Totale)

#### [MODIFY] [Appearance/Index.jsx](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/resources/js/Pages/Appearance/Index.jsx)
- Réécrire entièrement l'interface utilisateur avec 5 onglets modernes et interactifs :
  1. **Onglet 1 : Branding & Thème Couleur** (Upload Logo, Bannière, Nom, Slug, Sélecteur de couleur de thème avec aperçu en temps réel).
  2. **Onglet 2 : Personnalisation Section Hero** (Champs d'édition du Titre, Sous-titre, Badge et Bouton CTA avec prévisualisation).
  3. **Onglet 3 : Engagements & Avantages (4 Cartes)** (Formulaire d'édition pour chacun des 4 blocs d'avantages).
  4. **Onglet 4 : Gestion des Avis Clients** (Formulaire d'ajout rapide d'avis + liste avec interrupteur d'épinglage en vitrine).
  5. **Onglet 5 : À Propos & Réseaux Sociaux** (Social links Instagram/TikTok/Facebook, Téléphone WhatsApp, Adresse physique, Horaires).

---

### 4. Vitrine Client Publique

#### [MODIFY] [Storefront/Show.jsx](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/resources/js/Pages/Storefront/Show.jsx)
- Connecter dynamiquement toutes les nouvelles variables :
  - Textes et boutons de la Hero Section,
  - Les 4 cartes d'engagements (avec valeurs par défaut si non saisies),
  - Avis clients dynamiques issus de `store.reviews`,
  - Coordonnées et adresse dans la section À propos,
  - Application de la couleur de thème choisie par le vendeur (`store.theme_color`).

---

## Verification Plan

### Automated Tests
- Exécuter la suite de tests Pest pour s'assurer d'un score 100% vert :
  ```bash
  ./vendor/bin/pest
  ```
- Tester la compilation Vite des assets React :
  ```bash
  npm run build
  ```

### Manual Verification
1. Accéder au dashboard `/dashboard/appearance`.
2. Tester la personnalisation de la Hero section, de la barre d'avantages, de la couleur de thème, et ajouter un avis client.
3. Prévisualiser la vitrine publique du vendeur (`/{store_slug}`) et vérifier l'affichage réactif des nouvelles données.
