# 📊 Rapport d'Analyse : Variables & Informations Personnalisables par le Vendeur — Vitrine BIOLINKO

Ce document dresse l'inventaire exhaustif de toutes les données, visuels, paramètres de marque, informations de contact et configurations de catalogue que **le vendeur peut et doit personnaliser** depuis son Dashboard pour alimenter sa vitrine e-commerce.

---

## 1. 🏷️ Identité Visuelle & Branding de la Boutique

Ces variables définissent l'image de marque et la charte graphique de la boutique sur le web :

| Champ / Variable | Description & Rôle sur la Vitrine | Champ DB (`Store`) | Exemple de Valeur |
| :--- | :--- | :--- | :--- |
| **Nom de la Boutique** | Nom officiel affiché en haut du Header, dans les cartes et le Footer. | `name` | *Fletcher & Steele NovaTrend* |
| **Identifiant Unique (Slug URL)** | Lien d'accès direct de la vitrine (`biolinko.com/slug`). | `slug` | *fletcher-steele* |
| **Logo de la Boutique** | Image carrée (200x200px) affichée dans le Header et le Footer. | `logo_url` | `/storage/logos/logo.png` |
| **Bannière d'En-tête (Hero)** | Visuel grand format d'accueil pour capter l'attention. | `banner_url` | `/storage/banners/hero.jpg` |
| **Catégorie de la Boutique** | Secteur d'activité (Mode, Électronique, Cosmetique, etc.). | `category` | *Mode & Accessoires Premium* |
| **Slogan / Description Courte** | Résumé de 1 à 2 phrases sous le logo ou en Hero section. | `description` | *Boutique tendance de prêt-à-porter* |
| **Couleur Thème Principale** | Couleur d'accentuation de la vitrine (Boutons CTA, badges). | `theme_color` | `#FFCC00` *(Jaune BIOLINKO)* |

---

## 2. 📞 Coordonnées & Informations sur le Propriétaire

Informations essentielles pour rassurer les acheteurs et faciliter le contact direct :

| Champ / Variable | Description & Rôle sur la Vitrine | Champ DB (`Store`) | Exemple de Valeur |
| :--- | :--- | :--- | :--- |
| **Téléphone Direct / WhatsApp** | Numéro pour le bouton d'achat direct WhatsApp & Footer. | `phone_whatsapp` | *+229 97 00 00 00* |
| **Localisation / Ville** | Emplacement physique ou siège de la boutique. | `city_location` | *Cotonou, Bénin* |
| **Heures d'Ouverture** | Plages d'assistance client et d'expédition des colis. | `opening_hours` | *Lun - Sam: 08h00 - 19h00* |
| **Histoire & À Propos** | Texte de présentation détaillé dans la section "À propos". | `about_text` | *Spécialisé dans les articles de mode depuis 2022...* |

---

## 3. 🌐 Liens Réseaux Sociaux & Canaux Directs

Permet au vendeur d'étendre son audience et d'interagir directement avec ses clients :

| Champ / Variable | Description & Rôle sur la Vitrine | Champ DB (`Store`) | Exemple de Valeur |
| :--- | :--- | :--- | :--- |
| **Lien Instagram** | Bouton de redirection vers la page Instagram officielle. | `instagram_link` | `https://instagram.com/fletcher_steele` |
| **Lien TikTok** | Bouton de redirection vers le compte TikTok. | `tiktok_link` | `https://tiktok.com/@fletcher_steele` |
| **Lien Facebook** | Bouton de redirection vers la page Facebook. | `facebook_link` | `https://facebook.com/fletchersteele.official` |
| **Lien Direct WhatsApp** | Redirection vers une conversation WhatsApp pré-remplie. | Généré dynamiquement | `https://wa.me/22997000000` |

---

## 4. 📣 Bandeau d'Annonce & Configurations Solde / Promo

Champs personnalisables pour piloter l'urgence et les promotions sur la vitrine :

| Champ / Variable | Description & Rôle sur la Vitrine | Champ DB (`Store`) | Exemple de Valeur |
| :--- | :--- | :--- | :--- |
| **Message d'Annonce Top Bar** | Message défilant tout en haut du site. | `announcement_header` | *🔥 Livraison Offerte dès 25 000 FCFA !* |
| **Seuil de Livraison Gratuite** | Montant minimal de panier pour la gratuité des frais de port. | Paramètre calculé | *25 000 FCFA* |
| **Compte à Rebours Flash** | Timer d'urgence affiché dans la section Promotions. | Dynamique | *02 Jours : 15 Heures : 45 Mins* |

---

## 5. 🛍️ Fiche Produit (Configurations par Article)

Chaque article mis en vente par le vendeur possède des attributs propres :

| Champ / Variable | Description & Rôle sur la Vitrine | Champ DB (`Product`) | Exemple de Valeur |
| :--- | :--- | :--- | :--- |
| **Titre du Produit** | Nom de l'article affiché sur la carte et la fiche produit. | `title` | *Air Runner Max 270* |
| **Description Détaillée** | Caractéristiques, matières et détails d'utilisation. | `description` | *Baskets légères avec semelle amortissante...* |
| **Prix Vendeur Net ($P_v$)** | Prix brut souhaité par le vendeur (hors commission 2%). | `price_vendor` | *19 500 FCFA* |
| **Prix Affiché Client ($P_b$)** | Prix public calculé automatiquement : $\lceil P_v \times 1.02 \rceil$. | Calculé dans Controller | *19 890 FCFA* |
| **Statut Solde / Promo** | Indique si le produit est en promotion. | `is_promo` | `true` / `false` |
| **Prix Promo Vendeur ($P_{promo}$)**| Prix remisé souhaité par le vendeur lors des soldes. | `promo_price` | *15 000 FCFA* |
| **Ancien Prix Barré** | Prix de référence d'origine barré en rouge sur la carte. | `original_price_display`| *~~19 890 FCFA~~* |
| **Montant Économisé** | Différence nette entre l'ancien et le nouveau prix. | `savings_display` | *-4 590 FCFA (-23%)* |
| **Quantité Min. (MOQ)** | Nombre d'unités minimales à acheter par commande. | `min_order_quantity` | *1 unité* |
| **Stock Disponible** | Quantité d'articles réels en réserve. | `stock` | *15 articles* |
| **Visuel Principal & Galeries** | Jusqu'à 5 photos HD de démonstration. | `image_url` / `images` | `['/storage/products/1.jpg', ...]` |
| **Variantes (Tailles / Couleurs)**| Déclinaisons disponibles pour l'acheteur. | Relation `ProductVariant` | *Taille XL / Couleur Noir* |

---

## 6. 🛡️ Politiques de Réassurance & Transparence Client

Paramètres affichés pour rassurer l'acheteur et garantir des ventes régulières :

1. **Délais d'Expédition** : *"Livraison sous 24h à 48h à domicile"*.
2. **Paiement Mobile Money Push USSD** : Validation instantanée MTN / Moov / Orange Money.
3. **Reçu Numérique Imprimable** : Génération immédiate de la facture d'achat.
4. **Avis Clients Vérifiés** : Note moyenne (4.8★) et témoignages clients.

---

## 7. 🔮 Recommandations de Futures Variables à Ajouter au SaaS BIOLINKO

Afin de permettre une personnalisation encore plus poussée aux vendeurs dans les futures versions :

1. `custom_domain` : Autoriser les vendeurs à lier leur propre nom de domaine (ex: `www.ma-boutique.com`).
2. `social_tiktok_pixel` / `facebook_pixel` : Permettre l'insertion des pixels de suivi publicitaire.
3. `shipping_flat_fee` : Frais de livraison personnalisés par région/ville.
4. `currency_symbol` : Prise en charge de plusieurs devises (FCFA, EUR, USD, GHS).
