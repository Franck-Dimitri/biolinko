# ⚡ BIOLINKO — Plateforme SaaS E-Commerce & Link-in-Bio

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v1.x-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**BIOLINKO** est une plateforme SaaS e-commerce tout-en-un conçue pour les entrepreneurs, commerçants et créateurs. Elle permet à n'importe quel vendeur de déployer sa vitrine e-commerce personnalisée en 2 minutes avec paiement **Fast Checkout Mobile Money (MTN & Orange)**, campagnes de relance **WhatsApp 1-Clic automatisées** (0 FCFA de frais API) et **facturation PDF certifiée**.

---

## 🌟 Fonctionnalités Clés

- **🎨 Studio d'Apparence & Vitrine Sur-Mesure** :
  - Choix dynamique du style de bordures (**Coins Droits vs Arrondis**) et des typographies (`Inter`, `Outfit`, `Plus Jakarta Sans`, `Roboto`).
  - Mode brouillon initial (`is_published = false`) pour préparer la boutique en toute confidentialité.

- **💳 Fast Checkout Mobile Money (MTN & Orange 🇨🇲)** :
  - Intégration de la passerelle **HR-Skills Pay API** avec notification USSD Push directe.
  - Calcul automatique transparent des 2% de frais de plateforme.

- **📱 Automation & Campagnes WhatsApp 1-Clic** :
  - Microservice **Evolution API (Node.js)** auto-hébergé sous Docker pour l'envoi de messages réels en arrière-plan sans ouvrir d'onglets `wa.me`.
  - Moteur d'injection de balises dynamiques (`{prenom}`, `{nom}`, `{ville}`, `{lien_produit}`).

- **📄 Facturation Certifiée & Portefeuille Virtuel** :
  - Génération automatique de reçus PDF avec filigrane de sécurité et QR Code de certification unique.
  - Portefeuille virtuel vendeur crédité automatiquement à chaque vente avec système de demande de virement Mobile Money.

- **💼 Tarification SaaS & Abonnements Multi-Niveaux** :
  - Grille tarifaire complète (Starter, Pro, Growth, Business) avec gestion de quotas par plan et réductions annuelles (-10% sur 6 mois, -20% sur 1 an).

---

## 🛠️ Stack Technique

- **Backend** : PHP 8.2+ / Framework Laravel 11
- **Frontend** : React 18 / Inertia.js / Tailwind CSS / Framer Motion / Lucide Icons
- **Passerelle WhatsApp** : Evolution API (Baileys / Node.js) sous Docker
- **Passerelle Paiement** : HR-Skills Pay API (MTN & Orange Money)
- **Base de Données** : SQLite / PostgreSQL
- **Tests** : Pest Test Suite (32 tests validés — 100% Pass)

---

## 🚀 Installation & Démarrage en Local

### 1. Prérequis
- PHP >= 8.2 avec extensions `gd`, `sqlite3`, `curl`, `mbstring`, `zip`.
- Composer & Node.js (v18+).
- Docker (pour la passerelle WhatsApp Evolution API).

### 2. Installation des dépendances
```bash
composer install
npm install
```

### 3. Fichier d'environnement
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Migrations & Liens de stockage
```bash
php artisan migrate --seed
php artisan storage:link
```

### 5. Lancement du serveur de développement
```bash
composer run dev
```

### 6. Lancement d'Evolution API (Passerelle WhatsApp)
```bash
docker run -d --name evolution-api -p 8080:8080 -e AUTHENTICATION_API_KEY=biolinko-secret-key-2026 evolutionapi/evolution-api:v2.1.1
```

---

## 🧪 Exécution des Tests Automatisés

Le projet inclut une suite de tests unitaires et de fonctionnalités avec **Pest** :

```bash
./vendor/bin/pest
```

---

## 👨‍💻 Concepteur & Développeur Lead

Projet conçu, développé et maintenu par :

**KOUONGME MBOUOM F. DIMITRI**  
*Ingénieur Informaticien — Génie Logiciel*

- 🌐 **Portfolio & Site Web** : [https://mrdims.dev](https://mrdims.dev)
- 🐙 **GitHub** : [@Franck-Dimitri](https://github.com/Franck-Dimitri)
- 📧 **Email** : [franckdimitrio09@gmail.com](mailto:franckdimitrio09@gmail.com)
- 📱 **Téléphone / WhatsApp** : +237 676 38 39 86 / +237 690 22 60 35
- 📍 **Localisation** : Yaoundé, Cameroun

---

## 📜 Licence

Ce projet est sous licence [MIT](LICENSE).
