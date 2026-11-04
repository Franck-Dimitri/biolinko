# Mise en production de Biolinko — checklist

Cible : un VPS Ubuntu 24.04 (2 Go de RAM minimum, 4 Go conseillés), domaine `biolinko.link`.
Cocher chaque ligne dans l'ordre. Les fichiers cités sont dans ce dossier `deploy/`.

## 1. Serveur
- [ ] VPS créé, accès SSH par clé (connexion par mot de passe désactivée)
- [ ] Pare-feu : `ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable`
- [ ] Paquets :
  ```bash
  apt update && apt install -y nginx mysql-server supervisor git unzip certbot python3-certbot-nginx \
    php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-gd php8.3-intl php8.3-bcmath
  ```
- [ ] Composer installé, Node.js 22 LTS installé
- [ ] Mises à jour de sécurité automatiques : `apt install unattended-upgrades`

## 2. DNS
- [ ] Enregistrements `A` : `biolinko.link` et `www.biolinko.link` → IP du VPS
- [ ] E-mails : enregistrements **SPF**, **DKIM** et **DMARC** donnés par le fournisseur SMTP

## 3. Base de données
- [ ] `mysql_secure_installation`
- [ ] Base et utilisateur dédiés :
  ```sql
  CREATE DATABASE biolinko CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'biolinko'@'localhost' IDENTIFIED BY '<mot de passe long>';
  GRANT ALL PRIVILEGES ON biolinko.* TO 'biolinko'@'localhost';
  ```

## 4. Premier déploiement
- [ ] Dossiers : `mkdir -p /var/www/biolinko/{releases,shared/storage/{app/public,framework/{cache,sessions,views},logs}}`
- [ ] Propriétaire : `chown -R www-data:www-data /var/www/biolinko/shared/storage`
- [ ] Clé SSH de déploiement ajoutée au dépôt GitHub (lecture seule)
- [ ] `.env` : copier `env.production.example` vers `/var/www/biolinko/shared/.env`, remplir, puis `chmod 640` et `chown www-data`
- [ ] Clé d'application : `php artisan key:generate --show` → coller dans `APP_KEY`
- [ ] Lancer `deploy/scripts/deploy.sh main` (le cloner à la main la première fois)
- [ ] Compte admin créé, mot de passe fort

## 5. Web et HTTPS
- [ ] `deploy/nginx/biolinko.conf` → `/etc/nginx/sites-available/`, lien vers `sites-enabled`, `nginx -t && systemctl reload nginx`
- [ ] `certbot --nginx -d biolinko.link -d www.biolinko.link` (renouvellement automatique inclus)
- [ ] Vérifier : `https://biolinko.link/.env` renvoie **403** ou **404**

## 6. Tâches de fond (obligatoires)
- [ ] `deploy/supervisor/biolinko.conf` → `/etc/supervisor/conf.d/`, puis `supervisorctl reread && supervisorctl update`
- [ ] `sudo crontab -u www-data deploy/crontab`
- [ ] Vérifier après 5 min : `php artisan schedule:list` et `supervisorctl status` (tout en RUNNING)

## 7. Paiements
- [ ] Compte Mercy Pay **live** validé (KYC), clé `mp_live_…` dans `.env`
- [ ] Webhook déclaré chez Mercy Pay : `https://biolinko.link/api/webhooks/mercypay`, secret copié dans `MERCYPAY_WEBHOOK_SECRET`
- [ ] Question posée à Mercy Pay : y a-t-il des **frais fixes par virement** en plus des 2 % ?
- [ ] **Test en argent réel** (100 à 500 FCFA) : achat MTN, achat Orange, crédit portefeuille, retrait, remboursement, abonnement

## 8. Sauvegardes
- [ ] `chmod +x deploy/scripts/backup.sh` et un premier lancement à la main
- [ ] Copie hors serveur (rclone vers un stockage externe)
- [ ] **Test de restauration** sur une base vide (une sauvegarde jamais restaurée n'est pas une sauvegarde)

## 9. Après la mise en ligne
- [ ] Google Search Console : domaine validé, `https://biolinko.link/sitemap.xml` soumis
- [ ] Suivi des erreurs (Sentry gratuit ou surveillance de `storage/logs`)
- [ ] Surveillance de disponibilité (UptimeRobot, gratuit) sur la page d'accueil
- [ ] Clé Evolution API révoquée

## Mettre à jour le site ensuite
```bash
ssh deploy@biolinko.link
/var/www/biolinko/current/deploy/scripts/deploy.sh main
```
Retour arrière en cas de problème : refaire pointer `current` vers la version précédente de `releases/`, puis recharger php-fpm.
