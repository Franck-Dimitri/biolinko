#!/usr/bin/env bash
# Sauvegarde quotidienne : base MySQL + fichiers envoyés (logos, photos produits).
# Lit les identifiants dans le .env partagé. Garde BACKUP_KEEP_DAYS jours.
# Conseil : copier aussi BACKUP_DIR hors du serveur (rclone vers Google Drive / Backblaze).
set -euo pipefail

ENV_FILE=/var/www/biolinko/shared/.env
get() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e 's/[[:space:]]*#.*$//'; }

DIR="$(get BACKUP_DIR)"; DIR="${DIR:-/var/backups/biolinko}"
KEEP="$(get BACKUP_KEEP_DAYS)"; KEEP="${KEEP:-14}"
STAMP="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$DIR"
chmod 700 "$DIR"

# Mot de passe passé par fichier temporaire (jamais visible dans la liste des processus)
CNF="$(mktemp)"; trap 'rm -f "$CNF"' EXIT
printf '[client]\nuser=%s\npassword=%s\nhost=%s\nport=%s\n' "$(get DB_USERNAME)" "$(get DB_PASSWORD)" "$(get DB_HOST)" "$(get DB_PORT)" > "$CNF"

mysqldump --defaults-extra-file="$CNF" --single-transaction --quick --routines "$(get DB_DATABASE)" | gzip > "$DIR/db_$STAMP.sql.gz"
tar -czf "$DIR/uploads_$STAMP.tar.gz" -C /var/www/biolinko/shared/storage app/public

find "$DIR" -type f -mtime +"$KEEP" -delete
echo "[$(date -Is)] Sauvegarde OK : db_$STAMP.sql.gz, uploads_$STAMP.tar.gz"
