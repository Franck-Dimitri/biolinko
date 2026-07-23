# 🗄️ Documentation de la Base de Données — BIOLINKO (SQLite)

Ce document rassemble l'ensemble des informations de connexion et schémas relationnels de la base de données **SQLite** de la plateforme **BIOLINKO**.

---

## 🔑 1. Configuration dans le fichier `.env`

Le fichier [.env](file:///home/mr-dims-tech/developpement/developpement_laravel/biolinko/.env) est configuré avec SQLite (Fichier local `database/database.sqlite`) :

```ini
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=
```

---

## 🖥️ 2. Paramètres de Connexion (Clients Graphiques : DBeaver, TablePlus, PgAdmin, DataGrip)

Pour vous connecter depuis un outil de gestion visuelle de base de données :

| Paramètre | Valeur |
| :--- | :--- |
| **Système SGBD** | PostgreSQL |
| **Hôte (Host)** | `localhost` ou `127.0.0.1` |
| **Port** | `5432` |
| **Nom de la Base (Database)** | `biolinko` |
| **Utilisateur (User)** | `biolinko` *(ou `postgres`)* |
| **Mot de Passe (Password)** | `biolinko` |

---

## 💻 3. Commandes d'Accès Direct via le Terminal (CLI)

### Connection directe en administrateur :
```bash
sudo -u postgres psql -d biolinko
```

### Connection via le rôle dédié `biolinko` :
```bash
psql -U biolinko -d biolinko -h 127.0.0.1
# Saisir le mot de passe : biolinko
```

---

## 📐 4. Structure des Tables & Schéma Relationnel

La base de données contient **11 tables** complètement configurées et interconnectées avec intégrité référentielle (`ON DELETE CASCADE`) :

### 👤 Tables Utilisateurs & Boutiques
- **`users`** : Comptes utilisateurs et vendeurs (`id`, `name`, `email`, `phone_whatsapp`, `role`, `password`, `remember_token`, `timestamps`).
- **`stores`** : Boutiques des vendeurs (`id`, `user_id`, `name`, `slug` unique pour `biolinko.app/[slug]`, `logo_url`, `banner_url`, `theme_color`, `plan_type`, `phone_whatsapp`, `description`, `timestamps`).

### 🛍️ Tables Catalogue Produit
- **`products`** : Articles du catalogue (`id`, `store_id`, `title`, `slug`, `description`, `price_vendor`, `image_url`, `stock`, `is_active`, `timestamps`).
- **`product_variants`** : Variantes de taille et couleur (`id`, `product_id`, `size`, `color`, `stock_quantity`, `timestamps`).

### 🛒 Tables Commandes & Panier Multi-Produits
- **`orders`** : Commandes globales (`id`, `uuid`, `tracking_code` unique `BLK-XXXXXX`, `store_id`, `customer_name`, `customer_phone`, `customer_email`, `city`, `address_details`, `price_vendor`, `saas_margin`, `api_fee`, `total_client`, `status`, `payment_status`, `paid_at`, `timestamps`).
- **`order_items`** : Lignes d'articles du panier (`id`, `order_id`, `product_id`, `variant_id`, `product_title`, `variant_label`, `quantity`, `unit_price_vendor`, `total_price_vendor`, `timestamps`).

### 💳 Tables Trésorerie & Retraits
- **`wallets`** : Portefeuilles virtuels des vendeurs (`id`, `store_id`, `balance_available`, `balance_pending`, `timestamps`).
- **`withdrawals`** : Demandes de retraits Mobile Money (`id`, `wallet_id`, `amount_requested`, `fee_api`, `fee_saas`, `net_transferred`, `phone_momo`, `status`, `timestamps`).

### ⚙️ Tables Système Laravel
- `sessions`, `cache`, `jobs`, `migrations`.

---

## 🛠️ 5. Résumé des Configurations Réalisées

1. **Base de Données** : `biolinko` créée sur l'instance PostgreSQL locale.
2. **Utilisateurs SQL** :
   - `postgres` (Superutilisateur système).
   - `biolinko` (Superutilisateur / rôle applicatif dédié avec mot de passe `biolinko`).
3. **Précision Financière** : Tous les montants en FCFA (`price_vendor`, `total_client`, `saas_margin`, `balance_available`, `net_transferred`) sont typés en `decimal(12, 2)` pour éviter tout problème d'arrondi binaire.
