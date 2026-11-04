#!/usr/bin/env bash
# Déploiement sans coupure : chaque version dans releases/<date>, puis bascule du lien "current".
# Usage sur le serveur (utilisateur deploy) : /var/www/biolinko/current/deploy/scripts/deploy.sh [branche]
# Premier déploiement : voir deploy/CHECKLIST.md (étape 4).
set -euo pipefail

BRANCH="${1:-main}"
ROOT=/var/www/biolinko
REPO=git@github.com:Franck-Dimitri/biolinko.git
RELEASE="$ROOT/releases/$(date +%Y%m%d%H%M%S)"

echo "→ Récupération de $BRANCH"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$RELEASE"
cd "$RELEASE"

echo "→ Fichiers partagés (.env, storage)"
ln -sfn "$ROOT/shared/.env" .env
rm -rf storage && ln -sfn "$ROOT/shared/storage" storage

echo "→ Dépendances et build"
composer install --no-dev --optimize-autoloader --no-interaction
npm ci --no-audit --no-fund
npm run build
rm -rf node_modules

echo "→ Base de données"
php artisan migrate --force
php artisan storage:link || true

echo "→ Caches"
php artisan optimize

echo "→ Bascule"
ln -sfn "$RELEASE" "$ROOT/current"
sudo systemctl reload php8.3-fpm
sudo supervisorctl restart biolinko-queue biolinko-ssr
php artisan queue:restart

echo "→ Nettoyage (garde les 5 dernières versions)"
ls -1dt "$ROOT"/releases/* | tail -n +6 | xargs -r rm -rf

echo "✓ Déployé : $RELEASE"
